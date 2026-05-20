/**
 * styles-gallery.js - 风格库展示页
 * 展示三种风格的色块和适用场景，可从展示页直接跳转回提示词页
 */
const StylesGallery = {
  init(state) {
    return {
      /** 选择一个风格并跳转回提示词页 */
      selectStyleForPrompt(styleId) {
        state.selectedStyleId = styleId;
        state.currentView = 'prompt';
        state.toast = { show: true, type: 'success', message: '已选择风格，已跳转到提示词页' };
        setTimeout(function () { state.toast.show = false; }, 2000);
      }
    };
  }
};
