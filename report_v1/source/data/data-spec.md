# 数据文件规范

## 概述

业务侧HTML的数据来源统一采用 **CSV文件** 或 **JS常量文件**。需进入系统开发流程的数据，其CSV标头必须与后端系统表结构一致。

## CSV格式要求

### 基本规则

- 编码：UTF-8
- 分隔符：逗号(,)
- 第一行：列标头（header）
- 后续行：数据记录
- 空行：自动跳过

### 标头命名规范

| 字段类型 | 命名规则 | 示例 |
|---------|---------|------|
| 日期 | `date` 或 `report_date` | `2024-01-15` |
| 基金代码 | `fund_code` | `000001` |
| 基金名称 | `fund_name` | `宏利活期友货币B` |
| 收益率 | `*_yield` 或 `*_return` | `seven_day_yield`, `nav_return` |
| 百分比 | `*_pct` 或 `*_ratio` | `deposit_ratio`, `allocation_pct` |
| 偏离度 | `*_deviation_bps` 或 `*_deviation` | `avg_deviation_bps` |
| 规模/金额 | `*_amount` 或 `*_aum` | `total_aum` |
| 分类标签 | `*_type` 或 `*_category` | `asset_type`, `bond_type` |

### 日期格式

统一使用 `YYYY-MM-DD` 格式。例如：`2024-06-30`

### 数值格式

- 不包含千分位逗号
- 小数统一使用点号(.)
- 百分比使用实际值（如 2.35 而非 0.0235），在图表中通过格式化函数处理
- 偏离度以bps为单位（1bp = 0.01%），如 `5` 表示5bps = 0.05%

## 参考示例

以下从 `mmf_BI/data/` 中提取的标准文件结构：

### fund_info.csv — 基金信息表

| fund_code | fund_name | management_fee_pct | custodian_fee_pct | sales_service_fee_pct | is_alipay | company_name |
|-----------|-----------|-------------------|-------------------|----------------------|-----------|-------------|
| 000001 | XX货币A | 0.15 | 0.05 | 0.25 | TRUE | XX基金 |

### target_time_series.csv — 日频时间序列

| date | fund_code | seven_day_yield | nav_return_per_10k | aum | leverage_ratio | deviation_bps |
|------|-----------|-----------------|-------------------|-----|----------------|---------------|
| 2024-06-01 | 000001 | 2.15 | 0.6123 | 12500000000 | 1.08 | 3.5 |

### df_assets.csv — 资产配置（季度）

| report_date | fund_code | asset_type | allocation_pct |
|-------------|-----------|-----------|-----------------|
| 2024-06-30 | 000001 | 同业存单 | 35.2 |
| 2024-06-30 | 000001 | 短期融资券 | 28.5 |
| 2024-06-30 | 000001 | 银行存款 | 22.1 |

## 系统对接规则

标记为"可进入系统开发流程"的数据文件，需遵循：

1. **表头名称** 与后端表结构的字段名完全一致
2. **数据类型** 符合表结构定义（VARCHAR、DECIMAL、DATE等）
3. **枚举值** 使用系统定义的枚举值（如债券类型的分类码）
4. **主键字段** 必须包含且无空值

## JS数据文件（备选）

当数据量小或数据结构复杂时，可使用JS常量文件：

```javascript
// data/summary.js
const SUMMARY_DATA = {
  fundName: "XX货币A",
  reportPeriod: "2024年6月",
  metrics: {
    sevenDayYield: 2.15,
    navReturn: 0.6123,
    totalAUM: 12500000000
  },
  allocation: [
    { type: "同业存单", pct: 35.2 },
    { type: "短期融资券", pct: 28.5 }
  ]
};
```

通过 `<script src="data/summary.js"></script>` 引入后直接使用 `SUMMARY_DATA`。
