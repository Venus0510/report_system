/**
 * components-gallery.js - 组件库展示页
 * 按分类分组展示所有组件，每个组件显示缩略图 + 代码片段
 */
const ComponentsGallery = {
  init(state) {
    // 每个组件代码块的展开/折叠状态
    const expandedComponents = Vue.reactive({});

    return {
      expandedComponents,

      /** 切换组件代码的展开/折叠 */
      toggleComponentCode(componentId) {
        expandedComponents[componentId] = !expandedComponents[componentId];
      },

      /** 获取分类图标 */
      categoryIcon(category) {
        if (category === '数据展示') return '📊';
        if (category === '内容展示') return '📝';
        if (category === '流程展示') return '🔀';
        if (category === '对比分析') return '⚖️';
        if (category === '信息展示') return '💡';
        return '🧩';
      },

      /** 高亮代码片段中的 HTML 标签（简单替换） */
      highlightHTML(code) {
        return code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/class=/g, '<span class="text-yellow-300">class=</span>')
          .replace(/data-cid=/g, '<span class="text-green-300">data-cid=</span>');
      }
    };
  }
};
