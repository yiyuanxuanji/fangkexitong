// History Back handling
const BACK_MAIN = "main";
const BACK_MAIN_MID = "/weixin_login/index.html"

function handleHistoryState(onBack, companyID){
  switch(onBack) {
    case BACK_MAIN:
      history.pushState({"onBackDestination": BACK_MAIN_MID, "companyID": companyID}, "Main");
      history.pushState({}, "上海中心");
      break;
    default:
      console.log("No action necessary");
      break;
  }

  window.onpopstate = function(event) {
    console.log(history.state);
    var content = "";
    var companyParameter = ""
    if(event.state && event.state.hasOwnProperty("onBackDestination") && event.state.hasOwnProperty("companyID")) {
      content = event.state.onBackDestination;
      companyParameter = "?companyID=" + event.state.companyID;
    }

    window.location = content + companyParameter;
  };
};
