// ========== Mock Data ==========
var taskIdCounter = 100;

// 9 Users (颜色由渲染层按索引分配)
var mockUsers = [
  { id: 'u1', name: '张三', role: '项目经理', team: 'A组' },
  { id: 'u2', name: '李四', role: '高级顾问', team: 'A组' },
  { id: 'u3', name: '王五', role: '顾问', team: 'A组' },
  { id: 'u4', name: '赵六', role: '顾问', team: 'B组' },
  { id: 'u5', name: '孙七', role: '项目经理', team: 'B组' },
  { id: 'u6', name: '周八', role: '高级顾问', team: 'B组' },
  { id: 'u7', name: '吴九', role: '顾问', team: 'C组' },
  { id: 'u8', name: '郑十', role: '顾问', team: 'C组' },
  { id: 'u9', name: '钱十一', role: '实习生', team: 'C组' }
];

// 20 Projects (颜色由渲染层按索引分配)
var mockProjects = [
  { id: 'p0', code: 'common-001', name: '行政事务', type: 'project' },
  { id: 'p1', code: 'PROJ-001', name: '某银行年度审计', type: 'project' },
  { id: 'p2', code: 'PROJ-002', name: '某制造企业内控', type: 'project' },
  { id: 'p3', code: 'PROJ-003', name: '某地产公司尽调', type: 'project' },
  { id: 'p4', code: 'PROJ-004', name: '某科技公司IPO', type: 'project' },
  { id: 'p5', code: 'PROJ-005', name: '某医药企业合规', type: 'project' },
  { id: 'p6', code: 'PROJ-006', name: '某能源集团审计', type: 'project' },
  { id: 'p7', code: 'PROJ-007', name: '某零售连锁内审', type: 'project' },
  { id: 'p8', code: 'PROJ-008', name: '某物流公司风控', type: 'project' },
  { id: 'p9', code: 'BID-001', name: '某保险投标项目', type: 'bid', clientName: '某保险公司', bidDeadline: '2026-06-20' },
  { id: 'p10', code: 'BID-002', name: '某政府数字化投标', type: 'bid', clientName: '某市政府信息中心', bidDeadline: '2026-06-18' },
  { id: 'p11', code: 'BID-003', name: '某汽车集团审计投标', type: 'bid', clientName: '某汽车集团', bidDeadline: '2026-06-25' },
  { id: 'p12', code: 'BID-004', name: '某港口物流投标', type: 'bid', clientName: '某港口集团', bidDeadline: '2026-06-15' },
  { id: 'p13', code: 'BID-005', name: '某教育集团咨询投标', type: 'bid', clientName: '某教育集团', bidDeadline: '2026-06-28' },
  { id: 'p14', code: 'BID-006', name: '某医药企业审计投标', type: 'bid', clientName: '某医药企业', bidDeadline: '2026-06-22' },
  { id: 'p15', code: 'INT-001', name: '某证券意向合作', type: 'intent', clientName: '某证券公司', expectedSignDate: '2026-07-15', source: '老客户推荐' },
  { id: 'p16', code: 'INT-002', name: '某新能源意向项目', type: 'intent', clientName: '某新能源公司', expectedSignDate: '2026-07-20', source: '市场活动' },
  { id: 'p17', code: 'INT-003', name: '某食品集团意向', type: 'intent', clientName: '某食品集团', expectedSignDate: '2026-08-01', source: '主动拜访' },
  { id: 'p18', code: 'INT-004', name: '某互联网意向合作', type: 'intent', clientName: '某互联网公司', expectedSignDate: '2026-07-10', source: '老客户推荐' },
  { id: 'p19', code: 'INT-005', name: '某化工企业意向', type: 'intent', clientName: '某化工企业', expectedSignDate: '2026-07-25', source: '其他' },
  { id: 'p20', code: 'INT-006', name: '某地产集团意向', type: 'intent', clientName: '某地产集团', expectedSignDate: '2026-08-05', source: '市场活动' }
];

