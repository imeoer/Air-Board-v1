var FILE_ID;
/*$(window).resize(function(){
	adjustDiv();
});
function adjustDiv(){
	$('#menu').css({
		height: (document.body.clientHeight - 125)
	});
	$('#view').css({
		height: (document.body.clientHeight - 125),
		width: (document.body.clientWidth - 219)
	});
}*/
function createXMLHttp()
{
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}
function showTip(objStr,tipStr)
{
	//$(objStr).fadeTo("fast",0.3);
	$(objStr).html(tipStr);
	$(objStr).show();
	//$(objStr).fadeTo("fast",1.0);
}
$(document).ready(
	function(){
		var controlTimer;
		getTagListHandle();
		getFileList('默认标签');
		$('#setting').bind('mouseover',function(){
			$("#setting-content").fadeIn('normal');
		});
		$('#setting').bind('mouseleave',function(){
			controlTimer = setTimeout(function(){
				$("#setting-content").fadeOut('normal');
			}, 1000);
		});
		$('#setting-content').bind('mouseleave',function(){
			$("#setting-content").fadeOut('normal');
		});
		$('#setting-content').bind('mouseover',function(){
			clearTimeout(controlTimer);
			$("#setting-content").fadeIn('normal');
		});
		$('#setting-set').leanModal({top: 150, overlay: 0.8});

		$('#setting-set').die('click').live("click",function(){
			showSetting('modifyPassHandle()', '$("#lean_overlay").click()');
			return false;
		});

		$("#new-pass").blur(function(){
				if(!checkNewPass()&&$("#new-pass").attr("value")!="")
					showTip('#modify-pass-tip','● 密码长度应至少为5位');
				else showTip('#modify-pass-tip','<br/>');
				if(checkReNewPass())
					showTip('#modify-pass-tip','<br/>');
				else
					if($('#re-new-pass').attr("value")!="")
						showTip('#modify-pass-tip','● 密码前后不匹配');
			}
		);
		$("#re-new-pass").blur(function(){
				if(!checkReNewPass()&&$("#re-new-pass").attr("value")!="")
					showTip('#modify-pass-tip','● 密码前后不匹配');
				else showTip('#modify-pass-tip','<br/>');
			}
		);
		socket.emit('manageConnect', {});
		socket.on('msg', function (data) {
			
		});
	}
);

function checkNewPass()
{
	if(!$("#new-pass").attr("value").match(/^.{5,}$/))
		return false;
	else return true;
}
function checkReNewPass()
{
	if($("#re-new-pass").attr("value")!=$("#new-pass").attr("value"))
		return false;
	else return true;
}

function modifyPassHandle(){
	var originPass = $('#origin-pass').val();
	var newPass = $('#new-pass').val();
	var reNewPass = $('#re-new-pass').val();
	if(checkNewPass()&&checkReNewPass()&&originPass!=""){
		modifyPass(originPass, reNewPass);
	}
	else{
		showTip('#modify-pass-tip','● 请正确填写密码信息');
	}
}

function modifyPass(originPass, newPass){
	var passObj = {
		origin_pass: originPass,
		new_pass: newPass
	}
	var passAsJSON = JSON.stringify(passObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/modifyPass");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'false'){
					showTip('#modify-pass-tip','● 密码修改失败，请检查原始密码是否正确');
				}
				else{
					showTip('#modify-pass-tip','● 密码修改成功');
				}
			}
		}
	}
	xmlHttp.send(passAsJSON);
}

function getTagListHandle(){
	$('#tag-view').empty();
	addTag(getTagTypeNumber('已经发布'), '已经发布', 0, 'publish');
	$('#tag-auto').hide();
	$('#tag-publish').hide();
	getPublishTag();
	getTagList();
}

function getPublishTag(){
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/getPublishTag");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == '0'){
					$('#tag-publish').hide();
				}
				else{
					$('#tag-publish .tag-count').html('[' + resultStr + ']');
					$('#tag-publish').show();
				}
			}
		}
	}
	xmlHttp.send(null);
}

