jQuery(function ($) {
    /* ПОВЕДЕНИЕ МЕНЮ: НАЧАЛО */
    var START_MENU_OPENING = 15;
    var FINISH_MENU_OPENING = 100;
    var MENU_WIDTH = 200;
    var MAX_MENU_BG_OPACITY = 0.7;

    var moveSideMenu = false;
    var menuOpened = false;
    var $sideMenu = $('#side-menu');
    var $sideMenuBg = $('#side-menu-bg');

    var startCoordX;

    function start(e){
        if(menuOpened) return;
        var coordX = parseCoordX(e);
        if(coordX <= START_MENU_OPENING){
            moveSideMenu = true;
            startCoordX = coordX;
            $sideMenuBg.addClass('active');
        }
    }
    function move(e) {
        if(!moveSideMenu || menuOpened) return;
        var coordX = parseCoordX(e);
        var left = coordX - startCoordX - MENU_WIDTH;
        if(left > 0) left = 0;
        $sideMenu.css('left', left + 'px');

        var openedPart = (coordX - startCoordX) / MENU_WIDTH;
        var opacity = openedPart * MAX_MENU_BG_OPACITY;
        if(opacity > MAX_MENU_BG_OPACITY) opacity = MAX_MENU_BG_OPACITY;
        if(opacity < 0) opacity = 0;
        $sideMenuBg.css('opacity', opacity);
        $sideMenuBg.addClass('active');
    }
    function end(){
        if(!moveSideMenu || menuOpened) return;
        var sideMenuOpenedWidth = Math.abs(MENU_WIDTH + parseInt($sideMenu.css('left')));
        if(sideMenuOpenedWidth > FINISH_MENU_OPENING){
            showMenu();
        }else{
            hideMenu();
        }
    }

    function parseCoordX(e) {
        return e.touches ? e.touches[0].pageX : e.pageX;
    }

    function showMenu() {
        moveSideMenu = false;
        menuOpened = true;

        $sideMenu.animate({
            left: 0
        }, 400);

        $sideMenuBg.animate({
            opacity: MAX_MENU_BG_OPACITY
        }, 400);
    }
    function hideMenu() {
        moveSideMenu = false;
        menuOpened = false;
        $sideMenu.animate({
            left: -MENU_WIDTH
        }, 400);
        $sideMenuBg.animate({
            opacity: 0
        }, 400, 'swing', function () {
            $sideMenuBg.removeClass('active');
        });
    }

    document.body.addEventListener('touchstart', start);
    document.body.addEventListener('mousedown', start);

    document.body.addEventListener('touchmove', move);
    document.body.addEventListener('mousemove', move);

    document.body.addEventListener('touchend', end);
    document.body.addEventListener('touchcancel', hideMenu);
    document.body.addEventListener('mouseup', end);

    // убираем прокрутку окна во время открытия меню
    window.addEventListener('touchmove', function (e) {
        if(moveSideMenu || menuOpened){
            e.preventDefault();
        }
    });


    $sideMenuBg.on('touchstart', hideMenu);
    $sideMenuBg.on('mousedown', hideMenu);
    /* ПОВЕДЕНИЕ МЕНЮ: КОНЕЦ */

    function startNewGame() {
        var userSedOk = confirm('Уверены что хотите начать новую игру?\nВсе данные будут потеряны!');
        if(!userSedOk) return;
        window.START_NEW_GAME = true;
        if(localStorage) localStorage.removeItem('cashflow');
        location.reload(true);
    }

    document.getElementById('start-new-game').addEventListener('click', startNewGame);

});
