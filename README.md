Air-Board-v1
============

A simple and lightweight whiteboard webapp with node.js

###### 1、Air Board 是什么？
> + 一个简单轻量的电子白板Web应用，这是它的v1版本
+ 示例： http://www.ctshare.com:8080/

###### 2、它能做什么？
> + 海报发布、文章分享、问题请教、教学指导、意见调查、想法分享、笔记备忘、会议纪要...
+ 以上纯属作者YY...

###### 3、它主要使用什么开发？
> + 后端：Node.js + Express.js + Socket.io + MongoDB
+ 前端：jQuery + UEditor + Google-diff-match-patch

###### 4、某些功能是如何实现的？
> + 富文本编辑器：百度开源UEditor
+ 实时同步：编辑人端使用Google-diff-match-patch比较文本差异，将差异补丁发送给观看者，使用Scoket.io进行消息推送
+ 白板标注：使用jQuery ImgAreaSelect插件，修改了部分代码

###### 5、如何运行它？
> + Git Clone 代码
+ 安装好Node.js，确认MongoDB服务已运行
+ node ./main.js

###### 6、关于代码
> + LZ的第一份JavaScript试手WebApp
+ 只能拿来吐槽不能拿来学习..=.=

###### 7、致谢
> + Sublime Text 2
+ I.F Studio 团队提供的VPS