function getTagTypeNumber(tagName){
	var tagStrHeadNumber = tagName.charCodeAt(tagName.length - 1).toString(10);
	var tagTypeNumber = tagStrHeadNumber.charAt(0);
	return tagTypeNumber;
}
function addTag(tagTypeNumber, tagName, tagNum, tagID){
	var tagTypeMap = {
		type0: 'blue-tag',
		type1: 'pink-tag',
		type2: 'orange-tag',
		type3: 'blue-tag',
		type4: 'blue-tag',
		type5: 'pink-tag',
		type6: 'orange-tag',
		type7: 'orange-tag',
		type8: 'blue-tag',
		type9: 'pink-tag'
	}
	$('#tag-view').append(
		'<div class="'+ tagTypeMap['type' + tagTypeNumber] +'" id="tag-'+ tagID +'">' +
			'<div class="tag-text">'+ tagName +'</div>' +
			'<div class="tag-count">['+ tagNum +']</div>' +
		'</div>'
	);
	$('#tag-' + tagID).bind("click",function(){
		getFileList($(this).children('div').html());
	});
}
function showTagList(tagArray){
	for(var i in tagArray){
		tagName = tagArray[i].tag;
		tagNum = tagArray[i].num;
		tagTypeNumber = getTagTypeNumber(tagName);
		tagID = i;
		addTag(tagTypeNumber, tagName, tagNum, tagID);
	}
	adjustDiv();
}

function getTagList()
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/getTagList");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'false'){
					alert('Get Fialed.');
				}
				else{
					var tagArray = eval("("+resultStr+")");
					showTagList(tagArray);
				}
			}
		}
	}
	xmlHttp.send(null);
}

function closeDialog(){
	$("#lean_overlay").click();
}

function showFileList(fileArray){
	$('#file-view').empty();
	for(var i in fileArray){
		fileTitle = fileArray[i].title;
		filePreview = fileArray[i].preview;
		$('#file-view').append(
			'<div class="file" name="'+ fileArray[i].id +'" id="file-'+ i +'">' +
				'<div class="file-is-publish" id="' + 'file-is-publish-'+ i + '"></div>' +
				'<ul class="file-operate">' +
					'<li class="file-edit" title="编辑" onclick="window.open(\'edit='+ fileArray[i].id +'\');" target="_blank"></li>' +
					'<li class="file-open" title="查看" onclick="window.open(\'view='+ fileArray[i].id +'\');" target="_blank"></li>' +
					'<li class="file-delete" title="删除" href="#info-dlg" id="file-delete-'+ i +'"></li>' +
					'<li class="file-publish" title="发布" href="#info-dlg" id="file-publish-'+ i +'"></li>' +
				'</ul>' +
				'<div class="file-panel"></div>' +
				'<div class="file-border">' +
					'<div class="file-title">'+ fileTitle +'</div>' +
					'<div class="file-preview">'+ filePreview +'</div>' +
				'</div>' +
			'</div>'
		);
		if(fileArray[i].publish == true){
			$('#file-is-publish-'+ i).show();
		}
		else{
			$('#file-is-publish-'+ i).hide();
		}
		$('#file-delete-'+ i).die('click').live("click",function(){
			var fileID = $(this).parent().parent().attr('name');
			$('#info-dlg-close').hide();
			showDialog(
				'此操作将会<b>永久</b>删除白板“'+$(this).parent().parent().children('.file-border').children('.file-title').html()+'”<br/>是否要继续删除?',
				'delFileHandle("'+ fileID +'");closeDialog()', '$("#lean_overlay").click();closeDialog()'
			);
			return false;
		});
		$(".file-delete").leanModal({top: 200, overlay: 0.8});

		$('#file-publish-'+ i).die('click').live("click",function(){
			var fileID = $(this).parent().parent().attr('name');
			var currentDomain = window.location.host;
			var viewSite = 'http://' + currentDomain + '/v=' + fileID;
			$('#info-dlg-close').show();
			/*$('#publish-site').die('click').live("click",function(){
				copyToClipboard(viewSite);
			});*/
			showDialog(
				'发布后，任何人将通过此网址查看、评论、标注该白板，并在您编辑时，实时查看到白板改动<br/><br/>' +
				'</input><input id="publish-site" type="text" readOnly value="' + viewSite + '"></input>',
				'$("#publish-site").select();publishFileHandle("'+ fileID +'", true);closeDialog()', '$("#publish-site").select();publishFileHandle("'+ fileID +'", false);closeDialog()'
			);
			return false;
		});
		$(".file-publish").leanModal({top: 200, overlay: 0.8, closeButton: '#info-dlg-close'});
	}
}

