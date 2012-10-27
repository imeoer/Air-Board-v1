/**
 * @fileOverview jQuery插件：光标位置控制及选中文字复制插件
 * 获取选中文本，控制输入框输入光标位置。假如参数为空，则返回当前被选中的文字内容；
 * 假如一个参数则将光标设置在该位置；假如两个参数则将两参数之间的文字选中
 * 注意在获取选中文本时文本应该存在，例如在A元素的click事件处理函数内获取B元素的选中文本，可能在响应click事件时B元素就失去焦点了，选中文本也为空了，可尝试将click换为mousedown
 * @author MoLice molice123@gmail.com
 * @version 1.0
 * @example 获取选中文字内容：$(".text").selectionRange();
 * @example 设置输入光标位置：$("textarea").selectionRange(5);
 * @example 选中设定位置之间的文字：$(".text").selectionRange(5, 10);
 *
 * @param {Number} [start] 设置光标的起始位置
 * @param {Number} [end] 设置光标的结束位置
 * @returns {String} 假如参数个数为0则返回当前选中的文本，假如参数不为0则返回jQuery对象
 *
 * @log 2011-10-13 创建
 * @log 2011-12-18 修复两个参数模式失效
 */
(function($) {
  $.fn.selectionRange = function(start, end) {
    var str = "";
    var thisSrc = this[0];
    if(start === undefined) {
      //获取当前选中文字内容，接受各种元素的选中文字
      if(/input|textarea/i.test(thisSrc.tagName) && /firefox/i.test(navigator.userAgent))
        //文本框情况在Firefox下的特殊情况
        str = thisSrc.value.substring(thisSrc.selectionStart, thisSrc.selectionEnd);
      else if(document.selection)
        //非文本框情况
        str = document.selection.createRange().text;
      else
        str = document.getSelection().toString();
    } else {
      //设置文本输入控件的光标位置
      if(!/input|textarea/.test(thisSrc.tagName.toLowerCase()))
        //非文本输入控件，无效
        return false;

      //假如不传第二个参数则默认将end设为start
      (end === undefined) && (end = start);

      //控制光标位置
      if(thisSrc.setSelectionRange) {
        thisSrc.setSelectionRange(start, end);
        this.focus();
      } else {
        var range = thisSrc.createTextRange();
        range.move('character', start);
        range.moveEnd('character', end - start);
        range.select();
      }
    }
    if(start === undefined)
      return str;
    else
      return this;
  };
})(jQuery);
