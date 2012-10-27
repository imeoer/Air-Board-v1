///import core
///import commands\image.js
///commands 插入表情
///commandsName  Emotion
///commandsTitle  表情
///commandsDialog  dialogs\emotion\emotion.html
(function() {
    baidu.editor.commands['emotion'] = {

         queryCommandState : function(){
            return this.highlight ? -1 :0;
        }
};
})();
