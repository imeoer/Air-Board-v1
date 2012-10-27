function createXMLHttp()
{
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}
$(document).ready(
	function(){
		var viewFlag = $('#view-flag').html();

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

		$('#view-comment').click(function(){
			getCommentListHandle();
		});

		setTimeout(function(){
			getFileHandle(viewFlag);
		}, 1);
	}
);

function getFileHandle(fileID){
	$('#tip-logo').show();
	$('#tip-text').html('正在载入笔记...');
	$('#tip').show();
	getFile(fileID);
}

function getFile(fileID)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/viewFile");
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

	/*var iObj = document.getElementById('view').contentWindow;
	iObj.document.write(fileContent);*/

	//adjustFrame();

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
					$('#comment').fadeOut('normal', function(){
						$('#comment-view').fadeIn('normal');
						$('#my-comment').fadeIn('normal');
						$.scrollTo('#comment-view', 500, function(){});
						$('#my-comment-text-input').focus();
					});
				}
				else{
					$('#comment').fadeOut('normal', function(){
						//$('#comment-view').fadeIn('normal');
						$('#my-comment').fadeIn('normal');
						$.scrollTo('#comment-view', 500, function(){});
						$('#my-comment-text-input').focus();
					});
				}

			}
		}
	}
	xmlHttp.send(fileAsJSON);
}

function delComment(commentID, commentItem)
{
	var commentObj = {
		comment_id: commentID
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
				else{
					alert('评论删除失败');
				}
			}
		}
	}
	xmlHttp.send(commentAsJSON);
}

function showCommentItem(commentArray){
	$('#comment-list').empty();
	for(var i in commentArray){
		var commentNum = Number(i)+1;
		var commentID = commentArray[i].id;
		var commentTime = commentArray[i].time;
		var commentContent = commentArray[i].content;
		addCommentItem(commentNum, commentID, commentTime, commentContent);

		$('#comment-item-'+ commentNum).die('mouseover').live("mouseover",function(){
			$('.comment-del').hide();
			$(this).children('.comment-del').show();
		});

		$('#comment-item-'+ commentNum).die('mouseout').live("mouseout",function(){
			$(this).children('.comment-del').hide();
		});

		$('#comment-del-'+ commentNum).die('click').live("click",function(){
			var commentID = $(this).parent().attr('name');
			delComment(commentID, $(this).parent());
		});
	}
}

function addCommentItem(commentNum, commentID, commentTime, commentContent){
	$('#comment-list').append(
		'<div class="comment-item" id=comment-item-' + commentNum + ' name="' + commentID + '">' +
			'<a class="comment-del" id="comment-del-' + commentNum + '">删除</a>' +
			'<div class="comment-num">#' + commentNum + '</div>' +
			'<div class="comment-time">' + commentTime + '</div>' +
			'<div class="comment-content">' + commentContent + '</div>' +
		'</div>'
	);
}