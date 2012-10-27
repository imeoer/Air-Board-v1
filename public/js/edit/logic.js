var FILE_ID;
var ORIGIN_CONTENT;
var IS_SAVED;
function createXMLHttp()
{
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}
$(document).ready(
	function(){
		$('#title-text').click(function(){
			$(this).hide();
			$('#title-input').show();
			$('#title-input').val($('#title-text').html());
			$('#title-input').select();
			$('#title-input').focus();
		});
		$('#title-input').blur(function(){
			$(this).hide();
			$('#title-text').html($('#title-input').val());
			$('#title-text').show();
		});
		$('#tag-text').click(function(){
			$(this).hide();
			$('#tag-input').show();
			$('#tag-input').val($('#tag-text').html());
			$('#tag-input').select();
			$('#tag-input').focus();
		});
		$('#tag-input').blur(function(){
			$(this).hide();
			$('#tag-text').html($('#tag-input').val());
			$('#tag-text').show();
		});
		window.onbeforeunload = function(){
			if(IS_SAVED == false){
				return('您的白板尚未保存，退出将导致修改部分丢失');
			}
        }
		$(document).keydown(function(e){
			var e = $.event.fix(e);
			if(e.ctrlKey && e.keyCode=="83"){
				e.preventDefault();
				e.preventDefault();
				$('#icon-save').click();
			}
		});
		$(editor.document).keydown(function(e){
			var e = $.event.fix(e);
			if(e.ctrlKey && e.keyCode=="83"){
				e.preventDefault();
				e.preventDefault();
				$('#icon-save').click();
			}
		});
		var editFlag = $("#edit-flag").html();
		if(editFlag == '0'){
			bindEvent();
		}
		else{
			FILE_ID = editFlag;
			setTimeout(function(){
				getFileHandle(editFlag);
			}, 1);
		}
	}
);

var saveTimer;
var patchTimer;
var oldContent;
var newContent;
var dmp = new diff_match_patch();
var patch_text = '';
var socket;

function sendSync(patchText){
	var sendObj = {
		file_id: FILE_ID,
		file_patch: patchText
	}
	socket.emit('sync', sendObj);
}

function initSync(){
	var strHost = 'http://' + document.domain + ':8899';
	alert(strHost);
	socket = io.connect(strHost);
	/*var initObj = {
		file_id: FILE_ID,
		user_type = 'publisher'
	}
	socket.emit('init', initObj);*/
}

function handleSync(){
	clearTimeout(patchTimer);
	patchTimer = setTimeout(function(){
		newContent = editor.getContent();
		var diff = dmp.diff_main(oldContent, newContent, true);
		if (diff.length > 2) {
			dmp.diff_cleanupSemantic(diff);
		}
		var patchList = dmp.patch_make(oldContent, newContent, diff);
		patchText = dmp.patch_toText(patchList);
		sendSync(patchText);
		oldContent = editor.getContent();
	}, 0);
}

function bindEvent(){
	oldContent = editor.getContent();
	initSync();

	function keyDownHandle(e){
		if(e.ctrlKey && e.keyCode=="83");
		else{
			handleSync();
			clearTimeout(saveTimer);
			saveTimer = setTimeout(autoSaveHandle, 1000);
			IS_SAVED = false;
		}
	}

	function afterExecCommandHandle(){
		handleSync();
		clearTimeout(saveTimer);
		saveTimer = setTimeout(autoSaveHandle, 1000);
		IS_SAVED = false;
	}

	if (!editor.document.addEventListener) {//IE
		editor.document.attachEvent("onkeydown", keyDownHandle);
	}
	else {//Other
		editor.document.addEventListener("keydown", keyDownHandle, false);
	}
	editor.addListener("afterexeccommand", afterExecCommandHandle);
}

function showFile(fileObj){
	var fileTitle = fileObj.title;
	var fileTag = fileObj.tag;
	var fileContent = fileObj.content;
	$('#title-text').html(fileTitle);
	$('#tag-text').html(fileTag);
	editor.setContent(fileContent);

	$('#tip-logo').hide();
	$('#tip-text').html('● 载入成功');
	bindEvent();
	setTimeout(function(){
		$('#tip').hide();
	}, 2000);
}

function getFileHandle(fileID){
	$('#tip-logo').show();
	$('#tip-text').html('正在载入白板...');
	$('#tip').show();
	getFile(fileID);
}

function getFile(fileID)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/getFile");
	var file = {
		file_id: fileID
	}
	var fileAsJSON = JSON.stringify(file);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var strFileObj = xmlHttp.responseText;
				if(strFileObj != 'false'){
					var fileObj = eval("("+strFileObj+")");
					ORIGIN_CONTENT = fileObj.content;
					showFile(fileObj);
					//FILE_ID = fileID;
				}
			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function autoSaveHandle(){
	$('#tip-logo').show();
	$('#tip-text').html('正在自动保存...');
	$('#tip').show();
	addIDToFile();
	fullSave($('#title-text').html(), $('#tag-text').html(), editor.getContent());
}

function fullSaveHandle(){
	ORIGIN_CONTENT = editor.getContent();
	$('#tip-logo').show();
	$('#tip-text').html('正在保存...');
	$('#tip').show();
	addIDToFile();
	fullSave($('#title-text').html(), $('#tag-text').html(), editor.getContent());
	IS_SAVED = true;
}

function fullSave(fileTitle, fileTag, fileContent)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/fullSave");
	var file = {
		title: fileTitle,
		tag: fileTag,
		content: fileContent,
		id: FILE_ID
	}
	var fileAsJSON = JSON.stringify(file);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var fileID = xmlHttp.responseText;
				if(fileID != 'false'){
					$('#tip-logo').hide();
					$('#tip-text').html('● 保存成功');
					setTimeout(function(){
						$('#tip').hide();
					}, 2000);
					FILE_ID = fileID;
				}
			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function abortSaveHandle(){
	editor.setContent(ORIGIN_CONTENT);
	fullSaveHandle();
	window.close();
}

function addIDToFile(){
	var i = 0;
	$("#baidu_editor_0").contents().find("body *").each(function(){
		$(this).attr('id','se-'+(i++));
	});
}