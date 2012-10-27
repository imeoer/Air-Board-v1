var allowNoteItemOn = true;
String.prototype.trim = function(){var reg=/^\s*(.*?)\s*$/;return this.replace(reg,"$1");}
function createXMLHttp()
{
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}
var dmp = new diff_match_patch();
$(document).ready(
	function(){
		var viewFlag = $('#view-flag').html();
		setTimeout(function(){
			getFileHandle(viewFlag);
		}, 1);

		var strHost = 'http://' + document.domain + ':8899';
		var socket = io.connect(strHost);
		var initObj = {
			file_id: viewFlag,
			user_type: 'viewer'
		}
		socket.emit('init', initObj);
		socket.on('patch', function (data) {
			var oldContent = $('#view').html();
			var patches = dmp.patch_fromText(data.file_patch);
			var newContent = dmp.patch_apply(patches, oldContent);
			$('#view').html(newContent[0]);
		});

		$("#my-comment-text-input").keyup(function(){
			var currentLength = $('#my-comment-text-input').val().length;
			var remainLength = 140 - currentLength;
			if(remainLength <= 0){
				$('#my-comment-tip').html('已超出可评论字数');
			}
			else{
				$('#my-comment-tip').html('剩余可评论' + remainLength + '字');
			}
		});

		$('#comment').click(function(){
			getCommentListHandle();
		});

		var isViewNote = true;
		$('#view-note-switch').click(function(){
			if(isViewNote){
				$('.note-item').hide();
				$('#note-info').hide('fast');
				$('#note-input').hide('fast');
				$('#note-tip').hide('fast');
				$('#view').imgAreaSelect({remove: true});
				isViewNote = false;
			}
			else{
				$('.note-item').show();
				$('#view').imgAreaSelect({remove: false});
				startNote();
				isViewNote = true;
			}
		});

		$('#view-comment').click(function(){
			getCommentListHandle();
		});
		
		function startNote(){$('#view').imgAreaSelect({fadeSpeed: 'fast', minWidth: 5, minHeight: 5,
			onSelectStart: function (img, selection) {
				$('#note-input').val('');
				$('#note-info').html('');
				allowNoteItemOn = false;
			},
			onSelectEnd: function (img, selection) {
			if(selection.width > 0 && selection.height > 0){
				NOTE_X1 = selection.x1;
				NOTE_X2 = selection.x2;
				NOTE_Y1 = selection.y1;
				NOTE_Y2 = selection.y2;
				var inputX = selection.x1 + $('#view').offset().left + 1;
				var inputY = selection.y2 + $('#view').offset().top + 5;
				var tipX = selection.x1 + $('#view').offset().left;
				var tipY = selection.y1 + $('#view').offset().top - 18;
				$('#note-input').css({'left': inputX, 'top': inputY});
				$('#note-info').css({'left': tipX + 100, 'top': tipY + 1});
				$('#note-input').width(selection.width - 6);
				$('#note-tip').css({'left': tipX, 'top': tipY});
				$('#note-info').show('fast');
				$('#note-input').show('fast');
				$('#note-tip').show('fast');
				$('#note-input').focus();
				allowNoteItemOn = false;
			}
			else{
				$('#view').imgAreaSelect({hide: true});
				$('#note-input').hide('fast');
				$('#note-tip').hide('fast');
			}
		}})};
		startNote();
	}
);

