/**
 * filesystem.js - File System Access API 封装
 * 替代 Python server.py 的文件 CRUD，浏览器直接读写本地 reports 目录
 * 依赖：Chrome / Edge 等支持 File System Access API 的浏览器
 */

var ReportFS = {
  dirHandle: null,

  /** 检测浏览器是否支持 */
  isSupported() {
    return typeof window.showDirectoryPicker === 'function';
  },

  /** 弹出目录选择器，用户手动选择 reports 目录 */
  async selectDirectory() {
    try {
      this.dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await this._persistHandle(this.dirHandle);
      return this.dirHandle.name;
    } catch (e) {
      if (e.name === 'AbortError') return null; // 用户取消
      console.error('选择目录失败：', e);
      throw e;
    }
  },

  /** 从 IndexedDB 恢复目录句柄并重新申请权限 */
  async restoreDirectory() {
    if (this.dirHandle) return this.dirHandle.name;
    var handle = await this._loadHandle();
    if (!handle) return null;

    var current = await handle.queryPermission({ mode: 'readwrite' });
    if (current !== 'granted') {
      return null; // 需要用户点击触发 requestPermission
    }

    this.dirHandle = handle;
    return handle.name;
  },

  /** 重新申请已有句柄的权限（必须由用户手势触发） */
  async requestPermission() {
    var handle = await this._loadHandle();
    if (!handle) return false;
    try {
      var result = await handle.requestPermission({ mode: 'readwrite' });
      if (result === 'granted') {
        this.dirHandle = handle;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  /** 检查是否有已存储的句柄 */
  async hasStoredHandle() {
    var handle = await this._loadHandle();
    return handle !== null;
  },

  // ---- CRUD 操作 ----

  /** 列出目录下所有 .html 文件 */
  async listReports() {
    if (!this.dirHandle) throw new Error('未选择目录');
    var files = [];
    for await (var entry of this.dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.html')) {
        var file = await entry.getFile();
        var parsed = this._parseVersion(entry.name);
        files.push({
          name: entry.name,
          baseName: parsed.baseName,
          version: parsed.version,
          timestamp: parsed.timestamp,
          size: file.size,
          modified: this._formatDate(file.lastModified)
        });
      }
    }
    files.sort(function (a, b) {
      if (a.modified > b.modified) return -1;
      if (a.modified < b.modified) return 1;
      return 0;
    });
    return files;
  },

  /** 读取某个 .html 文件的内容 */
  async readReport(filename) {
    if (!this.dirHandle) throw new Error('未选择目录');
    try {
      var fileHandle = await this.dirHandle.getFileHandle(filename);
      var file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      if (e.name === 'NotFoundError') return null;
      throw e;
    }
  },

  /** 保存内容到文件（创建或覆盖） */
  async saveReport(filename, content) {
    if (!this.dirHandle) throw new Error('未选择目录');
    var fileHandle = await this.dirHandle.getFileHandle(filename, { create: true });
    var writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  },

  /** 删除文件 */
  async deleteReport(filename) {
    if (!this.dirHandle) throw new Error('未选择目录');
    await this.dirHandle.removeEntry(filename);
  },

  // ---- 内部方法 ----

  _parseVersion(filename) {
    var nameNoExt = filename.replace(/\.html$/i, '');
    var match = nameNoExt.match(/^(.+)_v(\d+)_(\d{8}_\d{4})$/);
    if (match) return { baseName: match[1], version: parseInt(match[2], 10), timestamp: match[3] };
    var match2 = nameNoExt.match(/^(.+)_v(\d+)$/);
    if (match2) return { baseName: match2[1], version: parseInt(match2[2], 10), timestamp: '' };
    return { baseName: nameNoExt, version: 0, timestamp: '' };
  },

  _formatDate(ms) {
    var d = new Date(ms);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  },

  _persistHandle(handle) {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open('ReportFS', 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore('handles');
      };
      req.onsuccess = function () {
        var db = req.result;
        var tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(handle, 'reportsDir');
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      };
      req.onerror = function () { reject(req.error); };
    });
  },

  _loadHandle() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open('ReportFS', 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore('handles');
      };
      req.onsuccess = function () {
        var db = req.result;
        var tx = db.transaction('handles', 'readonly');
        var getReq = tx.objectStore('handles').get('reportsDir');
        getReq.onsuccess = function () {
          db.close();
          resolve(getReq.result || null);
        };
        getReq.onerror = function () { db.close(); reject(getReq.error); };
      };
      req.onerror = function () { reject(req.error); };
    });
  }
};

window.ReportFS = ReportFS;
