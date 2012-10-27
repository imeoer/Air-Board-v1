///import core
///import commands\paragraph.js
///commands 首行缩进
///commandsName  Outdent,Indent
///commandsTitle  取消缩进,首行缩进
/**
 * 首行缩进
 * @function
 * @name baidu.editor.execCommand
 * @param   {String}   cmdName     outdent取消缩进，indent缩进
 */
(function (){
    var domUtils = baidu.editor.dom.domUtils;
    baidu.editor.commands['indent'] = {
        execCommand : function() {
             var me = this,value = me.queryCommandState("indent") ? "0em" : me.options.indentValue || '2em';
             me.execCommand('Paragraph','p',{style:'text-indent:'+ value});
        },
        queryCommandState : function() {
            if(this.highlight){return -1;}
            var start = this.selection.getStart(),
                pN = domUtils.findParentByTagName(start,['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],true),
                indent = pN && pN.style.textIndent ? parseInt(pN.style.textIndent) : '';
            return indent ?  1 : 0;
        }

    };
})();
