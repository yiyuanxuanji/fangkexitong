var args = util.getArgs();
const companyID = args.companyID;
const onBack = args.onBack;
const MAX_RATING = 5;

handleHistoryState(onBack, companyID);

// Entrypoint
$(document).ready(function () {
  // Initialize state
  var state = initState();

  // Initialize values
  loadMenuItems(state);
});

function initState() {
  console.log("Initializing State...");

  var mState = {};

  return mState;
}

function loadMenuItems(state) {

  var renderedMenuURL = util.addParameter(COMMENT_MENU,
                                          "ps_company",
                                          companyID);

  console.log(renderedMenuURL);

  $.ajax({
    url: renderedMenuURL,
    success: function(data) {
      state.menuItem = data.data;

      for(var a = 0; a < data.data.length; a++) {
        var curItem = state.menuItem[a];
        state.menuItem[a].id = a;
        state.menuItem[a].referenceNumber = curItem.SubCode
        state.menuItem[a].incidentDescr = curItem.CONTENT;
        state.menuItem[a].reportTime = curItem.CREATE_DATE;
        state.menuItem[a].canRate = curItem.STATUS === "已完成";
        console.log(curItem);

        // Construct star list
        state.menuItem[a].stars = [];
        if(state.menuItem[a].rating) {
          for(var b = 0; b < MAX_RATING; b++) {
            state.menuItem[a].stars.push({active: curRating > b})
          }
          state.menuItem[a].remark = curItem.COMMENT[0].CONTENT;
        }

        // Add a bar at the bottom for all expect the last
        if(a != data.data.length - 1) {
          state.menuItem[a].hasBar = true;
        }
      }

      // Initialize view
      renderUI(state);

      // Ready input acceptance
      clickActions(state);
    },
    error: function(err) {
      if(!companyID || companyID == "undefined") {
          renderError("You don't have a companyID! We need one to show you your maintenance items.");
      } else {
          console.error("Had trouble downloading the list of mantenance items...");
          console.error(err);
          alert("还未加载完成，请您稍等");
          renderError("Something went wrong when downloading the list of maintenance items. :(");
      }
    }
  })
}

function renderUI(state) {
  console.log("Rendering UI...");

  renderMenu(state);

  // Set up click listeners
  $(".rating_button").click(function(e) {
    const incode = e.target.getAttribute("idx");
    if(e.target.getAttribute("active") === "true") {
      window.location = "review.html?requestNumber=" + incode;
    }
  })


}

function clickActions(state) {
  console.log("Initializing click actions...");

  $("#comment_tab").click(function (evt) {
    window.location = "comment.html?onBack=" + BACK_MAIN + "&companyID=" + companyID;
  });
}

function renderMenu(state) {
  util.jsRender("menuTemplate", "menu_body", state);
}

function renderError(errMsg) {
  util.jsRender("errorTemplate", "content_wrapper", {errMsg: errMsg});
}