function getFileList(tagName)
{
	var postStr;
	if(tagName == '自动保存'){
		postStr = '/getAutoSaveFile';
	}
	else if(tagName == '已经发布'){
		postStr = '/getPublishFile';
	}
	else{
		postStr = '/getFileList';
	}
	var tagObj = {
		tag_name: tagName
	}
	var tagAsJSON = JSON.stringify(tagObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST", postStr);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'false'){
					$('#sift-tag').html('单击左侧按钮创建新的白板');
					$('#file-view').html('');
					//getFileList('默认标签');
					//alert('Get Fialed.');
				}
				else{
					var fileArray = eval("("+resultStr+")");
					$('#sift-tag').html(tagObj.tag_name);
					showFileList(fileArray);
				}
			}
		}
	}
	xmlHttp.send(tagAsJSON);
}

function delFileHandle(fileID){
	delFile(fileID);
	//alert(fileID);
}

function delFile(fileID)
{
	var fileObj = {
		file_id: fileID
	}
	var fileAsJSON = JSON.stringify(fileObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/delFile");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'false'){
					alert('Get Fialed.');
				}
				else{
					getTagListHandle();
					getFileList($('#sift-tag').html());
					//alert('success');
				}
			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function publishFileHandle(fileID, publishStat){
	publishFile(fileID, publishStat);
	//alert(fileID);
}

function publishFile(fileID, publishStat)
{
	var fileObj = {
		file_id: fileID,
		publish_stat: publishStat
	}
	var fileAsJSON = JSON.stringify(fileObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/publishFile");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'false'){
					alert('Get Fialed.');
				}
				else{
					getTagListHandle();
					getFileList($('#sift-tag').html());
					//alert('发布成功');
				}
			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function dlgCommand(strCommand){
	eval(strCommand);
}

function showDialog(strInfo, strConfirmCommand, strCancelCommand){
	$("#info-dlg-text").html(strInfo);
	$('#info-dlg-confirm').die('click').live("click",function(){
		dlgCommand(strConfirmCommand);
	});
	$('#info-dlg-cancel').die('click').live("click",function(){
		dlgCommand(strCancelCommand);
	});
}

function showSetting(strConfirmCommand, strCancelCommand){
	$('#info-dlg-confirm').die('click').live("click",function(){
		dlgCommand(strConfirmCommand);
	});
	$('#info-dlg-cancel').die('click').live("click",function(){
		dlgCommand(strCancelCommand);
	});
}

function copyToClipboard(copyText) 
{
	if (window.clipboardData) 
	{
		window.clipboardData.setData("Text", copyText)
	} 
    else 
	{
		var flashcopier = 'flashcopier';
		if(!document.getElementById(flashcopier)) 
		{
			var divholder = document.createElement('div');
			divholder.id = flashcopier;
			document.body.appendChild(divholder);
		}
		document.getElementById(flashcopier).innerHTML = '';
		var divinfo = '<embed src="./js/_clipboard.swf" FlashVars="clipboard='+encodeURIComponent(copyText)+'" width="0" height="0" type="application/x-shockwave-flash"></embed>';
		document.getElementById(flashcopier).innerHTML = divinfo;
	}
	alert('已将网址复制到剪贴板.');
}