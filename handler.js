var fs = require('fs');
var md5 = require('./md5');
var mongo = require('./module/mongoskin');
var db = mongo.db('localhost:27017/syneditor');
var ObjectID = db.db.bson_serializer.ObjectID;

var DATA_PATH = './data/';

//字符串整理
String.prototype.trim = function(){var reg=/^\s*(.*?)\s*$/;return this.replace(reg,"$1");}

//日期格式化
Date.prototype.format = function(format){    
	var o = {    
		"M+" : this.getMonth()+1, //month    
		"d+" : this.getDate(),    //day    
		"H+" : this.getHours(),   //hour    
		"m+" : this.getMinutes(), //minute    
		"s+" : this.getSeconds(), //second    
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter    
		"S" : this.getMilliseconds() //millisecond    
	}    
	if(/(y+)/.test(format))   
	format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));    
	for(var k in o)  
	if(new RegExp("("+ k +")").test(format))    
	format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));    
	return format;    
}

//渲染管理页面
function manage(request, response, postData){
	response.render('manage',{name: request.session.user.name});
}


//渲染编辑页面
function editFile(request, response, postData){
	response.render('edit',{
		name: request.session.user.name,
		flag: request.params.id
	});
}

//渲染创建页面
function create(request, response, postData){
	response.render('edit',{
		name: request.session.user.name,
		flag: '0'
	});
}

//检查注册信息
function checkRegInfo(userName, userPass, userMail){
	if(userName.match(/^[a-zA-Z][a-z0-9A-Z_]{3,15}$/) &&
		userPass.match(/^.{5,}$/) &&
		userMail.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)
	){
		return true;
	}
	else{
		return false;
	}
}

//检查用户名重复
function checkUserNameRepeat(request, response, postData){
	var userName = postData.toString().toLowerCase();
	db.collection('user').find({name: userName}).toArray(function(err, records){
		if(records.length != 0){
			response.send('true');
		}
		else
			response.send('false');
	});
}

//检查用户邮箱重复
function checkUserMailRepeat(request, response, postData){
	var userMail = postData.toString().toLowerCase();
	db.collection('user').find({mail:userMail}).toArray(function(err, records){
		if(records.length != 0){
			response.send('true');
		}
		else
			response.send('false');
	});
}

//加密用户密码
function encodePass(userPass){
	var userEncodePass1 = md5.md5Encode(userPass).toString();
	var userEncodePass2 = userEncodePass1.substr(1, 30);
	var userEncodePass3 = md5.md5Encode(userEncodePass2 + userEncodePass1);
	return userEncodePass3;
}

//注册
function register(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	userName = jsonObj.name.toLowerCase();
	userPass = jsonObj.pass;
	userMail = jsonObj.mail.toLowerCase();

	if(!checkRegInfo(userName, userPass, userMail)){
		response.send('false');
	}
	else{
		var userEncodePass = encodePass(userPass);
		var regTime = new Date();
		var userObj = {
			name: userName,
			pass: userEncodePass,
			mail: userMail,
			reg_time: regTime
		}
		try{
			db.collection('user').insert(userObj, {safe: true},function(err, records){
				console.log("新用户注册：" + records[0].name);
				response.send('true');
			});
		}
		catch(err){
			response.send('false');
		}
		
	}
}

//登陆
function login(request, response, postData){
	var userObj = request.body.user;
	var userEncodePass = encodePass(userObj.pass);
	userObj.name = userObj.name.toLowerCase();
	userObj.pass = userEncodePass;
	db.collection('user').find(userObj).toArray(function(err, records){
		if(records.length != 0){
			response.redirect('/manage');
			request.session.cookie.expires = false; //处理session信息
			request.session.user = {
				id: records[0]._id,
				name: userObj.name,
				mail: userObj.mail
			};
		}
		else{
			response.render('login',{info: '账户或密码错误'});
		}
	});
}

//注销
function logout(request, response, postData){
	delete request.session.user;
	response.redirect('/');
}

//_删除白板
function innerDelFile(fileName, fileContent){
	fs.unlink(fileName, function(err){
		if(err)console.log(err);
	});
}

//_保存白板
function innerSaveFile(fileName){
	fs.writeFile(fileName, fileContent, function(err){
		if(err)console.log(err);
	});
}

