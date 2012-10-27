var server = require('./server');
var handler = require('./handler');
var sync = require('./sync');

var handleGet = {}
var handlePost = {}

handleGet['/manage'] = handler.manage;
handleGet['/create'] = handler.create;
handleGet['/edit'] = handler.editFile;
handleGet['/v'] = handler.vFile;
handleGet['/logout'] = handler.logout;

handlePost['/checkUserNameRepeat'] = handler.checkUserNameRepeat;
handlePost['/checkUserMailRepeat'] = handler.checkUserMailRepeat;
handlePost['/register'] = handler.register;
handlePost['/login'] = handler.login;
handlePost['/fullSave'] = handler.fullSave;
handlePost['/getTagList'] = handler.getTagList;
handlePost['/getFileList'] = handler.getFileList;
handlePost['/getFile'] = handler.getFile;
handlePost['/delFile'] = handler.delFile;
handlePost['/viewFile'] = handler.viewFile;
handlePost['/publishFile'] = handler.publishFile;
handlePost['/vFile'] = handler.showFile;
handlePost['/modifyPass'] = handler.modifyPass;
handlePost['/getAutoSaveTag'] = handler.getAutoSaveTag;
handlePost['/getPublishTag'] = handler.getPublishTag;
handlePost['/getPublishFile'] = handler.getPublishFile;
handlePost['/submitComment'] = handler.submitComment;
handlePost['/getCommentList'] = handler.getCommentList;
handlePost['/delComment'] = handler.delComment;
handlePost['/submitNote'] = handler.submitNote;
handlePost['/getNoteList'] = handler.getNoteList;
handlePost['/delNote'] = handler.delNote;

server.start(handleGet, handlePost);
sync.createSocket();