var NOTE_X1, NOTE_X2, NOTE_Y1, NOTE_Y2;
function initNote(){
	$('#view').imgAreaSelect({hide: true});
	$('#note-info').hide('fast');
	$('#note-input').hide('fast');
	$('#note-tip').hide('fast');

	$('#view').append('<textarea id="note-input"></textarea>');
	$('#view').append('<div id="note-tip"></div><div id="note-info"></div>');

	$("#note-input").die('keypress').live("keypress",function(event){
		var currentLength = $('#note-input').val().length;
		var remainLength = 140 - currentLength;
		if(remainLength <= 0){
			$('#note-info').html('最大可标注140字');
		}
		else{
			$('#note-info').html('');
		}

		var key = event.which;
		if(key == 13){
			var noteContent = $("#note-input").val();
			var fileID = $('#view-flag').html();
			var notePosition = {
				x1: NOTE_X1,
				x2: NOTE_X2,
				y1: NOTE_Y1,
				y2: NOTE_Y2
			}
			allowNoteItemOn = true;
			submitNoteHandle(fileID, noteContent, notePosition);
			return false;
		}
	});
	$("#note-input").die('click').live("click",function(event){
		$('#note-info').hide('fast');
		$('#note-input').hide('fast');
		$('#note-tip').hide('fast');
	});
	$('.imgareaselect-outer').die('click').live('click', function(){
		allowNoteItemOn = true;
		$('#view').imgAreaSelect({hide: true});
		$('#note-info').hide('fast');
		$('#note-input').hide('fast');
		$('#note-tip').hide('fast');
		event.stopPropagation();
		return false;
	});
	getNoteListHandle();
}

function submitNote(fileID, noteContent, notePosition){
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/submitNote");
	var noteObj = {
		file_id: fileID,
		note_position: notePosition,
		note_content: noteContent
	}
	var noteAsJSON = JSON.stringify(noteObj);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var result = xmlHttp.responseText;
				if(result == 'true'){
					initNote();
					//alert('标注成功~！');
				}
				else if(result == 'No Access'){
					$('#note-info').html('请先<a href="/"> 登录 </a>后再进行标注');
					//alert('标注失败~！');
				}
				else{
					$('#note-info').html('标注失败');
				}
			}
		}
	}
	xmlHttp.send(noteAsJSON);
}

function submitNoteHandle(fileID, noteContent, notePosition){
	var noteContent = $('#note-input').val();
	if(noteContent.length > 140){
		$('#note-info').html('已超出140字的标注字数');
	}
	else if(noteContent.trim() == ''){
		$('#note-info').html('标注内容不能为空');
	}
	else{

		$('#note-info').html('正在标注...');
		var fileID = $('#view-flag').html();
		submitNote(fileID, noteContent, notePosition);
	}
}

function getNoteListHandle(){
	var fileID = $('#view-flag').html();
	getNoteList(fileID);
}

function getNoteList(fileID)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/getNoteList");
	var file = {
		file_id: fileID
	}
	var fileAsJSON = JSON.stringify(file);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr != 'false'){
					var noteArray = eval("("+resultStr+")");
					//alert('OK');
					showNoteItem(noteArray);
				}
				else{
					//alert('失败~！');
				}

			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function showNoteItem(noteArray){
	//$('#comment-list').empty();
	$('#view-note').empty();
	for(var i in noteArray){
		var noteTime = noteArray[i].time;
		var noteContent = noteArray[i].content;
		var noteUserName = noteArray[i].user_name;
		var notePosition = noteArray[i].position;
		var noteID = noteArray[i].id;
		addNoteItem(Number(i)+1, noteID, noteTime, noteContent, noteUserName, notePosition);
	}
}

