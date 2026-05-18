/**
 * preview-page.js - 预览修改页
 * 版本管理 / iframe 预览 / 元素检查器 / 修改意见生成
 */
const PreviewPage = {
  init(state) {
    // ---- 版本管理 ----
    const versionList = Vue.ref([]);
    const currentVersionFile = Vue.ref(null);
    const loadingVersion = Vue.ref(false);

    // ---- HTML 编辑 ----
    const htmlSource = Vue.ref('');

    // ---- 预览 ----
    const devicePreview = Vue.ref('desktop');
    const inspectorEnabled = Vue.ref(true);
    const highlightedLine = Vue.ref(-1);
    const iframeRef = Vue.ref(null);

    // ---- 修改意见 ----
    const modifyInstruction = Vue.ref('');
    const regeneratedPrompt = Vue.ref('');
    const modifyCopySuccess = Vue.ref(false);

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

    /** 刷新版本列表 */
    async function refreshVersionList() {
      try {
        var resp = await fetch('/api/reports');
        var data = await resp.json();
        // 按当前报告文件名过滤
        var baseName = state.reportFileName || state.reportTopic || '';
        if (baseName) {
          versionList.value = (data.files || []).filter(function (f) {
            return f.baseName === baseName;
          });
        } else {
          versionList.value = data.files || [];
        }
      } catch (e) {
        console.error('获取版本列表失败：', e);
        state.toast = { show: true, type: 'error', message: '获取版本列表失败，请确认服务已启动' };
        setTimeout(function () { state.toast.show = false; }, 3000);
      }
    }

    /** 加载某个版本 */
    async function loadVersion(filename) {
      loadingVersion.value = true;
      try {
        var resp = await fetch('/api/reports/' + encodeURIComponent(filename));
        if (!resp.ok) throw new Error('文件不存在');
        var content = await resp.text();
        htmlSource.value = content;
        currentVersionFile.value = filename;
        updatePreview(content);
      } catch (e) {
        state.toast = { show: true, type: 'error', message: '加载失败：' + e.message };
        setTimeout(function () { state.toast.show = false; }, 3000);
      } finally {
        loadingVersion.value = false;
      }
    }

    /** 保存当前编辑内容 */
    async function saveCurrentVersion() {
      var filename = currentVersionFile.value;
      if (!filename) {
        // 新建文件
        var baseName = state.reportFileName || '新报告';
        filename = baseName + '_manual_' + Utils.timestamp() + '.html';
      }
      try {
        var resp = await fetch('/api/reports/' + encodeURIComponent(filename), {
          method: 'POST',
          body: htmlSource.value
        });
        if (resp.ok) {
          currentVersionFile.value = filename;
          state.toast = { show: true, type: 'success', message: '已保存：' + filename };
          setTimeout(function () { state.toast.show = false; }, 2000);
          await refreshVersionList();
        }
      } catch (e) {
        state.toast = { show: true, type: 'error', message: '保存失败：' + e.message };
        setTimeout(function () { state.toast.show = false; }, 3000);
      }
    }

    // ================================================================
    // 预览
    // ================================================================

    /** 更新 iframe 预览 */
    function updatePreview(html) {
      if (!html) return;
      // 注入检查器脚本
      var finalHTML = html;
      if (inspectorEnabled.value) {
        finalHTML = html.replace('</body>', INSPECTOR_SCRIPT + '</body>');
        // 如果没有 </body>，追加到末尾
        if (finalHTML === html) {
          finalHTML = html + INSPECTOR_SCRIPT;
        }
      }
      // 通过 ref 更新 iframe
      if (iframeRef.value) {
        iframeRef.value.srcdoc = finalHTML;
      }
    }

    /** 手动触发预览（textarea 编辑后） */
    function manualPreview() {
      updatePreview(htmlSource.value);
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
      var index = htmlSource.value.indexOf(searchText);
      if (index === -1) return;

      // 计算行号（简单方案：数换行符）
      var before = htmlSource.value.substring(0, index);
      var lineNum = (before.match(/\n/g) || []).length + 1;
      highlightedLine.value = lineNum;

      // 滚动编辑器到对应行
      var editor = document.getElementById('html-editor');
      if (editor) {
        // 简单估算：每行约 20px
        var lineHeight = 20;
        editor.scrollTop = Math.max(0, (lineNum - 5) * lineHeight);
      }

      // 2 秒后取消高亮
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

      regeneratedPrompt.value =
        '请基于以下现有HTML代码进行修改。\n\n' +
        '【修改要求】\n' + modifyInstruction.value + '\n\n' +
        '【现有HTML代码】\n' + htmlSource.value + '\n\n' +
        '【输出要求】\n' +
        '1. 将修改后的HTML保存到文件：reports/' + filename + '\n' +
        '2. 直接输出完整HTML代码，不要解释\n' +
        '3. 保持原有的 data-cid 属性不变';
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
    // 返回给主应用
    // ================================================================
    return {
      versionList,
      currentVersionFile,
      loadingVersion,
      refreshVersionList,
      loadVersion,
      saveCurrentVersion,

      htmlSource,
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
      copyModifyPrompt
    };
  }
};
