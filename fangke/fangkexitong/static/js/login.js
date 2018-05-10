$(function(){
  var u = navigator.userAgent;
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

  // 判断是否绑定  openid
  function myfun() {
    var str = location.href;
    var num = str.indexOf("=");
    var num1 = str.indexOf("&");
    str = str.slice(num+1, num1); //取得所有参数   stringvar.substr(start [, length ]
    return str;
  }
  //判断是否绑定过自动登录
  if(localStorage.hasOwnProperty("openId") && localStorage.getItem("openId")!="undefined"){
    $.ajax({
      url:''+site()+'/V1/Administration/LoginWithWeChat',
      type:'post',
      dataType:'json',
      data:{
        userid:0,
        openid:localStorage.getItem("openId"),
        device:'',
        osversion:''
      },
      success:function(data){
         //console.log(data);
         setCookie('Token',data.data.Token);
         localStorage.setItem('apidata',JSON.stringify(data));
         var CompanyId = data.data.CompanyId;
         if(data.success==1){
             window.location ="index.html";
         }else {
            $('.allContent').hide();
         }
      }
    });
  }else{
    $('.allContent').hide();
  }
  //截取url上的参数
  function getArgs(url) {
      var args = new Object(); //声明一个空对象
      if(!url){
          var query = window.location.search.substring(1); // 取查询字符串，如从http://www.snowpeak.org/testjs.htm?a1=v1&a2=&a3=v3#anchor 中截出 a1=v1&a2=&a3=v3。
      }else{
          var query = url.split('?')[1];
      }
      var pairs = query.split("&"); // 以 & 符分开成数组
      for (var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('='); // 查找 "name=value" 对
        if (pos == -1) continue; // 若不成对，则跳出循环继续下一对
        var argname = pairs[i].substring(0, pos); // 取参数名
        var value = pairs[i].substring(pos + 1); // 取参数值
        value = decodeURIComponent(value); // 若需要，则解码
        args[argname] = value; // 存成对象的一个属性
      }
      return args; // 返回此对象
    }
    // 获取openid
    var openid = "";
    $.ajax({
        url: ""+site()+"/V1/Administration/OpenId",
    type: "get",
    data: {
      code:getArgs().code
    },
    dataType: 'json',
    success: function(data) {
      console.log(data);
      if (data.openid!="undefined") {
        localStorage.setItem("openId",data.openid);
      }

      $('.loginBtn').removeAttr('disabled').css('background','#46b8e4');
      // if (localStorage.getItem('openId')=="undefined") {
      //   // localStorage.clear();
      // }
    }
  });
  // 登录
  $('.denglv').click(function(){
    phone();
  });
  // 登录手机验证
  function phone(){
    var name = $('.inpPhone').val();
    var pass = $('.inpPass').val();
      if(name==""){
        alert("手机号码不能为空");
        return false;
      // }else if(!(/^1[34578]\d{9}$/.test(name))){
      //   // alert("请输入正确的手机号");
      //   // return false;
      }else if(pass==""){
        alert("密码不能为空");
        return false;
      }else if(pass.length<6||pass.length>20){
        alert("密码长度为6-20位");
        return false;
      }else{
        login();
    }
  }
  // 验证账户   获取openID
  var CompanyId = "";
  function login() {
    $.ajax({
      type: "get",
      url: "http://106.14.178.162:8830/api/users/login?username="+$('.inpPhone').val()+"&password="+$('.inpPass').val(),
      contentType: "application/json",
      dataType: 'json',
      type: "GET",
      xhrFields: {
         withCredentials: true
      },
      crossDomain: true,
      success: function(data, status, xhr) {
        if(data.success==0){
          alert(data.data);
        }else if (data.success==1) {
          var sessionid = data.data;
          localStorage.setItem('sessionid',sessionid);
          $.ajax({
            type: "get",
            url: "http://mobile.cnspec.cn:9090/WeChatOfficialAccounts/services/V1/Administration/VisitorCompanyId?mobile="+$('.inpPhone').val(),
            dataType: 'json',
            success: function(data) {
              console.log(data);
              if(data.success==0){
                alert(data.msg);
              }else if (data.success==1) {
                CompanyId = data.data.CompanyId;
                localStorage.setItem('CompanyId',CompanyId);
                window.location.href="./visitor_invitation.html?companyID="+data.data.CompanyId;
              }
            }
          });
        }
      }
    });
  }
  // 发送验证码
  $('.fasong').click(function(){
    var registrationPhone = $('.registrationPhone').val();
    if(registrationPhone==""){
        alert("手机号码不能为空");
        return false;
      }else if(!(/^1[34578]\d{9}$/.test(registrationPhone))){
        alert("请输入正确的手机号");
        return false;
      }else{

        $.ajax({
          url:''+site()+'/V1/Administration/SendCaptcha',
          type:'post',
          dataType:'json',
          data:{
            'mobile':$('.registrationPhone').val(),
            'userid':0,
            'openId':localStorage.getItem('openId'),
            'device':'',
            'osversion':''
          },
          success:function(data){
            console.log(data);
            if(data.success==0){
              alert(data.msg);
            }
          }
        });
        var a = 60;
        var $this = $(this);
      var  show = setInterval(function(){
        $this.css('background','#ddd');
        a--;
        $this.html(a +'s').attr('disabled','disabled');
        if(a<=0){
          clearInterval(show);
          a=5;
          $this.html('再次发送').css('background','#46b8e4').attr('disabled',false);
        }
      },1000);
      }
  })
  // 绑定
  $('.zhuce').click(function(){
    var registrationPhone = $('.registrationPhone').val();
    var registrationCode = $('.registrationCode').val();
    var registrationPass = $('.registrationPass').val();
    if(registrationPhone==""){
        alert("手机号码不能为空");
        return false;
      }else if(!(/^1[34578]\d{9}$/.test(registrationPhone))){
        alert("请输入正确的手机号");
        return false;
      }else if(registrationCode==""){
        alert("验证码不能为空");
        return false;
      }else if(registrationCode.length!=4){
        alert("请输入正确的验证码");
        return false;
      }else if(registrationPass==""){
        alert("密码不能为空");
        return false;
      }else if(registrationPass.length<6||registrationPass.length>20){
        alert("密码长度为6-20位");
        return false;
      }else{
        // $.ajax({
        //   url:''+site()+'/V1/Administration/BindMobile',
        //   type:'post',
        //   dataType:'json',
        //   data:{
        //     'mobile':registrationPhone,
        //     'captcha':registrationCode,
        //     'password':hex_md5(registrationPass),
        //     'userid':0,
        //     'openid':localStorage.getItem('openId'),
        //     'device':'',
        //     'osversion':''
        //   },
        //   success:function(data){
        //     console.log(data);
        //     console.log(CompanyId);
        //     if(data.success==1){
        //       $.ajax({
        //       url:''+site()+'/V1/Administration/LoginWithWeChat',
        //       type:'post',
        //       dataType:'json',
        //       data:{
        //         userid:0,
        //         openid:localStorage.getItem('openId'),
        //         device:'',
        //         osversion:''
        //       },
        //       success:function(data){
        //          localStorage.setItem('apidata',JSON.stringify(data));
        //          var CompanyId = data.data.CompanyId;
        //          localStorage.setItem('Token',data.data.Token);
        //          localStorage.setItem('userid',data.data.UserId);
        //          if(data.success==1){
        //              alert("绑定成功");
        //              window.location ="index.html";
        //          }
        //       }
        //     });
        //     }else{
        //       alert(data.msg);
        //     }
        //   }
        // })
      }
  });
});
