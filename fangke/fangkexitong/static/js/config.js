/* 设置cookie */
function setCookie(name, value, iDay){
  var oDate=new Date();
  oDate.setDate(oDate.getDate()+iDay);
  document.cookie=name+'='+value+';expires='+oDate;
};
/* 获取cookie */
function getCookie(name){
  var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg)){
  	  return unescape(arr[2]);
  }else{
  	  return null;
  }
}
/* 删除cookie */
function removeCookie(name){
  setCookie(name, "", -1); //-1就是告诉系统已经过期，系统就会立刻去删除cookie
};
//去左右空格;
function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
}
//js毫秒级时间戳转换成yyyy-mm-dd :格式
function allformatDate(timestamp) {
  var CurrentDate = "";
  now = new Date(timestamp);
  var year = now.getFullYear();
  CurrentDate += year + "-";
  var month = now.getMonth()+1;
  if (month >= 10 ){
    CurrentDate += month + "-";
  }
  else{
    CurrentDate += "0" + month + "-";
  }
  var day = now.getDate();
  if (day >= 10 ) {
    CurrentDate += day + " ";
  }
  else{
    CurrentDate += "0" + day + " ";
  }
  var hour = now.getHours();
  if (hour >= 10 ) {
    CurrentDate += hour + ":";
  }
  else{
    CurrentDate += "0" + hour + ":";
  }
  var minute = now.getMinutes();
  if (minute >= 10 ) {
    CurrentDate += minute + ":";
  }
  else{
    CurrentDate += "0" + minute + ":";
  }
  var second = now.getSeconds();
  if (second >= 10 ) {
    CurrentDate += second ;
  }
  else{
    CurrentDate += "0" + second ;
  }
  return CurrentDate;
}

//转义符号
function escapeHtml(string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

//js毫秒级时间戳转换成yyyy-mm-dd :格式
function formatDate(timestamp) {
  var CurrentDate = "";
  now = new Date(timestamp);
  var year = now.getFullYear();
  CurrentDate += year + "-";
  var month = now.getMonth()+1;
  if (month >= 10 ){
    CurrentDate += month + "-";
  }
  else{
    CurrentDate += "0" + month + "-";
  }
  var day = now.getDate();
  if (day >= 10 ) {
    CurrentDate += day + "";
  }
  else{
    CurrentDate += "0" + day + "";
  }
  // var hour = now.getHours();
  // if (hour >= 10 ) {
  //   CurrentDate += hour + ":";
  // }
  // else{
  //   CurrentDate += "0" + hour + ":";
  // }
  // var minute = now.getMinutes();
  // if (minute >= 10 ) {
  //   CurrentDate += minute + ":";
  // }
  // else{
  //   CurrentDate += "0" + minute + ":";
  // }
  // var second = now.getSeconds();
  // if (second >= 10 ) {
  //   CurrentDate += second ;
  // }
  // else{
  //   CurrentDate += "0" + second ;
  // }
  return CurrentDate;
}

function timmAxis_year(timestamp) {
  var CurrentDate = "";
  now = new Date(timestamp);
  var year = now.getFullYear();
  CurrentDate += year;
  return CurrentDate;
}

function timmAxis_date(timestamp) {
  var CurrentDate = "";
  now = new Date(timestamp);
  var year = now.getFullYear();
  // CurrentDate += year + "-";
  var month = now.getMonth()+1;
  if (month >= 10 ){
    CurrentDate += month + "/";
  }
  else{
    CurrentDate += "0" + month + "/";
  }
  var day = now.getDate();
  if (day >= 10 ) {
    CurrentDate += day + "";
  }
  else{
    CurrentDate += "0" + day + "";
  }
  // var hour = now.getHours();
  // if (hour >= 10 ) {
  //   CurrentDate += hour + ":";
  // }
  // else{
  //   CurrentDate += "0" + hour + ":";
  // }
  // var minute = now.getMinutes();
  // if (minute >= 10 ) {
  //   CurrentDate += minute + ":";
  // }
  // else{
  //   CurrentDate += "0" + minute + ":";
  // }
  // var second = now.getSeconds();
  // if (second >= 10 ) {
  //   CurrentDate += second ;
  // }
  // else{
  //   CurrentDate += "0" + second ;
  // }
  return CurrentDate;
}

/* 判断是PC还是移动 */
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
              "SymbianOS", "Windows Phone",
              "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
      }
  }
  return flag;
}
/* table目录滑动切换 */
function show(time,obj){
  $(obj).css('border-bottom','solid 0.03rem #999').parent().siblings('li').find('div').css('border-bottom','none');
  $('.content').stop().animate({
    'left':time
  },1000);
}
/*
//覆盖微信本地缓存
function version(){
  var NowVersion = Getattrid().version;
  if (isNaN(NowVersion)) {
      NowVersion = 0;
  }else {
      NowVersion++ ;
  }
  return NowVersion;
}
*/
/* 地址 */
function site(){
  //if(window.location.host === "www.navimi.com.cn") {
      return "http://cnspec.myds.me:9090/GLPMap/services"
  //}
	//return "http://ltwechat.shtowercbre.com:9090"
}

function cancellation (){
  localStorage.removeItem("Token");
  localStorage.removeItem("UserId");
  window.location.href = "map_login.html";
}

function cancellationLogin (){
  var r = confirm("是否确认注销!")
  if (r==true){
    //是
    cancellation();
    }
  else{
    //否
    }
  };
