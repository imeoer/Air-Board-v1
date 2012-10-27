/*
	使用Socket.io进行白板同步
*/

var socket = require('./module/socket.io');
var io = socket.listen(8899, { log: false });
var fileMap = new Object();
var userMap = new Object();
function createSocket(){
	io.sockets.on('connection', function (socket) {
		socket.on('init', function (data) {
			if(data.user_type == 'viewer'){
				if(fileMap[data.file_id]){
					fileMap[data.file_id].push(this);
				}
				else{
					fileMap[data.file_id] = [];
					fileMap[data.file_id].push(this);
				}
			}
		});
		socket.on('sync', function (data) {
			if(fileMap[data.file_id]){
				for(var i in fileMap[data.file_id]){
					fileMap[data.file_id][i].emit('patch', {file_patch: data.file_patch});
				}
			}
		});
		socket.on('manageConnect', function (data) {
			//userMap[] = this;
		});
		socket.on('msg', function (data) {
			this.emit('msg', {update: true});
		});
	});
	//console.log('Sync server running at 8899');
}
exports.createSocket = createSocket;