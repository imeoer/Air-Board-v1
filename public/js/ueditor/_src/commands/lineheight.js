///import core
///import commands\paragraph.js
///commands 行间距
///commandsName  LineHeight
///commandsTitle  行间距
/**
 * @description 设置行内间距
 * @name baidu.editor.execCommand
 * @param   {String}   cmdName     lineheight设置行内间距
 * @param   {String}   value              值
 * @author zhuwenxuan
 */
(function(){

    var domUtils = baidu.editor.dom.domUtils;
    baidu.editor.commands['lineheight'] =  {
        execCommand : function( cmdName,value ) {
            this.execCommand('paragraph','p',{style:'line-height:'+value + '%' });
            return true;
        },
        queryCommandValue : function() {
            var startNode = this.selection.getStart(),
                pN = domUtils.findParent(startNode,function(node){return domUtils.isBlockElm(node)},true),
                value;
            if(pN){
                value = domUtils.getComputedStyle(pN,'line-height').replace(/[^\d]*/ig,"");
                return (value == "normal" || value<100) ? 100 : value+"%";
            }
            return 100;

        },
        queryCommandState : function(){
            return this.highlight ? -1 :0;
        }
    }

})();