//完整保存
function fullSave(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileTitle = jsonObj.title;
	fileTag = jsonObj.tag;
	fileContent = jsonObj.content;
	fileID = jsonObj.id;
	var fileObj = {
		user_id: ObjectID(request.session.user.id),
		title: fileTitle,
		tag: fileTag,
	}
	if(fileID == undefined){
		fileObj.create_date = new Date();
		db.collection('file').insert(fileObj, function(err, records){
			if(err){
				response.send('false');
				return;
			};
			fileID = records[0]._id.toString();
			innerSaveFile(DATA_PATH + fileID + '.html', fileContent);
			//innerDelFile('./data/tmp_' + fileID + '.html');
			response.send(fileID);
		});
	}
	else{
		fileObj.modify_date = new Date();
		db.collection('file').updateById(fileID, {$set: fileObj}, {safe: true}, function(err, records){
			if(records == 1){
				innerSaveFile(DATA_PATH + fileID + '.html', fileContent);
				//innerDelFile('./data/tmp_' + fileID + '.html');
				response.send(fileID);
			}
		});
	}
}

//获得标签列表
function getTagList(request, response, postData){
	db.collection('file').group({tag: true}, {user_id: ObjectID(request.session.user.id)}, {num: 0}, function(obj, prev){prev.num++;}, true, function(err, results){
		if(err){
			response.send('false');
			return;
		}
		else{
			response.send(results);
		}
	});
}

//获得白板文件列表
function getFileList(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	tagName = jsonObj.tag_name;
	db.collection('file').find({tag: tagName,user_id: ObjectID(request.session.user.id)}).sort({create_date: true}).toArray(function(err, records){
		if(records.length != 0){
			var fileArray = new Array();
			for(var i in records){
				var fileID = records[i]._id.toString();
				var fileName = DATA_PATH + fileID + '.html';
				var filePreview = getFilePreview(fileName);
				if(filePreview == null){
					continue;
				}
				var filePreviewObj = {
					id: fileID,
					title: records[i].title,
					preview: filePreview,
					publish: records[i].publish
				}
				fileArray.push(filePreviewObj);
			}
			response.send(JSON.stringify(fileArray));
		}
		else response.send('false');
	});
}

//获得白板内容
function getFileContent(fileName){
	try{
		return fs.readFileSync(fileName, 'utf8');
	}
	catch(err){
		return null;
	}
}

//获得白板预览（过滤处理HTML标记）
function getFilePreview(fileName){
	var fileContent;
	var filePreview = '';
	try{
		fileContent = getFileContent(fileName);
		if(fileContent.length > 50){
			filePreview = fileContent.replace(/(<[^>]+>)| {1,}|\n/g,"").substr(0,50);
		}
		else{
			filePreview = fileContent.replace(/(<[^>]+>)| {1,}|\n/g,"");
		}
	}
	catch(err){
		return null;
	}
	finally{
		return filePreview;
	}
}

//获得白板
function getFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileID = jsonObj.file_id;

	db.collection('file').findById(fileID, {}, {safe: true}, function(err, records){
		var fileName = DATA_PATH + fileID + '.html';
		try{
			var fileContent = getFileContent(fileName);
			var fileObj = {
				title: records.title,
				tag: records.tag,
				content: fileContent
			}
			response.send(JSON.stringify(fileObj));
		}
		catch(err){
			response.send('false');	
		}
	});
}

//删除白板
function delFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileID = jsonObj.file_id;

	var fileName = DATA_PATH + fileID + '.html';
	innerDelFile(fileName);

	db.collection('file').removeById(fileID, {safe: true}, function(err, records){
		if(err){
			response.send('false');	
		}
		else{
			db.collection('comment').remove({file_id: ObjectID(fileID)}, {safe: true}, function(err, records){
				if(err){
					response.send('false');	
				}
				else{
					response.send('true');
				}
			});
		}
	});
}

//查看白板
function viewFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileID = jsonObj.file_id;

	db.collection('file').findById(fileID, {}, {safe: true}, function(err, records){
		var fileName = DATA_PATH + fileID + '.html';
		try{
			var fileContent = getFileContent(fileName);
			var fileObj = {
				title: records.title,
				content: fileContent
			}
			response.send(JSON.stringify(fileObj));
		}
		catch(err){
			response.send('false');	
		}
	});
}

//发布白板
function publishFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileID = jsonObj.file_id;
	publishStat = jsonObj.publish_stat;

	var fileObj = {
		publish: publishStat
	}

	db.collection('file').updateById(fileID, {$set: fileObj}, {safe: true}, function(err, records){
		if(records == 1){
			response.send('true');
		}
		else{
			response.send('false');
		}
	});
}