function addNoteItem(noteNum, noteID, noteTime, noteContent, noteUserName, notePosition){
	$('#view-note').append(
		'<div class="note-item" title="双击删除该标注" id="note-item-' + noteNum + '" name="' + noteID + '">' + '</div>' +
		'<div class="note-show" id="note-show-' + noteNum + '"></div>' +
		'<div class="note-source" id="note-source-' + noteNum + '"></div>'
	);
	var x1 = notePosition.x1 + $('#view').offset().left;
	var y1 = notePosition.y1 + $('#view').offset().top;
	var x2 = notePosition.x2 + $('#view').offset().left;
	var y2 = notePosition.y2 + $('#view').offset().top;
	$('#note-item-' + noteNum).css({'left': x1, 'top': y1});
	$('#note-item-' + noteNum).width(x2 - x1);
	$('#note-item-' + noteNum).height(y2 - y1);

	$('#note-item-' + noteNum).die('mouseover').live("mouseover",function(event){
		if(allowNoteItemOn == true){
			$('#view').imgAreaSelect({ x1: notePosition.x1, y1: notePosition.y1, x2: notePosition.x2, y2: notePosition.y2 });
			$('#note-show-' + noteNum).text(noteContent);
			//$('#note-show-' + noteNum).width(x2 - x1 - 6);
			$('#note-show-' + noteNum).css({'left': x1, 'top': y1 + y2 - y1 + 5});
			$('#note-show-' + noteNum).fadeIn('normal');

			$('#note-source-' + noteNum).html('时间：' + noteTime + '</br>' + '用户：' + noteUserName);
			//$('#note-source-' + noteNum).width(x2 - x1 - 6);
			$('#note-source-' + noteNum).css({'left': x1, 'top': y1 - 45});
			$('#note-source-' + noteNum).fadeIn('normal');

			$('#view').imgAreaSelect({ hide: false });
			allowNoteItemOn == false;
		}
	});
	$('#note-item-' + noteNum).die('dblclick').live("dblclick",function(event){
		var noteID = $(this).attr('name');
		var fileID = $('#view-flag').html();
		delNoteHandle(noteID, $(this), fileID);
	});
	$('#note-item-' + noteNum).die('mouseout').live("mouseout",function(event){
		if(allowNoteItemOn == true){
			$('#view').imgAreaSelect({ hide: true });
			$('#note-show-' + noteNum).hide();
			$('#note-source-' + noteNum).hide();
		}
	});
}

function delNoteHandle(noteID, noteItem, fileID){
	//$('#note-info').html('正在删除...');
	delNote(noteID, noteItem, fileID);
	noteItem.hide();
	$('#view').imgAreaSelect({ hide: true });
	$('#note-show-' + noteNum).hide();
	$('#note-source-' + noteNum).hide();
}

function delNote(noteID, noteItem, fileID){
	var noteObj = {
		note_id: noteID,
		file_id: fileID
	}
	var noteAsJSON = JSON.stringify(noteObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/delNote");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'true'){
					//getNoteListHandle();
					noteItem.fadeOut('normal');
				}
				else if(resultStr == 'No Access'){
					noteItem.fadeIn('normal');
					alert('删除标注失败，请登录后进行删除');
				}
				else{
					alert('删除标注失败，您可能没有该权限');
				}
			}
		}
	}
	xmlHttp.send(noteAsJSON);
}

function getFileHandle(fileID){
	$('#tip-logo').show();
	$('#tip-text').html('正在载入笔记...');
	$('#tip').show();
	getFile(fileID);
}

function getFile(fileID)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/vFile");
	var file = {
		file_id: fileID
	}
	var fileAsJSON = JSON.stringify(file);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var strFileObj = xmlHttp.responseText;
				if(strFileObj != 'false'){
					var fileObj = eval('('+strFileObj+')');
					showFile(fileObj);
					//FILE_ID = fileID;
				}
			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function showFile(fileObj){
	var fileTitle = fileObj.title;
	var fileContent = fileObj.content;
	$('#title-text').html(fileTitle);
	$('#view').html(fileContent);

	initNote();

	$('#tip-logo').hide();
	$('#tip-text').html('载入成功');
	setTimeout(function(){
		$('#tip').hide();
	}, 2000);
}

function adjustFrame(){
	$('#view').height($('#view').contents().height()); //iFrame高度自适应
}

function submitCommentHandle(){
	var commentContent = $('#my-comment-text-input').val();
	String.prototype.trim = function(){var reg=/^\s*(.*?)\s*$/;return this.replace(reg,"$1");}
	if(commentContent.length > 140){
		$('#my-comment-tip').html('已超出140字的评论字数');
	}
	else if(commentContent.trim() == ''){
		$('#my-comment-tip').html('评论内容不能为空');
	}
	else{
		$('#submit-my-comment').hide();
		$('#my-comment-tip').html('正在提交...');
		var fileID = $('#view-flag').html();
		submitComment(fileID, commentContent);
	}
}

