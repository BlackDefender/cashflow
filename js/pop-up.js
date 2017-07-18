jQuery(function ($) {
    var $popUpBg = $('#pop-up-bg');
    var $popUpWindowCloseBtn = $('.pop-up-window .close-btn');

    $popUpWindowCloseBtn.click(function () {
        $(this).closest('.pop-up-window').removeClass('active');
        $popUpBg.removeClass('active');
    });

    $popUpBg.click(function () {
        $('.pop-up-window.active').removeClass('active');
        $popUpBg.removeClass('active');
    });
});