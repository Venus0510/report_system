/**
 * layouts-gallery.js - 版式库展示页
 * 展示三种版式的缩略图和说明，可从展示页直接跳转回提示词页
 */
const LayoutsGallery = {
  init(state) {
    return {
      /** 选择一个版式并跳转回提示词页 */
      selectLayoutForPrompt(layoutId) {
        state.selectedLayoutId = layoutId;
        state.currentView = 'prompt';
        state.toast = { show: true, type: 'success', message: '已选择版式，已跳转到提示词页' };
        setTimeout(function () { state.toast.show = false; }, 2000);
      },

      /** 获取版式分类标签颜色 */
      layoutCategoryClass(category) {
        if (category === 'print') return 'bg-blue-100 text-blue-700';
        if (category === 'slide') return 'bg-purple-100 text-purple-700';
        return 'bg-green-100 text-green-700';
      },

      /** 获取版式分类中文名 */
      layoutCategoryName(category) {
        if (category === 'print') return '打印版';
        if (category === 'slide') return '演示版';
        return '网页版';
      }
    };
  }
};
