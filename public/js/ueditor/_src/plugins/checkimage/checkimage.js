///import core
///commands 本地图片引导上传
///commandsName  CheckImage
///commandsTitle  本地图片引导上传


baidu.editor.plugins["checkimage"] = function(){
    var checkedImgs=[],me = this;
    me.commands['checkimage'] = {
        execCommand : function( cmdName,checkType) {
            if(checkedImgs.length){
                this[checkType] = checkedImgs;
            }
        },
        queryCommandState: function(cmdName,checkType){
            checkedImgs=[];
            var images = this.document.getElementsByTagName("img");
            for(var i=0,ci;ci =images[i++];){
                if(ci.getAttribute(checkType)){
                    checkedImgs.push(ci.getAttribute(checkType));
                }
            }
            return checkedImgs.length ? 1:-1;
        }
    };
};