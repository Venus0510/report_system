/* ============================================================
 * 全屏Slide翻页控制
 * 搭配版式：layouts/slides-fullscreen.html
 * ============================================================
 *
 * 使用方式：
 *   <script src="layouts/base-slides.js"></script>
 *
 * HTML结构要求：
 *   每页用 class="page" 标识
 *   首张加 class="active"
 *   导航按钮调用 prevSlide() / nextSlide()
 *   页码指示器 id="indicator"
 */

(function() {
  var currentIndex = 0;
  var pages = [];
  var indicator = null;

  // 初始化
  function init() {
    pages = Array.from(document.querySelectorAll('.deck .page'));
    indicator = document.getElementById('indicator');

    // 找到当前active的page
    pages.forEach(function(page, i) {
      if (page.classList.contains('active')) {
        currentIndex = i;
      }
    });

    updateIndicator();

    // 键盘控制
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      }
    });

    // 触摸滑动
    var touchStartX = 0;
    var touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }
    });
  }

  // 跳转到指定页
  function goToSlide(index) {
    if (index < 0 || index >= pages.length) return;
    pages[currentIndex].classList.remove('active');
    currentIndex = index;
    pages[currentIndex].classList.add('active');
    updateIndicator();
  }

  // 上一页
  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  // 下一页
  function nextSlide() {
    if (currentIndex < pages.length - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  // 更新页码指示器
  function updateIndicator() {
    if (indicator) {
      indicator.textContent = (currentIndex + 1) + ' / ' + pages.length;
    }
  }

  // 暴露全局方法
  window.prevSlide = prevSlide;
  window.nextSlide = nextSlide;
  window.goToSlide = goToSlide;
  window.getCurrentSlide = function() { return currentIndex; };
  window.getTotalSlides = function() { return pages.length; };

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
