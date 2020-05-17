$(function () {
    $(document).scroll(function () {
        var $nav = $(".creatives-content-scroll-prompt");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        /*
        setTimeout(() => {
            $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
        }, 500);*/
      });
  });