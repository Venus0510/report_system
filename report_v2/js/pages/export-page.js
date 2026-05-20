/**
 * export-page.js - 导出下载页
 * 下载 HTML / 复制源码 / 打印为 PDF / 导出前检查清单
 */
const ExportPage = {
  init(state) {
    const exportFilename = Vue.ref('');
    const exportFormat = Vue.ref('html');
    const checklistConfirmed = Vue.ref(false);

    /** 初始化导出文件名 */
    function initExportFilename() {
      if (!exportFilename.value) {
        var base = state.reportFileName || state.reportTopic || '报告';
        exportFilename.value = base + '_final.html';
      }
    }

    /** 下载 HTML 文件 */
    function downloadHTML() {
      if (!state.htmlSource) {
        state.toast = { show: true, type: 'error', message: '没有可导出的 HTML 内容。请先生成或加载报告。' };
        setTimeout(function () { state.toast.show = false; }, 3000);
        return;
      }
      var filename = exportFilename.value || 'report.html';
      Utils.downloadFile(state.htmlSource, filename);
      state.toast = { show: true, type: 'success', message: '正在下载：' + filename };
      setTimeout(function () { state.toast.show = false; }, 2000);
    }

    /** 复制源码到剪贴板 */
    async function copySource() {
      if (!state.htmlSource) {
        state.toast = { show: true, type: 'error', message: '没有可复制的 HTML 内容。' };
        setTimeout(function () { state.toast.show = false; }, 3000);
        return;
      }
      var success = await Utils.copyToClipboard(state.htmlSource);
      if (success) {
        state.toast = { show: true, type: 'success', message: 'HTML 源码已复制到剪贴板！' };
      } else {
        state.toast = { show: true, type: 'error', message: '复制失败，请手动选择复制。' };
      }
      setTimeout(function () { state.toast.show = false; }, 2000);
    }

    /** 打印为 PDF */
    function printToPDF() {
      if (!state.htmlSource) {
        state.toast = { show: true, type: 'error', message: '没有可打印的内容。请先生成或加载报告。' };
        setTimeout(function () { state.toast.show = false; }, 3000);
        return;
      }
      // 先更新预览，再调起打印
      if (previewMethods && previewMethods.updatePreview) {
        previewMethods.updatePreview(state.htmlSource);
      }

      // 通过 iframe 打印
      var iframe = document.getElementById('preview-iframe');
      if (iframe && iframe.contentWindow) {
        setTimeout(function () {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 300);
      } else {
        // 降级方案：创建临时 iframe
        var tempIframe = document.createElement('iframe');
        tempIframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;';
        document.body.appendChild(tempIframe);
        tempIframe.srcdoc = state.htmlSource;
        tempIframe.onload = function () {
          setTimeout(function () {
            tempIframe.contentWindow.focus();
            tempIframe.contentWindow.print();
          }, 300);
        };
        // 打印完成后移除
        setTimeout(function () {
          document.body.removeChild(tempIframe);
        }, 60000);
      }
    }

    /** 获取当前版式名称（用于打印提示） */
    function currentLayoutName() {
      if (state.selectedLayoutId && LAYOUTS_BY_ID[state.selectedLayoutId]) {
        return LAYOUTS_BY_ID[state.selectedLayoutId].name;
      }
      return '未知';
    }

    /** 是否为 A4 版式 */
    function isA4Layout() {
      return state.selectedLayoutId === 'a4-landscape';
    }

    return {
      exportFilename,
      exportFormat,
      checklistConfirmed,
      initExportFilename,
      downloadHTML,
      copySource,
      printToPDF,
      currentLayoutName,
      isA4Layout
    };
  }
};
