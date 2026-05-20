/**
 * utils.js - 公共工具函数
 * 所有工具函数挂载到全局对象 Utils 下，供其他模块调用
 */

var Utils = {
  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否复制成功
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降级方案：创建临时 textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  /**
   * 触发浏览器下载文件
   * @param {string} content - 文件内容
   * @param {string} filename - 文件名
   */
  downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 防抖函数
   * @param {Function} fn - 要防抖的函数
   * @param {number} delay - 延迟毫秒数
   * @returns {Function} 防抖后的函数
   */
  debounce(fn, delay = 500) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * 生成时间戳字符串，格式 YYYYMMDD_HHMM
   * @returns {string}
   */
  timestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  },

  /**
   * 获取版本号字符串，如 "v003"
   * @param {number} version
   * @returns {string}
   */
  versionStr(version) {
    return 'v' + String(version).padStart(3, '0');
  },

  /**
   * 生成报告文件名
   * @param {string} baseName - 基础名称
   * @param {number} version - 版本号
   * @returns {string}
   */
  reportFilename(baseName, version) {
    return `${baseName}_${Utils.versionStr(version)}_${Utils.timestamp()}.html`;
  },

  /**
   * 格式化文件大小
   * @param {number} bytes
   * @returns {string} 人类可读的文件大小
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  /**
   * 安全获取对象的嵌套属性
   * @param {Object} obj
   * @param {string} path - 属性路径，如 'a.b.c'
   * @param {*} defaultValue
   * @returns {*}
   */
  get(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null || typeof result !== 'object') return defaultValue;
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  }
};

// 显式挂到 window，确保 Vue 模板 / IIFE 中都能可靠访问
window.Utils = Utils;
