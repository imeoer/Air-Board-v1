var express = require('./module/express');
var jqtpl = require("./module/jqtpl");
var url = require("url");
var path = require('path');

var view_dir = path.join(__dirname, 'views');
var static_dir = path.join(__dirname, 'public');

function start(handleGet, handlePost){
	var app = express.createServer();

	app.configure(function() {
		app.set('view engine', 'html');
		app.set('view options', { layout: false });
		app.register(".html", jqtpl.express);
		app.set('views', view_dir);
		app.use(express.errorHandler());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'syn_editor' }));
		app.use(express.methodOverride());
		app.use(express.bodyParser());
	});

	app.configure('development', function(){
		app.use(express.static(static_dir));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	app.configure('production', function(){
		var maxAge = 3600000 * 24 * 30;
		app.use(express.static(static_dir, { maxAge: maxAge }));
		app.set('view cache', true);
	});

	function checkAuth(request){
		//console.log(request.session);
		if(request.session !== undefined){
			if(request.session.user !== undefined){
				return true;
			}
			else return false;
		}
		else return false;
	}

	app.get('/edit=:id', function(request, response){
		if(checkAuth(request) == true){
			var postData = "";
			console.log("id:"+request.params.id);
			if(request.params.id != null){
				handleGet['/edit'](request, response, postData);
			}
			else{
				response.send("Get Not Found");
			}
		}
		else
			response.send("Get Not Found");
	});

	app.get('/view=:id', function(request, response){
		if(checkAuth(request) == true){
			response.render('v',{flag: request.params.id});
		}
		else{
			response.send("Get Not Found");
		}
	});

	app.get('/v=:id', function(request, response){
		var postData = "";
		handleGet['/v'](request, response, postData);
	});

	app.get('/edit', function(request, response){
		response.send("Get Not Found");
	});

	app.get('/view', function(request, response){
		response.send("Get Not Found");
	});

	app.get('/v', function(request, response){
		response.send("Get Not Found");
	});

	app.get('*', function(request, response){
		var pathname = url.parse(request.url).pathname;
		var postData = "";
		if(pathname == '/'){
			if(checkAuth(request) == true)
				response.redirect('/manage');
			else;
				response.render('login',{info:'输入账户密码以登录'});
		}
		else{
			if(typeof(handleGet[pathname]) === 'function'){
				if(checkAuth(request) == true)
					handleGet[pathname](request, response, postData);
				else
					response.redirect('/');
			}
			else
				response.send("Get Not Found");
		}
			
	});

	app.post('/vFile', function(request, response){
		var postData = '';
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
		});
		request.addListener("end", function(){
			handlePost['/vFile'](request, response, postData);
		});
	});

	app.post('*', function(request, response){
		var pathname = url.parse(request.url).pathname;
		var postData = "";
		if(pathname == '/login'){
			handlePost[pathname](request, response, postData);
			return;
		}
		if(typeof(handlePost[pathname]) === 'function'){
			if(checkAuth(request) == true ||
				pathname == '/checkUserNameRepeat' || //特殊的无权限请求
				pathname == '/checkUserMailRepeat' ||
				pathname == '/register' ||
				pathname == '/submitComment' ||
				pathname == '/getCommentList' ||
				pathname == '/getNoteList'
			){
				request.addListener("data", function(postDataChunk) {
					postData += postDataChunk;
				});
				request.addListener("end", function(){
					var pathname = url.parse(request.url).pathname;
					handlePost[pathname](request, response, postData);
				});
			}
			else{
				response.send("No Access");
			}
		}
		else{
			//response.redirect('./login.html');
			response.send("Post Not Found");
		}
	});
	app.listen(8080);
	console.log('Http server running at 8080');
}

exports.start = start;