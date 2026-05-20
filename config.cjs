/**
 * Claude Chat Manager 配置文件
 * 可以通过环境变量覆盖配置
 */

module.exports = {
  // 对话历史目录
  HISTORY_DIR: process.env.CHAT_HISTORY_DIR || './chat_history',

  // Web 服务器端口
  SERVER_PORT: parseInt(process.env.CHAT_SERVER_PORT || '3456'),

  // 时间窗口（分钟）
  TIME_WINDOW_MINUTES: parseInt(process.env.TIME_WINDOW || '10'),

  // 相似度阈值（0-1之间）
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.4'),

  // 文件分片大小限制（KB）
  MAX_FILE_SIZE_KB: parseInt(process.env.MAX_FILE_SIZE || '500'),

  // 会话清理时间（小时）
  SESSION_CLEANUP_HOURS: parseInt(process.env.SESSION_CLEANUP || '24'),

  // 项目发现路径（用于多项目管理）
  PROJECT_SEARCH_PATHS: process.env.PROJECT_SEARCH_PATHS
    ? process.env.PROJECT_SEARCH_PATHS.split(':')
    : [
        process.cwd(),
        process.env.HOME ? `${process.env.HOME}/projects` : null
      ].filter(Boolean),

  // 获取项目根目录
  getProjectDir() {
    return process.env.CLAUDE_PROJECT_DIR || process.cwd();
  },

  // 获取历史目录的绝对路径
  getHistoryDir() {
    const historyDir = this.HISTORY_DIR;
    if (path.isAbsolute(historyDir)) {
      return historyDir;
    }
    return path.join(this.getProjectDir(), historyDir);
  }
};

const path = require('path');
