const fs = require('fs');
const path = require('path');
const config = require('../../config.cjs');

const STATE_FILE = path.join(
  config.getHistoryDir(),
  '.session-state.json'
);

/**
 * 读取会话状态
 */
function readSessionState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取会话状态失败:', e.message);
  }
  return null;
}

/**
 * 保存会话状态
 */
function saveSessionState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('保存会话状态失败:', e.message);
  }
}

/**
 * 获取或创建会话 ID
 */
function getOrCreateSession(sessionId) {
  const existingState = readSessionState();

  console.log(`[调试] getOrCreateSession - 传入 sessionId: ${sessionId}`);
  console.log(`[调试] getOrCreateSession - 现有状态:`, existingState ? {
    sessionId: existingState.sessionId,
    currentFile: existingState.currentFile ? path.basename(existingState.currentFile) : null,
    currentTopic: existingState.currentTopic
  } : null);

  if (!existingState || existingState.sessionId !== sessionId) {
    console.log(`[调试] getOrCreateSession - 创建新状态`);
    const state = {
      sessionId: sessionId,
      startTime: new Date().toISOString(),
      promptCount: 0,
      responseCount: 0,
      currentFile: null,
      currentTopic: null,     // 当前任务主题
      currentPart: 1,          // 当前 part 编号
      filePaths: [],          // 已处理的文件路径
      lastActivity: new Date().toISOString()
    };
    return state;
  }

  console.log(`[调试] getOrCreateSession - 复用现有状态`);
  return existingState;
}

/**
 * 更新会话状态
 */
function updateSessionState(sessionId, updates) {
  const state = getOrCreateSession(sessionId);
  Object.assign(state, updates);
  saveSessionState(state);
  console.log(`[调试] 保存会话状态:`, {
    sessionId: state.sessionId,
    currentFile: state.currentFile ? path.basename(state.currentFile) : null,
    currentTopic: state.currentTopic,
    updates: Object.keys(updates)
  });
  return state;
}

/**
 * 清理过期会话（超过 24 小时）
 */
function cleanupOldSessions() {
  const state = readSessionState();
  if (!state) return;

  const startTime = new Date(state.startTime);
  const now = new Date();
  const hoursDiff = (now - startTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    try {
      fs.unlinkSync(STATE_FILE);
    } catch (e) {
      console.error('清理会话状态失败:', e.message);
    }
  }
}

module.exports = {
  readSessionState,
  saveSessionState,
  getOrCreateSession,
  updateSessionState,
  cleanupOldSessions
};