function submitComment(fileID, commentContent){
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/submitComment");
	var commentObj = {
		file_id: fileID,
		content: commentContent
	}
	var commentAsJSON = JSON.stringify(commentObj);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var result = xmlHttp.responseText;
				if(result == 'true'){
					$('#my-comment-tip').html('评论成功');
					$('#my-comment-text-input').val('');
					getCommentListHandle();
				}
				else{
					$('#my-comment-tip').html('评论失败，评论中可能含有特殊字符');
					$('#submit-my-comment').show();
					$('#my-comment-text-input').val('');
				}
			}
		}
	}
	xmlHttp.send(commentAsJSON);
}

function getCommentListHandle(){
	$('#comment-text').html('正在获取评论...');
	var fileID = $('#view-flag').html();
	getCommentList(fileID);
}

function getCommentList(fileID)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/getCommentList");
	var file = {
		file_id: fileID
	}
	var fileAsJSON = JSON.stringify(file);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr != 'false'){
					var commentArray = eval("("+resultStr+")");
					showCommentItem(commentArray);
					$('#comment').fadeOut('fast', function(){
						$('#comment-view').fadeIn('fast');
						$('#my-comment').fadeIn('fast');
						$.scrollTo('#my-comment', 500, function(){});
						$('#my-comment-text-input').focus();
					});
				}
				else{
					$('#comment').fadeOut('fast', function(){
						//$('#comment-view').fadeIn('fast');
						$('#my-comment').fadeIn('fast');
						$.scrollTo('#my-comment', 500, function(){});
						$('#my-comment-text-input').focus();
					});
				}

			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function showCommentItem(commentArray){
	$('#comment-list').empty();
	for(var i in commentArray){
		var commentNum = Number(i)+1;
		var commentID = commentArray[i].id;
		var commentTime = commentArray[i].time;
		var commentContent = commentArray[i].content;
		var commentUserName = commentArray[i].user_name;
		addCommentItem(commentNum, commentID, commentTime, commentContent, commentUserName);

		$('#comment-item-'+ commentNum).die('mouseover').live("mouseover",function(){
			$('.comment-del').hide();
			$(this).children('.comment-del').show();
		});

		$('#comment-item-'+ commentNum).die('mouseout').live("mouseout",function(){
			$(this).children('.comment-del').hide();
		});

		$('#comment-del-'+ commentNum).die('click').live("click",function(){
			var commentID = $(this).parent().attr('name');
			var fileID = $('#view-flag').html();
			delComment(commentID, $(this).parent() ,fileID);
		});
	}
}

function addCommentItem(commentNum, commentID, commentTime, commentContent, commentUserName){
	$('#comment-list').append(
		'<div class="comment-item" id=comment-item-' + commentNum + ' name="' + commentID + '">' +
			'<a class="comment-del" id="comment-del-' + commentNum + '">删除</a>' +
			'<div class="comment-num">#' + commentNum + '</div>' +
			'<div class="comment-user">' + commentUserName + '</div>' +
			'<div class="comment-time">' + commentTime + '</div>' +
			'<div class="comment-content">' + commentContent + '</div>' +
		'</div>'
	);
}

function delComment(commentID, commentItem, fileID)
{
	var commentObj = {
		comment_id: commentID,
		file_id: fileID
	}
	var commentAsJSON = JSON.stringify(commentObj);
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/delComment");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var resultStr = xmlHttp.responseText;
				if(resultStr == 'true'){
					commentItem.fadeOut('normal');
				}
				else if(resultStr == 'No Access'){
					alert('删除评论失败，请登录后进行删除');
				}
				else{
					alert('删除评论失败，您可能没有该权限');
				}
			}
		}
	}
	xmlHttp.send(commentAsJSON);
}