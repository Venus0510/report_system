/**
 * app.js - 主应用入口
 * 初始化 Vue 应用，组装全局状态和所有页面模块
 * 最后加载，依赖所有其他 JS 模块
 */

(function () {
  var { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

  // ================================================================
  // 全局响应式状态
  // ================================================================
  var state = reactive({
    // 当前显示的页面
    currentView: 'components-gallery',

    // ---- 提示词表单 ----
    reportFileName: '',
    reportTopic: '',
    audience: '',
    purpose: '',
    selectedLayoutId: null,
    selectedStyleId: null,
    pages: [],               // Step 4 页面/节/区块列表
    pptOutline: '',          // PPT 版式整体演讲大纲
    globalDataSource: null,  // { type, filename?, headers?, rows?, content? }

    // ---- 预览 ----
    htmlSource: '',           // 当前编辑区的 HTML 内容

    // ---- Toast ----
    toast: { show: false, type: 'success', message: '' }
  });

  // ================================================================
  // 初始化所有页面模块，收集方法
  // ================================================================
  var promptMethods = typeof PromptPage !== 'undefined' ? PromptPage.init(state) : {};
  var previewMethods = typeof PreviewPage !== 'undefined' ? PreviewPage.init(state) : {};
  var exportMethods = typeof ExportPage !== 'undefined' ? ExportPage.init(state) : {};
  var layoutsGalleryMethods = typeof LayoutsGallery !== 'undefined' ? LayoutsGallery.init(state) : {};
  var stylesGalleryMethods = typeof StylesGallery !== 'undefined' ? StylesGallery.init(state) : {};
  var componentsGalleryMethods = typeof ComponentsGallery !== 'undefined' ? ComponentsGallery.init(state) : {};

  // 暴露 previewMethods.updatePreview 给 export 页调用
  window._previewMethods = previewMethods;

  // ================================================================
  // 创建 Vue 应用
  // ================================================================
  var app = createApp({
    setup: function () {
      // ---- 导航方法 ----
      function navigate(view) {
        state.currentView = view;
      }

      function navClass(view) {
        return state.currentView === view
          ? 'bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30'
          : 'text-slate-300 hover:bg-white/5 hover:text-white rounded-lg';
      }

      // ---- 获取全局资源 ----
      function allLayouts() { return typeof LAYOUTS !== 'undefined' ? LAYOUTS : []; }
      function allStyles() { return typeof STYLES !== 'undefined' ? STYLES : []; }
      function allComponents() { return typeof COMPONENTS !== 'undefined' ? COMPONENTS : []; }
      function componentsByCategory() { return typeof COMPONENTS_BY_CATEGORY !== 'undefined' ? COMPONENTS_BY_CATEGORY : {}; }
      function getLayout(id) { return typeof LAYOUTS_BY_ID !== 'undefined' ? LAYOUTS_BY_ID[id] : null; }
      function getStyle(id) { return typeof STYLES_BY_ID !== 'undefined' ? STYLES_BY_ID[id] : null; }
      function getComponent(id) { return typeof COMPONENTS_BY_ID !== 'undefined' ? COMPONENTS_BY_ID[id] : null; }
      function categoryIcon(cat) {
        return componentsGalleryMethods.categoryIcon ? componentsGalleryMethods.categoryIcon(cat) : '🧩';
      }

      // ---- onMounted 初始化 ----
      onMounted(function () {
        // 初始化检查器消息监听
        if (previewMethods.initInspectorListener) {
          previewMethods.initInspectorListener();
        }
        // 尝试恢复 reports 目录句柄
        if (previewMethods.initDirectory) {
          previewMethods.initDirectory();
        }
      });

      // ================================================================
      // 合并返回所有方法
      // ================================================================
      return Object.assign(
        {
          state,
          Utils: window.Utils || (typeof Utils !== 'undefined' ? Utils : {}),
          navigate,
          navClass,
          allLayouts,
          allStyles,
          allComponents,
          componentsByCategory,
          getLayout,
          getStyle,
          getComponent,
          categoryIcon
        },
        promptMethods,
        previewMethods,
        exportMethods,
        layoutsGalleryMethods,
        stylesGalleryMethods,
        componentsGalleryMethods
      );
    },

    // ================================================================
    // 全局模板（各页面的 v-show 部分内联在此）
    // 为保持 index.html 简洁，此处不做 template，模板直接在 index.html 的 DOM 中
    // ================================================================
  });

  // 挂载应用
  app.mount('#app');

  console.log('🚀 金融报告 HTML 生成工具已启动');
})();
