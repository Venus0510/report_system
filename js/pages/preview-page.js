/**
 * preview-page.js - 预览修改页
 * 版本管理 / iframe 预览 / 元素检查器 / 修改意见生成
 */
const PreviewPage = {
  init(state) {
    // ---- 文件管理 ----
    const fsApiSupported = Vue.ref(typeof window.showOpenFilePicker === 'function');
    const versionList = Vue.ref([]);      // 已打开过的文件历史（仅内存）
    const currentVersionFile = Vue.ref(null);
    const loadingVersion = Vue.ref(false);

    // ---- HTML 编辑 ----
    const htmlSource = Vue.ref('');
    var codeEditor = null;  // Fix 3: CodeMirror 实例引用

    // ---- 预览 ----
    const devicePreview = Vue.ref('desktop');
    const inspectorEnabled = Vue.ref(true);
    const highlightedLine = Vue.ref(-1);
    const iframeRef = Vue.ref(null);

    // ---- 修改意见 ----
    const modifyInstruction = Vue.ref('');
    const regeneratedPrompt = Vue.ref('');
    const modifyCopySuccess = Vue.ref(false);

    // ---- 逐模块填充 ----
    const sections = Vue.ref([]);            // 从 HTML 中提取的 data-section 列表
    const fillSection = Vue.ref('');         // 当前选中要填充的区块名
    const fillSectionContent = Vue.ref('');  // 用户对该区块的内容描述
    const fillSectionPrompt = Vue.ref('');   // 生成的区块填充 prompt
    const fillCopySuccess = Vue.ref(false);

    // ---- iframe 内注入的检查器脚本 ----
    const INSPECTOR_SCRIPT = `
<script>
(function() {
  var overlay = null;
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = '__inspector_overlay__';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid #3b82f6;background:rgba(59,130,246,0.08);transition:all 0.12s ease;display:none;border-radius:3px;';
    document.body.appendChild(overlay);
  }
  document.addEventListener('mouseover', function(e) {
    if (e.target.id === '__inspector_overlay__') return;
    if (!overlay) createOverlay();
    var t = e.target;
    if (t === document.body || t === document.documentElement) {
      overlay.style.display = 'none';
      return;
    }
    var r = t.getBoundingClientRect();
    overlay.style.left = r.left + 'px';
    overlay.style.top = r.top + 'px';
    overlay.style.width = r.width + 'px';
    overlay.style.height = r.height + 'px';
    overlay.style.display = 'block';
  });
  document.addEventListener('mouseout', function() {
    if (overlay) overlay.style.display = 'none';
  });
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var t = e.target;
    if (t.id === '__inspector_overlay__') return;
    var cid = t.getAttribute('data-cid') || (t.closest('[data-cid]') ? t.closest('[data-cid]').getAttribute('data-cid') : '');
    var text = (t.textContent || '').trim().substring(0, 80);
    var outer = t.outerHTML.substring(0, 300);
    window.parent.postMessage({
      type: 'element-selected',
      data: { cid: cid, textSnippet: text, outerSnippet: outer }
    }, '*');
  }, true);
})();
<\/script>`;

    // ================================================================
    // 版本管理
    // ================================================================

    /** 打开文件：浏览器原生文件选择器，选单个 .html */
    async function openFile() {
      try {
        var handles = await window.showOpenFilePicker({
          types: [{ description: 'HTML文件', accept: { 'text/html': ['.html', '.htm'] } }],
          multiple: false
        });
        var fileHandle = handles[0];
        var file = await fileHandle.getFile();
        var content = await file.text();

        var entry = {
          name: fileHandle.name,
          baseName: ReportFS._parseVersion(fileHandle.name).baseName,
          version: ReportFS._parseVersion(fileHandle.name).version,
          timestamp: ReportFS._parseVersion(fileHandle.name).timestamp,
          size: file.size,
          modified: ReportFS._formatDate(file.lastModified),
          handle: fileHandle
        };

        // 去重插入到历史最前面
        versionList.value = versionList.value.filter(function (f) { return f.name !== entry.name; });
        versionList.value.unshift(entry);
        if (versionList.value.length > 20) versionList.value.pop();

        _applyLoadedContent(content, fileHandle.name);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('打开文件失败：', e);
          state.toast = { show: true, type: 'error', message: '打开失败：' + e.message };
          setTimeout(function () { state.toast.show = false; }, 3000);
        }
      }
    }

    /** 内部共用：应用已读取的内容到编辑器+预览 */
    function _applyLoadedContent(content, filename) {
      setEditorContent(content);
      currentVersionFile.value = filename;
      extractSections();
      updatePreview(content);
    }

    /** 点击历史标签：尝试用存储的句柄直接读取 */
    async function loadHistoryFile(entry) {
      if (!entry || !entry.handle) {
        // 降级：打开文件选择器
        await openFile();
        return;
      }
      loadingVersion.value = true;
      try {
        // 检查权限，必要时请求
        var perm = await entry.handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') {
          perm = await entry.handle.requestPermission({ mode: 'read' });
        }
        if (perm === 'granted') {
          var file = await entry.handle.getFile();
          var content = await file.text();
          _applyLoadedContent(content, entry.name);
        } else {
          await openFile();
        }
      } catch (e) {
        console.error('历史文件加载失败，fallback 到选择器：', e);
        await openFile();
      } finally {
        loadingVersion.value = false;
      }
    }

    /** 另存为新文件（始终创建新文件，不覆盖） */
    async function saveCurrentVersion() {
      try {
        var baseName = state.reportFileName || '新报告';
        var suggestedName = Utils.reportFilename(baseName, nextVersion());

        var fileHandle = await window.showSaveFilePicker({
          suggestedName: suggestedName,
          types: [{ description: 'HTML文件', accept: { 'text/html': ['.html'] } }]
        });

        var writable = await fileHandle.createWritable();
        await writable.write(codeEditor ? codeEditor.getValue() : htmlSource.value);
        await writable.close();

        currentVersionFile.value = fileHandle.name;

        // 加入历史
        var entry = {
          name: fileHandle.name,
          baseName: ReportFS._parseVersion(fileHandle.name).baseName,
          version: ReportFS._parseVersion(fileHandle.name).version,
          timestamp: ReportFS._parseVersion(fileHandle.name).timestamp,
          size: new Blob([htmlSource.value]).size,
          modified: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        versionList.value = versionList.value.filter(function (f) { return f.name !== entry.name; });
        versionList.value.unshift(entry);
        if (versionList.value.length > 20) versionList.value.pop();

        state.toast = { show: true, type: 'success', message: '已保存：' + fileHandle.name };
        setTimeout(function () { state.toast.show = false; }, 2000);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('保存失败：', e);
          state.toast = { show: true, type: 'error', message: '保存失败：' + e.message };
          setTimeout(function () { state.toast.show = false; }, 3000);
        }
      }
    }

    // ================================================================
    // 预览
    // ================================================================

    /** 更新 iframe 预览 */
    function updatePreview(html) {
      if (!html || !iframeRef.value) return;

      // 保存滚动位置
      var scrollY = 0;
      try { scrollY = iframeRef.value.contentWindow.scrollY; } catch (e) {}

      // 注入检查器脚本
      var finalHTML = html;
      if (inspectorEnabled.value) {
        finalHTML = html.replace('</body>', INSPECTOR_SCRIPT + '</body>');
        if (finalHTML === html) {
          finalHTML = html + INSPECTOR_SCRIPT;
        }
      }

      iframeRef.value.srcdoc = finalHTML;

      // 恢复滚动位置
      var targetY = scrollY;
      setTimeout(function () {
        try { iframeRef.value.contentWindow.scrollTo(0, targetY); } catch (e) {}
      }, 80);
    }

    // Fix 2: 检查器开关变化时自动重渲预览
    Vue.watch(inspectorEnabled, function () {
      if (htmlSource.value) updatePreview(htmlSource.value);
    });

    /** 手动触发预览（textarea 编辑后） */
    function manualPreview() {
      if (codeEditor) htmlSource.value = codeEditor.getValue();
      updatePreview(htmlSource.value);
      extractSections();
    }

    // Fix 3: CodeMirror 编辑器
    /** 初始化 CodeMirror 实例 */
    function initCodeEditor() {
      var container = document.getElementById('html-editor');
      if (!container || codeEditor) return;
      // CodeMirror 可能尚未加载
      if (typeof CodeMirror === 'undefined') return;

      codeEditor = CodeMirror(container, {
        value: htmlSource.value || '',
        mode: 'htmlmixed',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        indentUnit: 2,
        extraKeys: { 'Ctrl-S': function () { saveCurrentVersion(); } }
      });

      codeEditor.on('change', function () {
        htmlSource.value = codeEditor.getValue();
      });

      // 初始加载已有内容
      if (htmlSource.value) {
        codeEditor.setValue(htmlSource.value);
      }
    }

    /** 将外部内容同步到 CodeMirror */
    function setEditorContent(content) {
      htmlSource.value = content;
      if (codeEditor) {
        codeEditor.setValue(content);
        codeEditor.refresh();
      }
    }

    /** 滚动 CodeMirror 到指定行并高亮 */
    function scrollEditorToLine(lineNum) {
      if (!codeEditor) return;
      codeEditor.scrollIntoView({ line: lineNum - 1, ch: 0 }, 60);
      codeEditor.addLineClass(lineNum - 1, 'background', 'code-line-highlight');
      setTimeout(function () {
        codeEditor.removeLineClass(lineNum - 1, 'background', 'code-line-highlight');
      }, 2000);
    }

    /** 图片src直接设置 */
    function getPreviewFrameSrc() {
      return null; // 使用 srcdoc 模式
    }

    /** 设备宽度 */
    function previewWidth() {
      if (devicePreview.value === 'ipad') return '768px';
      if (devicePreview.value === 'mobile') return '375px';
      return '100%';
    }

    function setDevice(device) {
      devicePreview.value = device;
    }

    // ================================================================
    // 元素检查器：接收 iframe 消息
    // ================================================================

    /** 在 HTML 源码中搜索并定位 */
    function searchAndLocate(searchText) {
      var source = codeEditor ? codeEditor.getValue() : htmlSource.value;
      var index = source.indexOf(searchText);
      if (index === -1) return;

      var before = source.substring(0, index);
      var lineNum = (before.match(/\n/g) || []).length + 1;
      highlightedLine.value = lineNum;

      if (codeEditor) {
        scrollEditorToLine(lineNum);
      } else {
        var editor = document.getElementById('html-editor');
        if (editor) {
          editor.scrollTop = Math.max(0, (lineNum - 5) * 20);
        }
      }

      setTimeout(function () {
        highlightedLine.value = -1;
      }, 2000);
    }

    /** 初始化 iframe 消息监听 */
    function initInspectorListener() {
      window.addEventListener('message', function (event) {
        if (!event.data || event.data.type !== 'element-selected') return;
        var d = event.data.data;

        // 策略1：按 data-cid 搜索
        if (d.cid) {
          searchAndLocate('data-cid="' + d.cid + '"');
          return;
        }

        // 策略2：按文本片段搜索
        if (d.textSnippet && d.textSnippet.length > 10) {
          searchAndLocate(d.textSnippet.substring(0, 30));
          return;
        }

        // 策略3：按 HTML 特征搜索
        if (d.outerSnippet) {
          searchAndLocate(d.outerSnippet.substring(0, 80));
        }
      });
    }

    // ================================================================
    // 修改意见
    // ================================================================

    /** 计算下一个版本号 */
    function nextVersion() {
      var maxVer = 0;
      versionList.value.forEach(function (f) { if (f.version > maxVer) maxVer = f.version; });
      return maxVer + 1;
    }

    /** 生成续写修改指令 */
    function generateModifyPrompt() {
      if (!modifyInstruction.value.trim()) return;

      var baseName = state.reportFileName || '报告';
      var ver = nextVersion();
      var filename = Utils.reportFilename(baseName, ver);

      // Fix 4: 优先引用文件路径，不嵌入完整HTML
      if (currentVersionFile.value) {
        regeneratedPrompt.value =
          '请读取文件 reports/' + currentVersionFile.value + '\n\n' +
          '【修改要求】\n' + modifyInstruction.value + '\n\n' +
          '【输出要求】\n' +
          '0. 不要覆盖原文件，必须保存为带时间戳的新文件\n' +
          '1. 将修改后的HTML保存为新版本：reports/' + filename + '\n' +
          '2. 直接输出完整HTML代码，不要解释\n' +
          '3. 保持原有的 data-cid 属性不变';
      } else {
        regeneratedPrompt.value =
          '请基于以下HTML代码进行修改。\n\n' +
          '【修改要求】\n' + modifyInstruction.value + '\n\n' +
          '【当前HTML】\n' + htmlSource.value + '\n\n' +
          '【输出要求】\n' +
          '0. 不要覆盖原文件，必须保存为带时间戳的新文件\n' +
          '1. 将修改后的HTML保存到文件：reports/' + filename + '\n' +
          '2. 直接输出完整HTML代码，不要解释\n' +
          '3. 保持原有的 data-cid 属性不变';
      }
    }

    /** 复制修改指令 */
    async function copyModifyPrompt() {
      generateModifyPrompt();
      if (!regeneratedPrompt.value) return;
      var success = await Utils.copyToClipboard(regeneratedPrompt.value);
      if (success) {
        modifyCopySuccess.value = true;
        state.toast = { show: true, type: 'success', message: '修改指令已复制！请粘贴到 Claude 继续对话' };
        setTimeout(function () { modifyCopySuccess.value = false; state.toast.show = false; }, 3000);
      }
    }

    // ================================================================
    // 逐模块填充
    // ================================================================

    /** 从当前 HTML 中提取所有 data-section 值 */
    function extractSections() {
      var html = htmlSource.value;
      if (!html) { sections.value = []; return; }
      var seen = {};
      var result = [];
      var regex = /data-section="([^"]+)"/g;
      var match;
      while ((match = regex.exec(html)) !== null) {
        var name = match[1];
        if (!seen[name]) {
          seen[name] = true;
          result.push(name);
        }
      }
      sections.value = result;
      if (result.length > 0 && !fillSection.value) {
        fillSection.value = result[0];
      }
    }

    /** 生成针对某个区块的填充提示词 */
    function generateSectionFillPrompt() {
      if (!fillSection.value || !fillSectionContent.value.trim()) return;

      var baseName = state.reportFileName || '报告';
      var ver = nextVersion();
      var filename = Utils.reportFilename(baseName, ver);

      // Fix 4: 优先引用文件路径，不嵌入完整HTML
      if (currentVersionFile.value) {
        fillSectionPrompt.value =
          '请读取文件 reports/' + currentVersionFile.value + '\n\n' +
          '仅修改和填充「' + fillSection.value + '」这个区块的内容，保持其他所有部分完全不变。\n\n' +
          '【对「' + fillSection.value + '」的填充要求】\n' + fillSectionContent.value + '\n\n' +
          '【输出要求】\n' +
          '0. 不要覆盖原文件，必须保存为带时间戳的新文件\n' +
          '1. 只修改包含 data-section="' + fillSection.value + '" 的容器内部内容\n' +
          '2. 保持容器以外的所有HTML完全不变，其他区块一个字都不要改\n' +
          '3. 使用与现有页面一致的组件风格和Tailwind类名\n' +
          '4. 不确定的具体数字用 [XX] 或 [待确认] 标记，不要编造\n' +
          '5. 将修改后的HTML保存为新版本：reports/' + filename + '\n' +
          '6. 直接输出完整HTML代码，不要解释';
      } else {
        fillSectionPrompt.value =
          '请基于以下HTML，仅修改和填充「' + fillSection.value + '」这个区块的内容，保持其他所有部分完全不变。\n\n' +
          '【当前HTML】\n' + htmlSource.value + '\n\n' +
          '【对「' + fillSection.value + '」的填充要求】\n' + fillSectionContent.value + '\n\n' +
          '【输出要求】\n' +
          '0. 不要覆盖原文件，必须保存为带时间戳的新文件\n' +
          '1. 只修改包含 data-section="' + fillSection.value + '" 的容器内部内容\n' +
          '2. 保持容器以外的所有HTML完全不变，其他区块一个字都不要改\n' +
          '3. 使用与现有页面一致的组件风格和Tailwind类名\n' +
          '4. 不确定的具体数字用 [XX] 或 [待确认] 标记，不要编造\n' +
          '5. 将修改后的HTML保存到文件：reports/' + filename + '\n' +
          '6. 直接输出完整HTML代码，不要解释';
      }
    }

    /** 复制区块填充指令 */
    async function copySectionFillPrompt() {
      generateSectionFillPrompt();
      if (!fillSectionPrompt.value) return;
      var success = await Utils.copyToClipboard(fillSectionPrompt.value);
      if (success) {
        fillCopySuccess.value = true;
        state.toast = { show: true, type: 'success', message: '填充指令已复制！请粘贴到 Claude 继续对话' };
        setTimeout(function () { fillCopySuccess.value = false; state.toast.show = false; }, 3000);
      }
    }

    // ================================================================
    // 返回给主应用
    // ================================================================
    return {
      fsApiSupported,
      openFile,
      saveCurrentVersion,
      loadHistoryFile,

      versionList,
      currentVersionFile,
      loadingVersion,

      htmlSource,
      initCodeEditor,
      setEditorContent,
      manualPreview,

      devicePreview,
      previewWidth,
      setDevice,
      iframeRef,
      inspectorEnabled,

      highlightedLine,
      initInspectorListener,

      modifyInstruction,
      regeneratedPrompt,
      modifyCopySuccess,
      generateModifyPrompt,
      copyModifyPrompt,

      sections,
      fillSection,
      fillSectionContent,
      fillSectionPrompt,
      fillCopySuccess,
      extractSections,
      generateSectionFillPrompt,
      copySectionFillPrompt
    };
  }
};
