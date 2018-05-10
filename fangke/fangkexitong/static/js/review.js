var args = util.getArgs();
const requestNumber = args.requestNumber;

const MAX_RATING = 5;
const MAX_REMARK_LENGTH = 250;

// Entrypoint
$(document).ready(function () {
  // Initialize state
  var state = initState();

  // Initialize values
  loadReview(state);
});

function initState() {
  var mState = {
    requestNumber: requestNumber,
    curRating: 0
  };

  return mState;
}

function loadReview(state) {

  var renderedReviewURL = REVIEW_DETAILS + requestNumber;

  $.ajax({
    url: renderedReviewURL,
    success: (data) => {
      console.log(data);

      var eventData = data.data[0];

      state.data = eventData;
      state.repairmanName = eventData.REPAIR.SERVICE_OFFICER;
      state.repairmanPhone = eventData.REPAIR.SERVICE_MOBILE;
      state.startTime = eventData.CREATE_DATE;
      state.companyID = eventData.COMPANY_INCODE;

      renderUI(state);
    },
    error: (error) => {
      alert("对不起，服务器忙。");
    }
  })
}

function renderStarWidget(state) {
  // Construct star list
  var stars = [];
  for(var b = 0; b < MAX_RATING; b++) {
    stars.push({
      active: state.curRating > b,
      idx: b
    })
  }

  util.jsRender("starWidgetTemp", "review_rating_widget", {stars: stars});

  // Set on click listeners
  $(".star").click(e => {
    const newRating = parseInt(e.target.getAttribute("idx")) + 1;
    state.curRating = newRating;
    renderStarWidget(state);
  })
}

function renderUI(state) {
  // Render everything
  util.jsRender("reviewTemp", "body_holder", state);

  renderStarWidget(state);

  $("#remark").on("change keyup paste", (e) => {
    state.remarkText = e.target.value;
  });

  $("#submit_button").click(e => {
    // Validate input
    const remarkText = state.remarkText;

    if(!state.requestNumber) {
      alert("无此订单")
      return;
    } else if(state.curRating <= 0) {
      alert("请对服务评价")
      return;
    } else if(remarkText.length >= MAX_REMARK_LENGTH) {
      alert("输入其他说明字数超过 " + MAX_REMARK_LENGTH + " , 现在有 " + remarkText.length);
      return;
    }

    // ps_repair, score, content
    var submitURL = util.addParameter(SUBMIT_REVIEW, "ps_repair", state.requestNumber);
    submitURL = util.addParameter(submitURL, "ps_score", state.curRating);
    submitURL = util.addParameter(submitURL, "ps_content", remarkText);

    console.log(submitURL);

    // Submit
    $.ajax({
      url: submitURL,
      success: data => {
        // Redirect somewhere else
        setTimeout(() => {
          var backURL = util.addFirstParameter("maintenance_menu.html", "companyID", state.companyID);
          backURL = util.addParameter(backURL, "onBack", "main");
          window.location = backURL;
        }, 2500);

        util.jsRender("okTemplate", "body_holder", {});
      },
      error: err => {
        console.error(err);
        alert("提交失败");
      }
    })
  })
}
