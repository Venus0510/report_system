/* ============================================================
 * CSV数据加载器
 * 来源：mmf_BI/money_market_fund_bi_template.html
 * 依赖：PapaParse (CDN: https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js)
 * ============================================================
 *
 * 使用方式：
 *   <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
 *   <script src="data/data-loader.js"></script>
 *
 *   loadCSV('data/xxx.csv').then(function(rows) { ... });
 *   loadMultipleCSV(['data/a.csv', 'data/b.csv']).then(function(results) { ... });
 */

/**
 * 加载单个CSV文件
 * @param {string} path - CSV文件路径
 * @returns {Promise<Array<object>>} - 解析后的对象数组
 */
function loadCSV(path) {
  return new Promise(function(resolve, reject) {
    Papa.parse(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function(results) {
        if (results.errors && results.errors.length > 0) {
          console.warn('CSV解析警告 (' + path + '):', results.errors);
        }
        resolve(results.data);
      },
      error: function(err) {
        reject(new Error('CSV加载失败 (' + path + '): ' + err.message));
      }
    });
  });
}

/**
 * 批量加载CSV文件
 * @param {Array<string>} paths - CSV文件路径列表
 * @returns {Promise<Array<Array<object>>>} - 结果数组，与paths顺序对应
 */
function loadMultipleCSV(paths) {
  var promises = paths.map(function(p) {
    return loadCSV(p).catch(function(err) {
      console.error(err);
      return [];
    });
  });
  return Promise.all(promises);
}

/**
 * 加载CSV并以指定字段为key建立索引
 * @param {string} path  - CSV文件路径
 * @param {string} keyField - 索引字段名
 * @returns {Promise<object>} - { key: row, ... }
 */
function loadCSVAsMap(path, keyField) {
  return loadCSV(path).then(function(rows) {
    var map = {};
    rows.forEach(function(row) {
      if (row[keyField] != null) {
        map[row[keyField]] = row;
      }
    });
    return map;
  });
}

/**
 * 将CSV数据按字段分组
 * @param {Array<object>} rows  - 已加载的数据
 * @param {string} groupField    - 分组字段名
 * @returns {object} - { groupValue: [rows], ... }
 */
function groupByField(rows, groupField) {
  var groups = {};
  rows.forEach(function(row) {
    var key = row[groupField];
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  return groups;
}

/**
 * 将CSV中的日期字符串转为Date对象
 * @param {Array<object>} rows
 * @param {string} dateField - 日期字段名
 * @returns {Array<object>}
 */
function parseDateField(rows, dateField) {
  return rows.map(function(row) {
    if (row[dateField]) {
      row._date = new Date(row[dateField]);
      row._timestamp = row._date.getTime();
    }
    return row;
  }).filter(function(row) {
    return row._date && !isNaN(row._date.getTime());
  });
}

/**
 * 按日期范围过滤数据
 * @param {Array<object>} rows
 * @param {Date|string} start
 * @param {Date|string} end
 * @param {string} dateField - 默认 '_date'
 * @returns {Array<object>}
 */
function filterByDateRange(rows, start, end, dateField) {
  dateField = dateField || '_date';
  var startTs = start instanceof Date ? start.getTime() : new Date(start).getTime();
  var endTs = end instanceof Date ? end.getTime() : new Date(end).getTime();
  return rows.filter(function(row) {
    var ts = row._timestamp || (row[dateField] ? new Date(row[dateField]).getTime() : null);
    return ts != null && ts >= startTs && ts <= endTs;
  });
}

/**
 * 计算字段的汇总统计
 * @param {Array<object>} rows
 * @param {string} field
 * @returns {{ min: number, max: number, avg: number, sum: number, count: number, median: number }}
 */
function calcFieldStats(rows, field) {
  var values = rows
    .map(function(r) { return r[field]; })
    .filter(function(v) { return v != null && !isNaN(v); })
    .sort(function(a, b) { return a - b; });

  if (values.length === 0) return { min: 0, max: 0, avg: 0, sum: 0, count: 0, median: 0 };

  var mid = Math.floor(values.length / 2);
  return {
    min: values[0],
    max: values[values.length - 1],
    avg: values.reduce(function(a, b) { return a + b; }, 0) / values.length,
    sum: values.reduce(function(a, b) { return a + b; }, 0),
    count: values.length,
    median: values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid]
  };
}