//匿名查看白板
function vFile(request, response, postData){
	var fileID = request.params.id;
	if(fileID.length != 24){
		response.send("非法请求.");
		return;
	}
	db.collection('file').findById(fileID, {publish: true}, {safe: true}, function(err, records){
		if(records == null){
			response.send("非法请求.");
			return;
		}
		else{
			if(records.publish == true){
				response.render('v',{flag: fileID});
			}
			else{
				response.send("无权查看该笔记.");
			}
		}
	});
}

//显示白板
function showFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	fileID = jsonObj.file_id;

	db.collection('file').findById(fileID, {}, {safe: true}, function(err, records){
		var fileName = DATA_PATH + fileID + '.html';
		try{
			var fileContent = getFileContent(fileName);
			var fileObj = {
				title: records.title,
				content: fileContent
			}
			response.send(JSON.stringify(fileObj));
		}
		catch(err){
			response.send('false');	
		}
	});
}

//修改密码
function modifyPass(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');

	originPass = jsonObj.origin_pass;
	encodeOriginPass = encodePass(originPass);
	newPass = jsonObj.new_pass;
	encodeNewPass = encodePass(newPass);
	userID = request.session.user.id;

	var userObj = {
		_id: ObjectID(userID),
		pass: encodeOriginPass
	}

	db.collection('user').find(userObj).toArray(function(err, records){
		if(records.length != 0){
			db.collection('user').updateById(userID, {$set: {pass: encodeNewPass}}, {safe: true}, function(err, records){
				if(records == 1){
					response.send('true');
				}
				else{
					response.send('false');
				}
			});
		}
		else{
			response.send('false');
		}
	});
}

//获得自动保存标签
function getAutoSaveTag(request, response, postData){
	db.collection('file').find({user_id: ObjectID(request.session.user.id), auto_save: true}).toArray(function(err, records){
		response.send(records.length.toString());
	});
}

//获得发布的标签
function getPublishTag(request, response, postData){
	db.collection('file').find({user_id: ObjectID(request.session.user.id), publish: true}).toArray(function(err, records){
		response.send(records.length.toString());
	});
}

//处理获得的白板列表（封装数组）
function getFileListHandle(records){
	var fileArray = new Array();
	for(var i in records){
		var fileID = records[i]._id.toString();
		var fileName = DATA_PATH + fileID + '.html';
		var filePreview = getFilePreview(fileName);
		if(filePreview == null){
			continue;
		}
		var filePreviewObj = {
			id: fileID,
			title: records[i].title,
			preview: filePreview,
			publish: records[i].publish
		}
		fileArray.push(filePreviewObj);
	}
	return fileArray;
}

//获得自动保存的白板
function getAutoSaveFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	tagName = jsonObj.tag_name;
	db.collection('file').find({auto_save: true,user_id: ObjectID(request.session.user.id)}).toArray(function(err, records){
		if(records.length != 0){
			var fileArray = getFileListHandle(records);
			response.send(JSON.stringify(fileArray));
		}
		else response.send('false');
	});
}

//获得发布白板
function getPublishFile(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	tagName = jsonObj.tag_name;
	db.collection('file').find({publish: true,user_id: ObjectID(request.session.user.id)}).toArray(function(err, records){
		if(records.length != 0){
			var fileArray = getFileListHandle(records);
			response.send(JSON.stringify(fileArray));
		}
		else response.send('false');
	});
}

