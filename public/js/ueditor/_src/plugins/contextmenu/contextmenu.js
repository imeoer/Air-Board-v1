///import core
///commands 右键菜单
///commandsName  ContextMenu
///commandsTitle  右键菜单
/**
 * 右键菜单
 * @function
 * @name baidu.editor.plugins.contextmenu
 * @author zhanyi
 */
(function () {
    baidu.editor.plugins['contextmenu'] = function () {
        var me = this,
            menu,
            items = me.options.contextMenu;
            if(!items || items.length==0) return;
            var editor = baidu.editor,
                domUtils = editor.dom.domUtils,
                browser = editor.browser;
            var uiUtils = baidu.editor.ui.uiUtils;
            me.addListener('contextmenu',function(type,evt){
                var offset = uiUtils.getViewportOffsetByEvent(evt);
                if (menu)
                    menu.destroy();
                for (var i = 0,ti,contextItems = []; ti = items[i]; i++) {
                    var last;
                    (function(item) {
                        if (item == '-') {
                            if ((last = contextItems[contextItems.length - 1 ] ) && last !== '-')
                                contextItems.push('-');
                        } else if (item.group) {

                                for (var j = 0,cj,subMenu = []; cj = item.subMenu[j]; j++) {
                                    (function(subItem) {
                                        if (subItem == '-') {
                                            if ((last = subMenu[subMenu.length - 1 ] ) && last !== '-')
                                                subMenu.push('-');

                                        } else {
                                            if (me.queryCommandState(subItem.cmdName) != -1) {
                                                subMenu.push({
                                                    'label':subItem.label,
                                                    className: 'edui-for-' + subItem.cmdName + (subItem.value || ''),
                                                    onclick : subItem.exec ? function() {
                                                        subItem.exec.call(me)
                                                    } : function() {
                                                        me.execCommand(subItem.cmdName, subItem.value)
                                                    }
                                                })
                                            }

                                        }

                                    })(cj)

                                }
                                if (subMenu.length) {
                                    contextItems.push({
                                        'label' : item.group,
                                        className: 'edui-for-' + item.icon,
                                        'subMenu' : {
                                            items: subMenu,
                                            editor:me
                                        }
                                    })
                                }
                          
                        } else {
                            if (me.queryCommandState(item.cmdName) != -1) {
                                //highlight todo
                                if(item.cmdName == 'highlightcode' && me.queryCommandState(item.cmdName) == 0)
                                    return;
                                contextItems.push({
                                    'label':item.label,
                                    className: 'edui-for-' + (item.icon ? item.icon : item.cmdName + (item.value || '')),
                                    onclick : item.exec ? function() {
                                        item.exec.call(me)
                                    } : function() {
                                        me.execCommand(item.cmdName, item.value)
                                    }
                                })
                            }

                        }

                    })(ti)
                }
                if (contextItems[contextItems.length - 1] == '-')
                    contextItems.pop();
                menu = new baidu.editor.ui.Menu({
                    items: contextItems,
                    editor:me
                });
                menu.render();
                menu.showAt(offset);
                domUtils.preventDefault(evt);
                if(browser.ie){
                    var ieRange;
                    try{
                        ieRange = me.selection.getNative().createRange();
                    }catch(e){
                       return;
                    }
                    if(ieRange.item){
                        var range = new editor.dom.Range(me.document);
                        range.selectNode(ieRange.item(0)).select(true,true);

                    }
                }
            })



        


    };


})();
