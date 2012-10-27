///import core
///commands 清空文档
///commandsName  ClearDoc
///commandsTitle  清空文档
/**
 *
 * 清空文档
 * @function
 * @name baidu.editor.execCommand
 * @param   {String}   cmdName     cleardoc清空文档
 */
(function(){
    function setRange(range,node){
        range.setStart(node,0).setCursor();
    }
    baidu.editor.commands['cleardoc'] = {
        execCommand : function( cmdName) {
            var me = this,
                enterTag = me.options.enterTag,
                browser = baidu.editor.browser,
                range = this.selection.getRange();
            if(enterTag == "br"){
                this.body.innerHTML = "<br/>";
                setRange(range,this.body);
            }else{
                //不用&nbsp;也能定位，所以去掉，chrom也可以不要br,ff不行再想定位回去不行了，需要br
                this.body.innerHTML = "<p>"+(browser.ie ? "" : "<br/>")+"</p>";
                me.focus();
                setRange(range,me.body.firstChild);
            }
        }
    };
})();
