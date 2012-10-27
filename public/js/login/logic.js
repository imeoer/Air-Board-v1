function setVertMid(element){ //垂直居中
	$(element).css({
		position:'absolute',
		left:($(window).width()-$(element).outerWidth())/2,
		top:($(window).height()-$(element).outerHeight()-20)/2+$(document).scrollTop()
	});
}
$(window).resize(function(){
	setVertMid('#main');
});
function showTip(objStr,tipStr)
{
	//$(objStr).fadeTo("fast",0.3);
	$(objStr).html(tipStr);
	$(objStr).show();
	//$(objStr).fadeTo("fast",1.0);
}

function isIE(){
	return navigator.appName.indexOf("Microsoft Internet Explorer")!=-1 && document.all;
}
function isIE6() {
	return navigator.userAgent.split(";")[1].toLowerCase().indexOf("msie 6.0")=="-1"?false:true;
}
function isIE7(){
	return navigator.userAgent.split(";")[1].toLowerCase().indexOf("msie 7.0")=="-1"?false:true;
}
function isIE8(){
	return navigator.userAgent.split(";")[1].toLowerCase().indexOf("msie 8.0")=="-1"?false:true;
}
function isNN(){
	return navigator.userAgent.indexOf("Netscape")!=-1;
}
function isOpera(){
	return navigator.appName.indexOf("Opera")!=-1;
}
function isFF(){
	return navigator.userAgent.indexOf("Firefox")!=-1;
}
function isChrome(){
	return navigator.userAgent.indexOf("Chrome") > -1;
}

