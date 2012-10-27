///import core
///commands 预览
///commandsName  Preview
///commandsTitle  预览
/**
 * 预览
 * @function
 * @name baidu.editor.execCommand
 * @param   {String}   cmdName     preview预览编辑器内容
 */
baidu.editor.commands['preview'] = {

    execCommand : function(){
        
        var me = this,
            w = window.open('', '_blank', ""),
            d = w.document,
            utils = baidu.editor.utils,
            css = me.document.getElementById("syntaxhighlighter_css"),
            js = document.getElementById("syntaxhighlighter_js"),
            style = "<style type='text/css'>" + me.options.initialStyle + "</style>",
            cont = me.getContent();

        if(baidu.editor.browser.ie){
            cont = cont.replace(/<\s*br\s*\/?\s*>/gi,'<br/><br/>')
        }
        d.open();
        d.write('<html><head>'+style+'<link rel="stylesheet" type="text/css" href="'+me.options.UEDITOR_HOME_URL+utils.unhtml( this.options.iframeCssUrl ) + '"/>'+
                (css ? '<link rel="stylesheet" type="text/css" href="' + css.href + '"/>' : '')

            + (css ? ' <script type="text/javascript" charset="utf-8" src="'+js.src+'"></script>':'')
            +'<title></title></head><body >' +
            cont +
            (css ? '<script type="text/javascript">'+(baidu.editor.browser.ie ? 'window.onload = function(){SyntaxHighlighter.all()}' : 'SyntaxHighlighter.all()')+'</script>':'') +
            '</body></html>');
        d.close();
    },
    notNeedUndo : 1
};
