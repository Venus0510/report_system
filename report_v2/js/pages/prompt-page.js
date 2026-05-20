/**
 * prompt-page.js - 提示词生成页
 * 5步分步表单：基本信息 → 版式 → 风格 → 内容结构（版式自适应） → 数据源 → 生成提示词
 */
const PromptPage = {
  init(state) {
    // ---- 分步折叠状态 ----
    // 当前展开的步骤索引（0-4，-1 表示全部折叠）
    const expandedStep = Vue.ref(0);

    // ---- Step 4 数据：页面/节/区块列表 ----
    // 每项结构：{ id, name, outline, componentIds: [], slideCountHint: null, dataSourceType: 'global', dataSource: null }

    // 当前正在编辑的项（null 表示新增，非 null 表示编辑已有项）
    const editingItem = Vue.ref(null);
    const editingItemIndex = Vue.ref(-1);
    // 编辑表单数据
    const editForm = Vue.ref({ name: '', outline: '', componentIds: [], slideCountHint: null, dataSourceType: 'global' });

    // ---- Step 5 数据源 ----
    const globalDataSourceType = Vue.ref('placeholder');
    const csvPreview = Vue.ref([]);      // CSV 前5行预览
    const csvHeaders = Vue.ref([]);
    const jsonText = Vue.ref('');

    // ---- 生成模式 ----
    const generationMode = Vue.ref('skeleton'); // 'skeleton' | 'full'
    const skeletonOutline = Vue.ref('');       // 骨架模式下的粗略大纲

    // ---- 提示词 ----
    const generatedPrompt = Vue.ref('');
    const copySuccess = Vue.ref(false);

    // ================================================================
    // 计算属性
    // ================================================================

    /** 当前选中版式对象 */
    function currentLayout() {
      if (!state.selectedLayoutId) return null;
      return LAYOUTS_BY_ID[state.selectedLayoutId] || null;
    }

    /** 当前选中风格对象 */
    function currentStyle() {
      if (!state.selectedStyleId) return null;
      return STYLES_BY_ID[state.selectedStyleId] || null;
    }

    /** Step 4 的 UI 标签（根据版式动态变化） */
    function layoutLabels() {
      const layout = currentLayout();
      return layout ? layout.configLabels : LAYOUTS_BY_ID['a4-landscape'].configLabels;
    }

    // ================================================================
    // Step 1-3 方法
    // ================================================================

    function goToStep(step) {
      expandedStep.value = step;
    }

    function selectLayout(layoutId) {
      state.selectedLayoutId = layoutId;
    }

    function selectStyle(styleId) {
      state.selectedStyleId = styleId;
    }

    // ================================================================
    // Step 4 方法：页面/节/区块 增删改
    // ================================================================

    /** 打开新增表单 */
    function openAddItem() {
      editingItemIndex.value = -1;
      editForm.value = {
        name: '',
        outline: '',
        componentIds: [],
        slideCountHint: currentLayout() && currentLayout().category === 'slide' ? 'AI自行判断' : null,
        dataSourceType: 'global'
      };
      editingItem.value = { id: Date.now() };
    }

    /** 打开编辑表单 */
    function openEditItem(index) {
      editingItemIndex.value = index;
      const item = state.pages[index];
      editForm.value = {
        name: item.name || '',
        outline: item.outline || '',
        componentIds: item.componentIds ? [...item.componentIds] : [],
        slideCountHint: item.slideCountHint || null,
        dataSourceType: item.dataSourceType || 'global'
      };
      editingItem.value = { id: item.id };
    }

    /** 关闭编辑表单 */
    function closeEditForm() {
      editingItemIndex.value = -1;
      editingItem.value = null;
      editForm.value = { name: '', outline: '', componentIds: [], slideCountHint: null, dataSourceType: 'global' };
    }

    /** 切换组件选中状态 */
    function toggleComponent(componentId) {
      const ids = editForm.value.componentIds;
      const idx = ids.indexOf(componentId);
      if (idx >= 0) {
        ids.splice(idx, 1);
      } else {
        ids.push(componentId);
      }
    }

    /** 保存当前编辑项（新增或更新） */
    function saveItem() {
      const data = {
        name: editForm.value.name,
        outline: editForm.value.outline,
        componentIds: [...editForm.value.componentIds],
        slideCountHint: editForm.value.slideCountHint,
        dataSourceType: editForm.value.dataSourceType
      };

      if (editingItemIndex.value >= 0) {
        // 更新已有项
        const idx = editingItemIndex.value;
        data.id = state.pages[idx].id;
        state.pages[idx] = data;
      } else {
        // 新增
        data.id = Date.now();
        state.pages.push(data);
      }
      closeEditForm();
    }

    /** 删除一个页面/节/区块 */
    function removeItem(index) {
      state.pages.splice(index, 1);
      if (editingItemIndex.value === index) {
        closeEditForm();
      }
    }

    /** 上移一项 */
    function moveItemUp(index) {
      if (index > 0) {
        const temp = state.pages[index];
        state.pages[index] = state.pages[index - 1];
        state.pages[index - 1] = temp;
      }
    }

    /** 下移一项 */
    function moveItemDown(index) {
      if (index < state.pages.length - 1) {
        const temp = state.pages[index];
        state.pages[index] = state.pages[index + 1];
        state.pages[index + 1] = temp;
      }
    }

    /** 获取组件名称列表 */
    function getComponentNames(componentIds) {
      return componentIds.map(function (cid) {
        var comp = COMPONENTS_BY_ID[cid];
        return comp ? comp.name : cid;
      });
    }

    /** 获取组件缩略图 HTML */
    function getComponentPreview(componentId) {
      var comp = COMPONENTS_BY_ID[componentId];
      return comp ? comp.previewHTML : '';
    }

    // ================================================================
    // Step 5 方法：数据源
    // ================================================================

    /** 处理CSV文件上传 */
    function handleCSVUpload(event) {
      var file = event.target.files[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          csvHeaders.value = results.meta.fields || [];
          csvPreview.value = results.data.slice(0, 5);
          state.globalDataSource = {
            type: 'csv',
            filename: file.name,
            headers: csvHeaders.value,
            rows: results.data
          };
        },
        error: function (err) {
          state.toast = { show: true, type: 'error', message: 'CSV 解析失败：' + err.message };
          setTimeout(function () { state.toast.show = false; }, 3000);
        }
      });
    }

    /** 处理JSON文本输入 */
    function handleJSONInput() {
      try {
        var data = JSON.parse(jsonText.value);
        state.globalDataSource = {
          type: 'json',
          content: data
        };
        state.toast = { show: true, type: 'success', message: 'JSON 格式正确，已保存' };
        setTimeout(function () { state.toast.show = false; }, 2000);
      } catch (e) {
        state.toast = { show: true, type: 'error', message: 'JSON 格式错误：' + e.message };
        setTimeout(function () { state.toast.show = false; }, 3000);
      }
    }

    function setPlaceholderData() {
      state.globalDataSource = { type: 'placeholder', content: null };
      jsonText.value = '';
      csvPreview.value = [];
      csvHeaders.value = [];
    }

    // ================================================================
    // 提示词生成
    // ================================================================

    /** 生成完整提示词 */
    function generatePrompt() {
      var layout = currentLayout();
      var style = currentStyle();
      var configLabels = layoutLabels();
      var reportFileName = state.reportFileName || state.reportTopic || '未命名报告';

      if (generationMode.value === 'skeleton') {
        generatedPrompt.value = generateSkeletonPrompt(layout, style, reportFileName);
      } else {
        generatedPrompt.value = generateFullPrompt(layout, style, configLabels, reportFileName);
      }
      expandedStep.value = -1;
    }

    /** 骨架模式：仅结构 + 风格 + 粗略大纲，不填具体内容 */
    function generateSkeletonPrompt(layout, style, reportFileName) {
      var prompt = '你是金融报告HTML生成专家。请基于以下信息生成一个HTML报告骨架——仅搭建框架结构，用占位符替代具体内容，不要编造数据或长篇文案。\n\n';

      // 基本信息
      prompt += '【报告基本信息】\n';
      prompt += '- 报告文件名：' + reportFileName + '\n';
      prompt += '- 报告主题：' + (state.reportTopic || '未指定') + '\n';
      prompt += '- 受众：' + (state.audience || '未指定') + '\n';
      prompt += '- 用途：' + (state.purpose || '未指定') + '\n\n';

      // 版式要求
      if (layout) {
        prompt += '【版式要求】\n' + layout.aiPrompt.trim() + '\n\n';
      }

      // 风格要求
      if (style) {
        prompt += '【风格要求】\n' + style.aiPrompt.trim() + '\n\n';
      }

      // 收集选中组件（骨架模式从 editForm，完整模式从 state.pages，两者合并去重）
      var allComponentIds = [];
      function addIds(ids) {
        if (!ids) return;
        ids.forEach(function (cid) {
          if (allComponentIds.indexOf(cid) < 0) allComponentIds.push(cid);
        });
      }
      addIds(editForm.value.componentIds);
      state.pages.forEach(function (page) { addIds(page.componentIds); });
      if (allComponentIds.length > 0) {
        var componentSnippets = allComponentIds.map(function (cid) {
          var comp = COMPONENTS_BY_ID[cid];
          if (!comp) return '';
          return '组件：' + comp.name + '\n```html\n' + comp.htmlSnippet.trim() + '\n```';
        }).join('\n\n');
        prompt += '【组件参考 - 请严格参照以下组件的HTML结构和Tailwind类名风格】\n';
        prompt += componentSnippets + '\n\n';
      }

      // 粗略大纲
      var outlineText = skeletonOutline.value.trim();
      if (!outlineText && state.pages.length > 0) {
        // 兼容：如果用户在完整模式下配了页面但在骨架模式生成，用页面名拼一个大纲
        outlineText = state.pages.map(function (p, i) { return (i + 1) + '. ' + p.name; }).join('\n');
      }
      prompt += '【大致结构】\n';
      prompt += (outlineText || '请根据报告主题和受众，自行推断合理的报告结构') + '\n\n';

      // 数据源提示
      var hasData = state.globalDataSource && state.globalDataSource.type !== 'placeholder';
      if (hasData) {
        prompt += '【数据源】\n有数据文件已上传（骨架阶段暂不填充，仅占位标记）\n\n';
      }

      // 输出要求
      prompt += '【输出要求】\n';
      prompt += '0. 不要覆盖任何已有文件，必须保存为带时间戳的新文件\n';
      prompt += '1. 生成完整的HTML骨架，包含所有页面/区块的框架结构\n';
      prompt += '2. 每个页面/区块只放标题和占位标记如「[待补充]」或「[此处展示核心指标数据]」，不臆造具体内容\n';
      prompt += '3. 给每个页面/区块的顶层容器添加 data-section="区块名" 属性，这是后续填充的关键标识\n';
      prompt += '4. 严格应用指定的版式和风格，让用户能直观感受最终效果\n';
      prompt += '5. 如果指定了组件，按组件风格预留对应占位结构\n';
      prompt += '6. 兼容桌面/iPad/手机响应式\n';
      prompt += '7. 将HTML保存到文件：reports/' + reportFileName + '_v001_scaffold_' + Utils.timestamp() + '.html\n';
      prompt += '8. 直接输出HTML代码，不要任何解释文字';

      return prompt;
    }

    /** 完整模式：现有逻辑，一次性输出所有内容 */
    function generateFullPrompt(layout, style, configLabels, reportFileName) {

      // 收集所有被选中的组件ID
      var allComponentIds = [];
      state.pages.forEach(function (page) {
        if (page.componentIds) {
          page.componentIds.forEach(function (cid) {
            if (allComponentIds.indexOf(cid) < 0) {
              allComponentIds.push(cid);
            }
          });
        }
      });

      // 拼装组件代码片段
      var componentSnippets = allComponentIds.map(function (cid) {
        var comp = COMPONENTS_BY_ID[cid];
        if (!comp) return '';
        return '组件：' + comp.name + '\n```html\n' + comp.htmlSnippet.trim() + '\n```';
      }).join('\n\n');

      // 拼装页面结构描述（根据版式不同）
      var pageStructureText = '';
      if (layout && layout.category === 'slide') {
        pageStructureText = '整体演讲大纲：\n' + (state.pptOutline || '（用户未填写）') + '\n\n';
        pageStructureText += '各节内容：\n';
        state.pages.forEach(function (p, i) {
          pageStructureText += '第' + (i + 1) + '节：' + p.name + '\n';
          pageStructureText += '  内容要点：' + (p.outline || '无') + '\n';
          if (p.slideCountHint) {
            pageStructureText += '  建议拆为：' + p.slideCountHint + ' 页 slide\n';
          }
          pageStructureText += '  使用组件：' + getComponentNames(p.componentIds).join('、') + '\n\n';
        });
      } else if (layout && layout.category === 'web') {
        state.pages.forEach(function (p, i) {
          pageStructureText += '区块' + (i + 1) + '（' + p.name + '）：' + (p.outline || '无') + '\n';
          pageStructureText += '  使用组件：' + getComponentNames(p.componentIds).join('、') + '\n\n';
        });
      } else {
        state.pages.forEach(function (p, i) {
          pageStructureText += '第' + (i + 1) + '页：' + p.name + '\n';
          pageStructureText += '  内容概要：' + (p.outline || '无') + '\n';
          pageStructureText += '  使用组件：' + getComponentNames(p.componentIds).join('、') + '\n\n';
        });
      }

      // 数据源描述
      var dataSourceText = '占位数据（AI用示例数据填充）';
      if (state.globalDataSource && state.globalDataSource.type === 'csv') {
        dataSourceText = 'CSV文件：' + (state.globalDataSource.filename || '') + '\n';
        dataSourceText += '列名：' + (state.globalDataSource.headers || []).join(', ') + '\n';
        dataSourceText += '前几行预览：\n' + JSON.stringify((state.globalDataSource.rows || []).slice(0, 5), null, 2);
      } else if (state.globalDataSource && state.globalDataSource.type === 'json') {
        dataSourceText = 'JSON数据：\n' + JSON.stringify(state.globalDataSource.content, null, 2);
      }

      // 拼装最终提示词
      var version = state.pages.length > 0 ? state.pages[0].id % 1000 : 1;

      var prompt = '你是金融报告HTML生成专家。基于Tailwind CSS CDN生成专业HTML报告。\n\n';

      prompt += '【内容扩展要求】\n';
      prompt += '用户提供的内容大纲可能是简略、口语化的初步想法。你需要：\n';
      prompt += '1. 基于金融报告的专业语境，将粗略想法扩展为正式、结构化的报告文案\n';
      prompt += '2. "表现不错"应扩展为具体的数据描述维度和分析视角\n';
      prompt += '3. "放一些核心数据"应推断合理的指标类型和展示方式\n';
      prompt += '4. 对含糊描述，结合报告主题、受众和用途，推断并补全合理专业内容\n';
      prompt += '5. 不确定的具体数字用占位符如 [XX%] 或 [待填数据] 标记，不得编造\n';
      prompt += '6. 整体语气和措辞符合受众期待（高管汇报：精炼结论先行；培训：循序渐进；客户展示：亮点突出）\n\n';

      if (layout) {
        prompt += layout.aiPrompt.trim() + '\n\n';
      }

      if (style) {
        prompt += style.aiPrompt.trim() + '\n\n';
      }

      if (componentSnippets) {
        prompt += '【组件参考 - 请严格参照以下组件的HTML结构和Tailwind类名风格】\n';
        prompt += componentSnippets + '\n\n';
      }

      prompt += '【用户需求】\n';
      prompt += '- 报告文件名：' + reportFileName + '\n';
      prompt += '- 报告主题：' + (state.reportTopic || '未指定') + '\n';
      prompt += '- 受众：' + (state.audience || '未指定') + '\n';
      prompt += '- 用途：' + (state.purpose || '未指定') + '\n\n';
      prompt += '内容结构（版式：' + (layout ? layout.name : '未选择') + '）：\n';
      prompt += pageStructureText || '（用户未配置页面结构）\n\n';
      prompt += '数据源：\n' + dataSourceText + '\n\n';

      prompt += '【输出要求】\n';
      prompt += '0. 不要覆盖任何已有文件，必须保存为带时间戳的新文件\n';
      prompt += '1. 将生成的完整HTML保存到文件：reports/' + reportFileName + '_v001_' + Utils.timestamp() + '.html\n';
      prompt += '2. 输出完整HTML文件，基于Tailwind CSS CDN（<script src="https://cdn.tailwindcss.com"></script>）\n';
      prompt += '3. 兼容桌面端、iPad、手机端响应式\n';
      prompt += '4. 严格参照提供的组件代码风格，保持视觉一致性\n';
      prompt += '5. 给每个关键组件容器添加 data-cid="{组件id}" 属性\n';
      if (layout && layout.category === 'slide') {
        prompt += '6. PPT版式：根据每节内容量，合理拆分slide页数，确保每页信息密度适中\n';
      }
      prompt += '7. 不要输出解释，直接输出HTML代码\n';

      return prompt;
    }

    /** 复制提示词到剪贴板 */
    async function copyPrompt() {
      var success = await Utils.copyToClipboard(generatedPrompt.value);
      if (success) {
        copySuccess.value = true;
        state.toast = { show: true, type: 'success', message: '提示词已复制到剪贴板！请粘贴到 Claude 中生成 HTML。' };
        setTimeout(function () { copySuccess.value = false; state.toast.show = false; }, 3000);
      } else {
        state.toast = { show: true, type: 'error', message: '复制失败，请手动选择并复制。' };
        setTimeout(function () { state.toast.show = false; }, 2000);
      }
    }

    // ================================================================
    // 返回给主应用
    // ================================================================
    return {
      // 分步状态
      expandedStep,
      goToStep,

      // 版式/风格选择
      currentLayout,
      currentStyle,
      layoutLabels,
      selectLayout,
      selectStyle,

      // Step 4
      editingItem,
      editingItemIndex,
      editForm,
      openAddItem,
      openEditItem,
      closeEditForm,
      toggleComponent,
      saveItem,
      removeItem,
      moveItemUp,
      moveItemDown,
      getComponentNames,
      getComponentPreview,

      // Step 5
      globalDataSourceType,
      csvPreview,
      csvHeaders,
      jsonText,
      handleCSVUpload,
      handleJSONInput,
      setPlaceholderData,

      // 生成模式
      generationMode,
      skeletonOutline,

      // 提示词
      generatedPrompt,
      copySuccess,
      generatePrompt,
      copyPrompt
    };
  }
};