//提交评论
function submitComment(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	var fileID = jsonObj.file_id;
	var commentContent = jsonObj.content.toString();

	//XSS过滤
	commentContent = commentContent.replace(/<|>|"|script|alert|eval|(|)|.|@/g,"");
	commentContent.trim();
	if(commentContent.length > 140 || commentContent.length <= 0){
		response.send('false');
		return;
	}

	var currentTime = new Date();

	var commentUserName;
	if(request.session.user === undefined){
		commentUserName = '匿名';
	}
	else{
		commentUserName = request.session.user.name;
	}

	var commentObj = {
		file_id: ObjectID(fileID),
		content: commentContent,
		time: currentTime,
		user_name: commentUserName
	}
	db.collection('comment').insert(commentObj, {safe: true},function(err, records){
		if(err){
			response.send('false');
		}
		else response.send('true');
	});
}

function getCommentListHandle(records){
	var commentArray = [];
	for(var i in records){
		var commentTime = records[i].time.format("yyyy-MM-dd HH:mm:ss");;
		var commentContent = records[i].content;
		var commentUserName = records[i].user_name;
		if(commentUserName === undefined){
			commentUserName = '匿名';
		}
		var commentObj = {
			id: records[i]._id.toString(),
			time: commentTime,
			content: commentContent,
			user_name: commentUserName
		}
		commentArray.push(commentObj);
	}
	return commentArray;
}

//获得评论列表
function getCommentList(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	var fileID = jsonObj.file_id;

	db.collection('comment').find({file_id: ObjectID(fileID)}).sort({time: true}).toArray(function(err, records){
		if(records.length != 0){
			var commentArray = getCommentListHandle(records);
			response.send(JSON.stringify(commentArray));
		}
		else response.send('false');
	});
}

//删除评论
function delComment(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	commentID = jsonObj.comment_id;
	fileID = jsonObj.file_id;

	db.collection('file').findById(fileID, {}, {safe: true}, function(err, records){
		if(err){
			response.send('false');
			return;
		}
		if(records.user_id.toString() == request.session.user.id.toString()){
			db.collection('comment').removeById(commentID, {safe: true}, function(err, records){
				if(err){
					response.send('false');	
				}
				else{
					response.send('true');
				}
			});
		}
		else response.send('false');
	});
}

//提交标注
function submitNote(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');

	var fileID = jsonObj.file_id;
	var notePosition = jsonObj.note_position;
	var noteContent = jsonObj.note_content;

	if(notePosition.x2 - notePosition.x1 <= 0 || notePosition.y2 - notePosition.y1 <= 0){
		response.send('false');
		return;
	}

	noteContent = noteContent.replace(/<|>|"|script|alert|eval|(|)|.|@/g,"");
	noteContent.trim();

	if(noteContent.length > 140 || noteContent.length <= 0){
		response.send('false');
		return;
	}

	var currentTime = new Date();

	var noteObj = {
		file_id: ObjectID(fileID),
		user_name: request.session.user.name,
		position: notePosition,
		content: noteContent,
		time: currentTime
	}
	db.collection('note').insert(noteObj, {safe: true},function(err, records){
		if(err){
			response.send('false');
		}
		else response.send('true');
	});
}

//封装标注数组
function getNoteListHandle(records){
	var noteArray = [];
	for(var i in records){
		var noteTime = records[i].time.format("yyyy-MM-dd HH:mm:ss");;
		var noteObj = {
			id: records[i]._id.toString(),
			user_name: records[i].user_name,
			position: records[i].position,
			content: records[i].content,
			time: noteTime
		}
		noteArray.push(noteObj);
	}
	return noteArray;
}

//获得标注列表
function getNoteList(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	var fileID = jsonObj.file_id;

	db.collection('note').find({file_id: ObjectID(fileID)}).sort({time: true}).toArray(function(err, records){
		if(records.length != 0){
			var noteArray = getNoteListHandle(records);
			response.send(JSON.stringify(noteArray));
		}
		else response.send('false');
	});
}

//删除标注
function delNote(request, response, postData){
	jsonString = postData.toString();
	jsonObj = eval('(' + jsonString + ')');
	noteID = jsonObj.note_id;
	fileID = jsonObj.file_id;

	db.collection('file').findById(fileID, {}, {safe: true}, function(err, records){
		if(err){
			response.send('false');
			return;
		}
		if(records.user_id.toString() == request.session.user.id.toString()){
			db.collection('note').removeById(noteID, {safe: true}, function(err, records){
				if(err){
					response.send('false');	
				}
				else{
					response.send('true');
				}
			});
		}
		else response.send('false');
	});
}

exports.checkUserNameRepeat = checkUserNameRepeat;
exports.checkUserMailRepeat = checkUserMailRepeat;
exports.register = register;
exports.login = login;
exports.manage = manage;
exports.create = create;
exports.fullSave = fullSave;
exports.getTagList = getTagList;
exports.getFileList = getFileList;
exports.editFile = editFile;
exports.getFile = getFile;
exports.delFile = delFile;
exports.viewFile = viewFile;
exports.publishFile = publishFile;
exports.vFile = vFile;
exports.showFile = showFile;
exports.logout = logout;
exports.modifyPass = modifyPass;
exports.getAutoSaveTag = getAutoSaveTag;
exports.getPublishTag = getPublishTag;
exports.getPublishFile = getPublishFile;
exports.submitComment = submitComment;
exports.getCommentList = getCommentList;
exports.delComment = delComment;
exports.submitNote = submitNote;
exports.getNoteList = getNoteList;
exports.delNote = delNote;