var taskTypeMap = {
  project: ['现场审计', '底稿复核', '报告撰写', '客户沟通'],
  bid: ['标书撰写', '方案设计', '成本测算', '投标汇报'],
  intent: ['需求调研', '方案初稿', '商务洽谈', '报价准备']
};

var workHourCodeMap = {
  '现场审计': 'WH-001', '底稿复核': 'WH-002', '报告撰写': 'WH-003',
  '客户沟通': 'WH-004', '标书撰写': 'WH-005', '方案设计': 'WH-006',
  '成本测算': 'WH-007', '投标汇报': 'WH-008', '需求调研': 'WH-009',
  '方案初稿': 'WH-010', '商务洽谈': 'WH-011', '报价准备': 'WH-012'
};

function t(id, pid, type, taskType, assigneeIds, start, end, deadline, estH, actualH, status, extras) {
  var proj = mockProjects.find(function (p) { return p.id === pid; });
  var obj = {
    id: 't' + id,
    projectId: pid,
    projectCode: proj ? proj.code : '',
    projectType: type,
    name: taskType + '-' + (proj ? proj.name : ''),
    taskType: taskType,
    workHourCode: workHourCodeMap[taskType] || '',
    assigneeIds: assigneeIds,
    startDate: start,
    endDate: end,
    deadline: deadline || end,
    estimatedHours: estH,
    actualHours: actualH,
    status: status || 'not_started',
    clientName: null,
    bidDeadline: null,
    expectedSignDate: null,
    source: null
  };
  if (extras) {
    Object.keys(extras).forEach(function (k) { obj[k] = extras[k]; });
  }
  return obj;
}

