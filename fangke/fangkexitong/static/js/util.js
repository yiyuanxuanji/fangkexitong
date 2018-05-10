// Environment variables are set by prepending a line to this file
const ENVIRONMENTS = {
  DEV: "DEV",               // 开发的环境          /ma_test
  CN_STAGING: "CN_STAGING", // 我们自己的测试服务器  /ma_cn_staging
  STAGING: "STAGING",       // 上海中心的测试       /ma_staging
  PRODUCTION: "PRODUCTION"  // 真实服务器          /ma
}

try {
  console.log("Current environment: " + CUR_ENV);
} catch(e) {
  CUR_ENV = ENVIRONMENTS.DEV;
}

var projectID = "1009";

const FLASH_ATTENTION_DURATION = 2250

const submit_data = "submit_data";
const comment_data = "comment_data";

// Base URLs for different environments
const DEV_BASE = "http://cnspec.myds.me:8888/cnspec" // Same as CN_STAGING
const CN_STAGING_BASE = "http://cnspec.myds.me:8888/cnspec"
const STAGING_BASE = "http://116.228.196.234:7390/shtowert"
const PRODUCTION_BASE = "http://116.228.196.234:7390/shtower"

function getBaseUrl() {
  switch(CUR_ENV) {
    case ENVIRONMENTS.DEV:
      return DEV_BASE;
    case ENVIRONMENTS.CN_STAGING:
      return CN_STAGING_BASE;
    case ENVIRONMENTS.STAGING:
      return STAGING_BASE;
    case ENVIRONMENTS.PRODUCTION:
      return PRODUCTION_BASE;
    default:
      return DEV_BASE;
  }
}

// Default is DEV_BASE
const BASE_URL = getBaseUrl()
console.log("Current BASE_URL: " + BASE_URL);

const MENU_ITEM_URL = BASE_URL + "/Scan3D.asmx/GetRepairInfoList?ps_project=1009&ps_key=AAE7B62F-0705-4933-8FEA-3D1920D1E369&ps_floor=0&ps_room=0&ps_status=0";
const PROBLEM_URL = BASE_URL + "/Scan3D.asmx/GetMaintenanceServType?ps_project=1009&ps_room=";
const MAINTENANCE_SUBMIT_API = BASE_URL + "/Scan3D.asmx/SetRepairInformation";
const SUBMIT_COMMENT_API = BASE_URL + "/Scan3D.asmx/SetAppealInfo";
const SUBMIT_MAINTENANCE_API = BASE_URL + "/Scan3D.asmx/SetRepairInfo";
const REVIEW_DETAILS = BASE_URL + "/Scan3D.asmx/GetRepairInfoDetail?ps_key=AAE7B62F-0705-4933-8FEA-3D1920D1E369&ps_incode="
// Needs: &ps_repair=23674&ps_score=3&ps_content=testRemark
const SUBMIT_REVIEW = BASE_URL + "/Scan3D.asmx/SetRepairComment?ps_project=1009&ps_key=AAE7B62F-0705-4933-8FEA-3D1920D1E369"
const PICTURE_API = "http://upload.cnspec.com.cn/fu/create/";

// CN_STAGING ENDPOINTS
const COMMENT_MENU = CN_STAGING_BASE + "/Scan3D.asmx/GetAppealInfoList?ps_project=1009&ps_floor=0&ps_room=0&ps_key=AAE7B62F-0705-4933-8FEA-3D1920D1E369"
const ROOM_URL = "http://www.cnspec.cn/Scan3D.asmx/GetFloorMaps?ps_project=1009&ps_company=";


var _URL = window.URL || window.webkitURL;

var util = {
  getArgs: function(url) {
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
  },
  ajaxFalse: function(url, data, callback, method) {
		!method ? method = 'post' : method;
		$.ajax({
			type: method,
			url: url,
			dataType: "json",
			data: data,
			async:false,
			complete: function(XMLHttpRequest) {
				var status = XMLHttpRequest.status;
				if (status < 300) {
					if (XMLHttpRequest.responseText) {
						var data = JSON.parse(XMLHttpRequest.responseText);
						callback(data);
					}
				} else if (status < 500) {
					if (XMLHttpRequest.responseText) {
						var data = JSON.parse(XMLHttpRequest.responseText);
						callback(data);
					}
				} else if (status === 500) {
					$.toast("服务器异常！", "text");
				} else {
					$.toast("服务器超时！", "text");
				}
			}
		});
	},
  scrollTo: function(id) {
    $('html, body').animate({
      scrollTop: $("#" + id).offset().top
    }, 1000);
  },
  flashAttention: function(id, delay) {
      setTimeout(function() {
          $("#" + id).addClass("flash_attention");
      }, delay);
      setTimeout(function() {
          $("#" + id).removeClass("flash_attention");
      }, delay + FLASH_ATTENTION_DURATION);
  },
  getRoomURL: function (companyID, contactTelephone) {
      return  ROOM_URL +  companyID + "&ps_phone=" + contactTelephone;
  },
  addFirstParameter: function (url, id, value) {
    return url + "?" + id + "=" + value;
  },
  addParameter: function (url, id, value) {
    return url + "&" + id + "=" + value;
  },
  dynamicSort: function (property) {
      return function (a,b) {
          return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      }
  },
  jsRender: function (templateID, containerID, data) {
    var template = $.templates($("#" + templateID).html());
    var renderedTemplate = template.render(data);
    $("#" + containerID).html(renderedTemplate);
  },
  uuid: function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  },
}

var DEBUG = util.getArgs().debug === 'true';
