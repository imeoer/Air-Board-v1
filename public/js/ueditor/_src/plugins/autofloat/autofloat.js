///import core
///commands 悬浮工具栏
///commandsName  AutoFloat
///commandsTitle  悬浮工具栏
/*
 *  modified by chengchao01
 *
 *  注意： 引入此功能后，在IE6下会将body的背景图片覆盖掉！
 */
 (function(){
 
    var browser = baidu.editor.browser,
		domUtils = baidu.editor.dom.domUtils,
        uiUtils,
        utils = baidu.editor.utils,
		LteIE6 = browser.ie && browser.version <= 6;
	
    baidu.editor.plugins['autofloat'] = function() {
        
		var optsAutoFloatEnabled = this.options.autoFloatEnabled;

        //如果不固定toolbar的位置，则直接退出
        if(!optsAutoFloatEnabled){
			return;
		}

		var editor = this,
			floating = false,
			MIN_HEIGHT = 0,
			bakCssText,
			placeHolder = document.createElement('div');

		function setFloating(delta){
			var toolbarBox = editor.ui.getDom('toolbarbox'),
				toobarBoxPos = domUtils.getXY(toolbarBox),
				origalFloat = window.getComputedStyle? document.defaultView.getComputedStyle(toolbarBox, null).position : toolbarBox.currentStyle.position,
                origalLeft = window.getComputedStyle? document.defaultView.getComputedStyle(toolbarBox, null).left : toolbarBox.currentStyle.left;
			placeHolder.style.height = toolbarBox.offsetHeight + 'px';
			bakCssText = toolbarBox.style.cssText;
            if (browser.ie7Compat) {
                var left = (toolbarBox.getBoundingClientRect().left -
                    document.documentElement.getBoundingClientRect().left) + 'px';
            }
			toolbarBox.style.width = toolbarBox.offsetWidth + 'px';
			toolbarBox.parentNode.insertBefore(placeHolder, toolbarBox);
			if (LteIE6) {
				toolbarBox.style.position = 'absolute';
				toolbarBox.style.setExpression('top', 'eval("((document.documentElement||document.body).scrollTop-'+ delta +')+\'px\'")');
				toolbarBox.style.zIndex = '1';
			} else {
				toolbarBox.style.position = 'fixed';
				toolbarBox.style.zIndex = '1';
				toolbarBox.style.top = '0';
                if (browser.ie7Compat) {
                    toolbarBox.style.left = left;
                }
				((origalFloat == 'absolute' || origalFloat == 'relative') && parseFloat(origalLeft)) && (toolbarBox.style.left = toobarBoxPos.x + 'px');
			}
			floating = true;
		}
		function unsetFloating(){
			var toolbarBox = editor.ui.getDom('toolbarbox');
			placeHolder.parentNode.removeChild(placeHolder);
			if (LteIE6) {
				toolbarBox.style.removeExpression('top');
			}
			toolbarBox.style.cssText = bakCssText;
			floating = false;
		}
		var updateFloating = utils.defer(function(){

            var rect = uiUtils.getClientRect(
                    editor.ui.getDom('toolbarbox'));
            var rect2 = uiUtils.getClientRect(
                    editor.ui.getDom('iframeholder'));
            if (!floating) {
                if (rect.top < 0 && rect2.bottom > rect.height + MIN_HEIGHT) {
                    var delta = (document.documentElement.scrollTop || document.body.scrollTop) + rect.top;
                    setFloating(delta);
                }
            } else {
                var rect1 = uiUtils.getClientRect(placeHolder);
                if (rect.top < rect1.top || rect.bottom + MIN_HEIGHT > rect2.bottom) {
                    unsetFloating();
                }
            }
        },100,true);

        editor.addListener('destroy',function(){
            domUtils.un(window, ['scroll','resize'], updateFloating);
            editor.removeListener('keydown', updateFloating);
        });
        editor.addListener('ready', function(){
            if(checkHasUI()){
                if(LteIE6){
                    fixIE6FixedPos();
                }
                editor.addListener('autoheightchanged', function (t, enabled){
                    if (enabled) {
                        domUtils.on(window, ['scroll','resize'], updateFloating);
                        editor.addListener('keydown', updateFloating);
                    } else {
                        domUtils.un(window, ['scroll','resize'], updateFloating);
                        editor.removeListener('keydown', updateFloating);
                    }
                });

                editor.addListener('beforefullscreenchange', function (t, enabled){
                    if (enabled) {
                        if (floating) {
                            unsetFloating();
                        }
                    }
                });
                editor.addListener('fullscreenchanged', function (t, enabled){
                    if (!enabled) {
                        updateFloating();
                    }
                });
                editor.addListener('sourcemodechanged', function (t, enabled){
                    setTimeout(function (){
                        updateFloating();
                    });
                });
            }
        })
	};
    function checkHasUI(){
        try{
            uiUtils = baidu.editor.ui.uiUtils;
        }catch( ex ){

            alert('autofloat插件功能依赖于UEditor UI\nautofloat定义位置: _src/plugins/autofloat/autofloat.js');

            throw({
                name: '未包含UI文件',
                message: 'autofloat功能依赖于UEditor UI。autofloat定义位置: _src/plugins/autofloat/autofloat.js'
            });
        }
        return 1;
    }
    function fixIE6FixedPos(){
         var docStyle = document.body.style;
        docStyle.backgroundImage = 'url("about:blank")';
        docStyle.backgroundAttachment = 'fixed';
    }
 })();