var mockTasks = [
  t(1, 'p1', 'project', '现场审计', ['u1', 'u2'], '2026-06-09', '2026-06-13', '2026-06-13', 40, null, 'in_progress'),
  t(2, 'p1', 'project', '底稿复核', ['u2'], '2026-06-12', '2026-06-14', '2026-06-14', 16, null, 'in_progress'),
  t(3, 'p1', 'project', '报告撰写', ['u1'], '2026-06-14', '2026-06-16', '2026-06-16', 20, null, 'in_progress'),
  t(4, 'p2', 'project', '现场审计', ['u3', 'u4'], '2026-06-08', '2026-06-11', '2026-06-11', 24, null, 'in_progress'),
  t(5, 'p2', 'project', '客户沟通', ['u3'], '2026-06-12', '2026-06-13', '2026-06-13', 8, null, 'in_progress'),
  t(6, 'p3', 'project', '报告撰写', ['u4', 'u5'], '2026-06-10', '2026-06-14', '2026-06-14', 30, null, 'in_progress'),
  t(7, 'p3', 'project', '现场审计', ['u5'], '2026-06-07', '2026-06-10', '2026-06-10', 20, 20, 'completed'),
  t(8, 'p4', 'project', '现场审计', ['u6', 'u7'], '2026-06-11', '2026-06-15', '2026-06-15', 35, null, 'in_progress'),
  t(9, 'p4', 'project', '底稿复核', ['u6'], '2026-06-16', '2026-06-18', '2026-06-18', 16, null, 'in_progress'),
  t(10, 'p5', 'project', '报告撰写', ['u1', 'u8'], '2026-06-08', '2026-06-10', '2026-06-10', 16, 16, 'completed'),
  t(11, 'p5', 'project', '客户沟通', ['u8'], '2026-06-11', '2026-06-12', '2026-06-12', 8, null, 'in_progress'),
  t(12, 'p6', 'project', '现场审计', ['u7', 'u9'], '2026-06-12', '2026-06-16', '2026-06-16', 32, null, 'in_progress'),
  t(13, 'p7', 'project', '底稿复核', ['u2', 'u3'], '2026-06-10', '2026-06-12', '2026-06-12', 18, null, 'in_progress'),
  t(14, 'p8', 'project', '现场审计', ['u4', 'u9'], '2026-06-13', '2026-06-17', '2026-06-17', 28, null, 'in_progress'),
  t(15, 'p9', 'bid', '标书撰写', ['u1', 'u4'], '2026-06-09', '2026-06-11', '2026-06-20', 24, null, 'in_progress',
    { clientName: '某保险公司', bidDeadline: '2026-06-20' }),
  t(16, 'p9', 'bid', '方案设计', ['u1'], '2026-06-12', '2026-06-15', '2026-06-20', 20, null, 'in_progress',
    { clientName: '某保险公司', bidDeadline: '2026-06-20' }),
  t(17, 'p10', 'bid', '标书撰写', ['u5', 'u6'], '2026-06-07', '2026-06-10', '2026-06-18', 28, 28, 'completed',
    { clientName: '某市政府信息中心', bidDeadline: '2026-06-18' }),
  t(18, 'p10', 'bid', '成本测算', ['u5'], '2026-06-11', '2026-06-14', '2026-06-18', 16, null, 'in_progress',
    { clientName: '某市政府信息中心', bidDeadline: '2026-06-18' }),
  t(19, 'p11', 'bid', '方案设计', ['u7', 'u8'], '2026-06-10', '2026-06-13', '2026-06-25', 24, null, 'in_progress',
    { clientName: '某汽车集团', bidDeadline: '2026-06-25' }),
  t(20, 'p12', 'bid', '标书撰写', ['u3'], '2026-06-08', '2026-06-12', '2026-06-15', 30, null, 'in_progress',
    { clientName: '某港口集团', bidDeadline: '2026-06-15' }),
  t(21, 'p12', 'bid', '投标汇报', ['u3', 'u6'], '2026-06-13', '2026-06-14', '2026-06-15', 10, null, 'in_progress',
    { clientName: '某港口集团', bidDeadline: '2026-06-15' }),
  t(22, 'p13', 'bid', '标书撰写', ['u2'], '2026-06-11', '2026-06-15', '2026-06-28', 32, null, 'in_progress',
    { clientName: '某教育集团', bidDeadline: '2026-06-28' }),
  t(23, 'p14', 'bid', '方案设计', ['u4', 'u9'], '2026-06-13', '2026-06-16', '2026-06-22', 20, null, 'in_progress',
    { clientName: '某医药企业', bidDeadline: '2026-06-22' }),
  t(24, 'p15', 'intent', '需求调研', ['u5'], '2026-06-09', '2026-06-11', null, 16, null, 'in_progress',
    { clientName: '某证券公司', expectedSignDate: '2026-07-15', source: '老客户推荐' }),
  t(25, 'p15', 'intent', '方案初稿', ['u5', 'u6'], '2026-06-12', '2026-06-14', null, 20, null, 'in_progress',
    { clientName: '某证券公司', expectedSignDate: '2026-07-15', source: '老客户推荐' }),
  t(26, 'p16', 'intent', '需求调研', ['u7'], '2026-06-10', '2026-06-12', null, 12, null, 'in_progress',
    { clientName: '某新能源公司', expectedSignDate: '2026-07-20', source: '市场活动' }),
  t(27, 'p16', 'intent', '商务洽谈', ['u7', 'u8'], '2026-06-15', '2026-06-16', null, 8, null, 'in_progress',
    { clientName: '某新能源公司', expectedSignDate: '2026-07-20', source: '市场活动' }),
  t(28, 'p17', 'intent', '需求调研', ['u1', 'u2'], '2026-06-06', '2026-06-08', null, 18, 18, 'completed',
    { clientName: '某食品集团', expectedSignDate: '2026-08-01', source: '主动拜访' }),
  t(29, 'p17', 'intent', '报价准备', ['u1'], '2026-06-09', '2026-06-10', null, 10, null, 'in_progress',
    { clientName: '某食品集团', expectedSignDate: '2026-08-01', source: '主动拜访' }),
  t(30, 'p18', 'intent', '需求调研', ['u9'], '2026-06-09', '2026-06-10', null, 8, null, 'in_progress',
    { clientName: '某互联网公司', expectedSignDate: '2026-07-10', source: '老客户推荐' }),
  t(31, 'p19', 'intent', '方案初稿', ['u3', 'u4'], '2026-06-11', '2026-06-14', null, 24, null, 'in_progress',
    { clientName: '某化工企业', expectedSignDate: '2026-07-25', source: '其他' }),
  t(32, 'p20', 'intent', '商务洽谈', ['u6'], '2026-06-09', '2026-06-10', null, 6, null, 'in_progress',
    { clientName: '某地产集团', expectedSignDate: '2026-08-05', source: '市场活动' }),
  t(33, 'p6', 'project', '底稿复核', ['u9'], '2026-06-14', '2026-06-16', '2026-06-16', 12, null, 'in_progress'),
  t(34, 'p7', 'project', '报告撰写', ['u2'], '2026-06-13', '2026-06-15', '2026-06-15', 16, null, 'in_progress'),
  t(35, 'p1', 'project', '客户沟通', ['u1'], '2026-06-17', '2026-06-18', '2026-06-18', 6, null, 'in_progress'),
  t(36, 'p4', 'project', '客户沟通', ['u7'], '2026-06-17', '2026-06-18', '2026-06-18', 4, null, 'in_progress'),
  t(37, 'p11', 'bid', '成本测算', ['u8'], '2026-06-14', '2026-06-17', '2026-06-25', 16, null, 'in_progress',
    { clientName: '某汽车集团', bidDeadline: '2026-06-25' }),
  t(38, 'p18', 'intent', '方案初稿', ['u9'], '2026-06-12', '2026-06-14', null, 16, null, 'in_progress',
    { clientName: '某互联网公司', expectedSignDate: '2026-07-10', source: '老客户推荐' }),

  // 已过期未填工时的任务（验证逾期显示）
  t(39, 'p1', 'project', '底稿复核', ['u1'], '2026-06-02', '2026-06-05', '2026-06-05', 24, null, 'in_progress'),
  t(40, 'p9', 'bid', '标书撰写', ['u1'], '2026-06-04', '2026-06-07', '2026-06-07', 20, null, 'in_progress',
    { clientName: '某保险公司', bidDeadline: '2026-06-20' }),
  t(41, 'p2', 'project', '客户沟通', ['u1', 'u3'], '2026-06-06', '2026-06-08', '2026-06-08', 12, null, 'in_progress'),
  t(42, 'p4', 'project', '报告撰写', ['u2'], '2026-06-03', '2026-06-06', '2026-06-06', 16, null, 'in_progress'),
  t(43, 'p10', 'bid', '方案设计', ['u1'], '2026-06-05', '2026-06-09', '2026-06-09', 24, null, 'in_progress',
    { clientName: '某市政府信息中心', bidDeadline: '2026-06-18' })
];

