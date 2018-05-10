var oJson = util.getArgs();
var phoneNumber = oJson.phoneNumber;
var companyID = oJson.companyID;

var state;

handleHistoryState(BACK_MAIN, companyID);

const COMMENT_AREAS = ["人员",
                       "办公环境",
                       "设备设施",
                       "公共区域",
                       "其他",
]

// On page load
$(document).ready(function() {
    state = getState();

    askForCompanyInfo();
    renderUI();

    setupListeners();
});

function getState() {
    // Check localStorage
    var mState = {};

    mState.curPictureID = 0;
    mState.commentTime = new Date().toDateString();
    mState.pictures = [];
    mState.types = [];


    // Set up API fields
    mState.api = {};

    mState.api.projectid = 1009;
    mState.companyID = companyID;
    mState.api.RoomId = 0;
    mState.api.UnitFullName = "";
    mState.api.Content = "";
    mState.api.Linkman = "";
    mState.api.LinkTel = phoneNumber;
    mState.api.remark = "";


    for(var a = 0; a < COMMENT_AREAS.length; a++) {
        var curArea = {};
        curArea.typeLabel = COMMENT_AREAS[a];
        curArea.typeIndex = a;

        if(a < COMMENT_AREAS.length - 1) {
            curArea.notLast = true;
        }
        mState.types.push(curArea);
    }

    mState.phoneNumber = phoneNumber;
    mState.companyID = companyID;

    // Get from Server
    return mState;
}

function renderUI() {
    var typeTemplate = $.templates($("#commentTypeTemplate").html());
    var renderedTemp = typeTemplate.render(state);
    $("#type_holder").html(renderedTemp);
}

function setupListeners() {
    $("#comment_menu_tab").click(function() {
        location.href = "comment_menu.html?companyID=" + companyID
    });

    $("#submit_button").click(function() {
      // Save to local storage
      localStorage.setItem(comment_data, JSON.stringify(state));

      // Navigate to confirm page
      window.location.href = "comment_confirm.html"
    })

    menuListeners();
}

function menuListeners() {
    for(var a = 0; a < state.types.length; a++) {
        $("#type_" + a).click(function(evt) {
            state.typeIndex = $("#" + evt.target.id).attr("index");
            state.typeLabel = state.types[state.typeIndex].typeLabel;

            renderPhaseTwo();
        });
    }
}

function renderPhaseTwo() {
    var template = $.templates($("#phaseTwoTemplate").html());
    var renderedTemplate = template.render(state);
    $("#body_holder").html(renderedTemplate);

    var pictureTemplate = $.templates($("#pictureWrapperTemplate").html());
    var renderedPicTemp = pictureTemplate.render();
    $("#picture_wrapper_holder").html(renderedPicTemp);

    $("#submit_button").show('fast');

    // Set up picture add
    setupCamera();

    $("#selectType").click(function() {
      // Rerender the preceding screen
      console.log(state);
      util.jsRender("selectCategoryTemplate", "body_holder", state);
      $("#submit_button").hide('fast');
      setupListeners();
    })

    // Set up focus listeners
    $("#comment_box").focusout(function(evt) {
      state.api.remark = evt.target.value;
    });

    $("#location_box").focusout(function(evt) {
      state.api.RoomId = evt.target.value;
    });

    $("#contact_name_box").focusout(function(evt) {
      state.api.Linkman = evt.target.value;
    });

    $("#contact_phone_box").focusout(function(evt) {
      state.api.LinkTel= evt.target.value;
    });
}

function askForCompanyInfo() {
    $.ajax({
        url: util.getRoomURL(companyID, phoneNumber),
        success: function (data) {
            var companyData = data.data.LevelMaps[0];

            state.api.UnitFullName = companyData.COMPANY;
            state.api.Linkman = companyData.NAME;
        },
        error: function (err) {
            alert("Something went wrong downloading company information");
        }
    });
}
