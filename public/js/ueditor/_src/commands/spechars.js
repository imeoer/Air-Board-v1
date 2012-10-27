///import core
///import commands\inserthtml.js
///commands 特殊字符
///commandsName  Spechars
///commandsTitle  特殊字符
///commandsDialog  dialogs\spechars\spechars.html
(function() {
    baidu.editor.commands['spechars'] = {
        execCommand : function(){

        },
         queryCommandState : function(){
            return this.highlight ? -1 :0;
        }
};
})();
