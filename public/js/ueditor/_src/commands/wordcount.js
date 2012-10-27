///import core
///commands 字数统计
///commandsName  WordCount
///commandsTitle  字数统计
/**
 * Created by JetBrains WebStorm.
 * User: taoqili
 * Date: 11-9-7
 * Time: 下午8:18
 * To change this template use File | Settings | File Templates.
 */
baidu.editor.commands["wordcount"]={
    queryCommandValue:function(cmd,onlyCount){
        var length,contentText,reg;
        if(onlyCount){
            reg = new RegExp("[\r\t\n]","g");
            contentText = this.getContentTxt().replace(reg,"");
            return contentText.length;
        }
        var open = this.options.wordCount,
             max= this.options.maximumWords,
             msg = this.options.messages.wordCountMsg,
            errMsg=this.options.messages.wordOverFlowMsg;

        if(!open) return "";
        reg = new RegExp("[\r\t\n]","g");
        contentText = this.getContentTxt().replace(reg,"");
        length = contentText.length;
        if(max-length<0){
            return "<span style='color:red;direction: none'>"+errMsg+"</span> "
        }
        msg = msg.replace("{#leave}",max-length >= 0 ? max-length:0);
        msg = msg.replace("{#count}",length);

        return msg;
    }
};