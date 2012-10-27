<!--#include FILE="upload.inc"-->
<%
    dim upload,file,formName,title,state,picSize,picType,uploadPath,fileExt,fileName,prefix

    uploadPath = "../uploadfiles/"       '上传保存路径
    picSize = 500                        '允许的文件大小，单位KB
    picType = ".jpg,.gif,.png,.bmp"      '允许的图片格式
    
    '文件上传状态,当成功时返回SUCCESS，其余值将直接返回对应字符窜并显示在图片预览框，同时可以在前端页面通过回调函数获取对应字符窜
    state="SUCCESS"
    
    set upload=new upload_5xSoft         '建立上传对象
    title = htmlspecialchars(upload.form("pictitle"))

    for each formName in upload.file
        set file=upload.file(formName)

        '大小验证
        if file.filesize > picSize*1024 then
            state="图片大小超出限制"
        end if

        '格式验证
        fileExt = lcase(mid(file.FileName, instrrev(file.FileName,".")))
        if instr(picType, fileExt)=0 then
            state = "图片类型错误"
        end If

        '保存图片
        prefix = int(900000*Rnd)+1000
        if state="SUCCESS" then
            fileName = uploadPath & prefix & second(now) & fileExt
            file.SaveAs Server.mappath( fileName)
        end if
        
        '返回数据
        response.Write "{'url':'" & FileName & "','title':'"& title &"','state':'"& state &"'}"
        set file=nothing

    next
    set upload=nothing

    function htmlspecialchars(someString)
        htmlspecialchars = replace(replace(replace(replace(someString, "&", "&amp;"), ">", "&gt;"), "<", "&lt;"), """", "&quot;")
    end function
%>