// ========== 持久化层（IndexedDB 读写） ==========
var DB_NAME = 'taskBoardDB';
var DB_VERSION = 1;
var STORE_NAME = 'appData';

function openDB() {
  return new Promise(function (resolve, reject) {
    var request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = function (e) { resolve(e.target.result); };
    request.onerror = function (e) { reject(e.target.error); };
  });
}

function saveData(tasks) {
  openDB().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readwrite');
    var store = tx.objectStore(STORE_NAME);
    store.put({ key: 'tasks', value: tasks });
    store.put({ key: 'taskIdCounter', value: taskIdCounter });
    db.close();
  }).catch(function () {});
}

function loadData(callback) {
  openDB().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var getTasks = store.get('tasks');
    var getCounter = store.get('taskIdCounter');
    tx.oncomplete = function () {
      db.close();
      var tasks = getTasks.result ? getTasks.result.value : null;
      if (getCounter.result) taskIdCounter = getCounter.result.value;
      callback(tasks);
    };
    tx.onerror = function () {
      db.close();
      callback(null);
    };
  }).catch(function () {
    callback(null);
  });
}

function getInitialTasks(callback) {
  loadData(function (saved) {
    if (saved) {
      callback(saved);
    } else {
      callback(JSON.parse(JSON.stringify(mockTasks)));
    }
  });
}
