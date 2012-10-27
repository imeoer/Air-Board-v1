///import core
///commands 锚点
///commandsName  Anchor
///commandsTitle  锚点
///commandsDialog  dialogs\anchor\anchor.html
/**
 * 锚点
 * @function
 * @name baidu.editor.execCommands
 * @param    {String}    cmdName     cmdName="anchor"插入锚点
 */
(function (){
    var domUtils = baidu.editor.dom.domUtils;
    baidu.editor.commands['anchor'] = {
        execCommand : function (cmd, name){
            var range = this.selection.getRange();
            var img = range.getClosedNode();
            if(img && img.getAttribute('anchorname')){
                if(name){
                    img.setAttribute('anchorname',name);
                }else{
                    range.setStartBefore(img).setCursor();
                    domUtils.remove(img);
                }
            }else{
                if(name){
                    //只在选区的开始插入
                    var anchor = this.document.createElement('img');
                    range.collapse(true);
                    anchor.setAttribute('anchorname',name);
                    anchor.className = 'anchorclass';

                    range.insertNode(anchor).setStartAfter(anchor).collapse(true).select(true);
                    //baidu.editor.browser.gecko && anchor.parentNode.insertBefore(this.document.createElement('br'),anchor.nextSibling)
                }
            }
        },
        queryCommandState : function(){
          return this.highlight ? -1 :0;
         }
        
    };
})();
