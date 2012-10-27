///import core
///import commands\paragraph.js
///commands 段间距
///commandsName  RowSpacing
///commandsTitle  段间距
/**
 * @description 设置行距
 * @name baidu.editor.execCommand
 * @param   {String}   cmdName     rowspacing设置行间距
 * @param   {String}   value              值，以px为单位
 * @author zhanyi
 */
(function(){
    
    var domUtils = baidu.editor.dom.domUtils;
    baidu.editor.commands['rowspacing'] =  {
        execCommand : function( cmdName,value ) {
            
            this.execCommand('paragraph','p',{style:'padding:'+value + 'px 0'});
            return true;
        },
        queryCommandValue : function() {
            var startNode = this.selection.getStart(),
                pN = domUtils.findParent(startNode,function(node){return domUtils.isBlockElm(node)},true),
                value;
            //trace:1026
            if(pN){
                value = domUtils.getComputedStyle(pN,'padding-top').replace(/[^\d]/g,'');
                return value*1 <= 10 ? 0 : value;
            }
            return 0;
             
        },
        queryCommandState : function(){
            return this.highlight ? -1 :0;
        }
    }

})();