$(document).ready(
	function(){
		$(window).resize();
		$("#reg-button").leanModal({overlay:0.8});
		$('#slider').nivoSlider({effect:'fade',pauseTime:10000});
		$('#reg-info').hide();
		if($('#login-info-text').html() == '账户或密码错误'){
			$('#login-info-logo').show();
			$('#login-info-text').css('color','#aa0000');
		}
		//检查注册信息格式
		$(".reg-input").focus
		(
			function()
			{
				$('#reg-info').hide();
				//$('#reg-info').fadeOut('fast');
			}
		);
		$("#reg-user-name").blur
		(
			function()
			{
				if(checkRegUserName()==0&&$("#reg-user-name").attr("value")!="")
					showTip('#reg-user-name-tip','● 账户应为4-16位的非特殊字符组成');
				else 
				{
					if($("#reg-user-name").attr("value")!="")checkUserNameRepeat();
					else showTip('#reg-user-name-tip','<br/>');
				}
			}
		);
		$("#reg-user-pass").blur
		(
			function()
			{
				if(!checkRegUserPass()&&$("#reg-user-pass").attr("value")!="")
					showTip('#reg-user-pass-tip','● 密码长度应至少为5位');
				else showTip('#reg-user-pass-tip','<br/>');
				if(checkRegUserRepass())
					showTip('#reg-user-repass-tip','<br/>');
				else
					if($('#reg-user-repass-tip').attr("value")!="")
						showTip('#reg-user-repass-tip','● 密码前后不匹配');
			}
		);
		$("#reg-user-repass").blur
		(
			function()
			{
				if(!checkRegUserRepass()&&$("#reg-user-repass").attr("value")!="")
					showTip('#reg-user-repass-tip','● 密码前后不匹配');
				else showTip('#reg-user-repass-tip','<br/>');
			}
		);
		$("#reg-user-mail").blur
		(
			function()
			{
				if(checkRegUserEmail()==0&&$("#reg-user-mail").attr("value")!="")
					showTip('#reg-user-mail-tip','● 电子邮件格式不正确');
				else 
				{
					if($("#reg-user-mail").attr("value")!="")checkUserMailRepeat();
					else showTip('#reg-user-mail-tip','<br/>');
				}
			}
		);
		$('#user-input').focus();
		$('#pass-input').bind('keydown', function (e) {
			var key = e.which;
			if (key == 13) {
				checkLoginForm();
			}
		});

		if(isIE6() || isIE7()){
			//$('body').hide();
			alert('您的浏览器内核太旧[IE6/IE7]，若想体验更好的浏览效果，或许您可以试试浏览器的 “高速模式”。');
			//window.close();
		}
	}
);
function checkRegUserName()
{
	if(!$("#reg-user-name").attr("value").match(/^[a-zA-Z][a-z0-9A-Z_]{3,15}$/))
		return false;
	else return true;
}
function checkRegUserPass()
{
	if(!$("#reg-user-pass").attr("value").match(/^.{5,}$/))
		return false;
	else return true;
}
function checkRegUserRepass()
{
	if($("#reg-user-repass").attr("value")!=$("#reg-user-pass").attr("value"))
		return false;
	else return true;
}
function checkRegUserEmail()
{
	if(!$("#reg-user-mail").attr("value").match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/))
		return false;
	else return true;
}
function createXMLHttp()
{
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}
var isUserNameRepeat;
var isUserMailRepeat;
function checkUserNameRepeat()
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/checkUserNameRepeat");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				isUserNameRepeat = xmlHttp.responseText;
				if(isUserNameRepeat == "true")
					showTip('#reg-user-name-tip','● 帐户名已存在了，换一个吧');
				else showTip('#reg-user-name-tip','<br/>');
			}
		}
	}
	xmlHttp.send($("#reg-user-name").attr("value"));
}
function checkUserMailRepeat()
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/checkUserMailRepeat");
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				isUserMailRepeat = xmlHttp.responseText;
				if(isUserMailRepeat == "true")
					showTip('#reg-user-mail-tip','● 该邮箱已被注册，请认真对待');
				else showTip('#reg-user-mail-tip','<br/>');
			}
		}
	}
	xmlHttp.send($("#reg-user-mail").attr("value"));
}
function checkLoginForm(){
	if($('#user-input').val() == '' || $('#pass-input').val() == ''){
		return false;
	}
	else{
		$('#login-info-text').html('正在登录...');
		document.forms[0].submit();
	}
}
function checkRegForm(){
	if(checkRegUserName()&&checkRegUserPass()&&checkRegUserRepass()&&checkRegUserEmail()&&isUserNameRepeat=='false'&&isUserMailRepeat=='false')
	{
		//$('#reg-info').fadeTo("fast",0.3);
		$('#reg-info-ico').css({"background":"url('./img/login/loading.gif') no-repeat"});
		$('#re-reg-button').fadeOut('fast');
		$('#reg-info-tip').html('正在注册...');
		$('#reg-info').show();

		var userName = $("#reg-user-name").attr("value");
		var userPass = $("#reg-user-pass").attr("value");
		var userMail = $("#reg-user-mail").attr("value");

		register(userName,userPass,userMail);
		//$('#reg-info').fadeTo("fast",1.0);
	}
	else
	{
		//$('#reg-info').fadeTo("fast",0.3);
		$('#reg-info-ico').css({"background":"url('./img/login/info_icon.png') no-repeat"});
		$('#reg-info-tip').html('注册信息填写有误');
		$('#reg-info').show();
		//$('#reg-info').fadeTo("fast",1.0);
	}
}
function register(userName, userPass, userMail)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/register");
	var newUser = {
		name: userName,
		pass: userPass,
		mail: userMail
	}
	var newUserAsJSON = JSON.stringify(newUser);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var isRegSuccess = xmlHttp.responseText;
				$('#reg-info-ico').css({"background":"url('./img/login/info_icon.png') no-repeat"});
				if(isRegSuccess == "true"){
					$('#reg-info-tip').html('注册成功，3秒后关闭');
					setTimeout(function(){
						$("#lean_overlay").click();
					}, 5000);
				}
				else{
					$('#reg-info-tip').html('注册失败');
				}
				$('#reg-info').show();
			}
		}
	}
	xmlHttp.send(newUserAsJSON);
}
function login(userName, userPass)
{
	var xmlHttp = createXMLHttp();
	xmlHttp.open("POST","/login");
	var user = {
		name: userName,
		pass: userPass
	}
	var userAsJSON = JSON.stringify(user);
	xmlHttp.onreadystatechange = function(){
		if(xmlHttp.readyState == 4){
			if(xmlHttp.status == 200){
				var isUserNameRepeat = xmlHttp.responseText;
				alert(isUserNameRepeat);
			}
		}
	}
	xmlHttp.send(userAsJSON);
}