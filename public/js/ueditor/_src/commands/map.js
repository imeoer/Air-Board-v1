///import core
///import commands\inserthtml.js
///commands 地图
///commandsName  Map,GMap
///commandsTitle  Baidu地图,Google地图
///commandsDialog  dialogs\map\map.html,dialogs\gmap\gmap.html
(function() {
    baidu.editor.commands['gmap'] = 
    baidu.editor.commands['map'] = {
        execCommand : function(){

        },
         queryCommandState : function(){
            return this.highlight ? -1 :0;
        }
};
})();
