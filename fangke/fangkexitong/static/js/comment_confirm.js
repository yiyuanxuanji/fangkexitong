var oJson = util.getArgs();
var phoneNumber = oJson.phoneNumber;
var companyID = oJson.companyID;

var state;

$(document).ready(function (){
  renderConfirmation();
});

function renderConfirmation() {
  if (comment_data in localStorage) {
    // Get data from localStorage
    state = JSON.parse(localStorage.getItem(comment_data));
    console.log(state);

    // Render Template
    var confirmationTemplate = $.templates($("#confirmationTemplate").html());
    var confirmationData = confirmationTemplate.render(state);
    $("#confirmation_wrapper").html(confirmationData);

    // Display pictures
    for(p in state.pictures) {
      var picture = state.pictures[p];
      var picID = "#pic_" + picture.pictureFileName;
      var picUrl = 'url("http://' + picture.pictureURL + '");';
      console.log(picUrl + "\n" + picID);
      $(picID).attr('style', 'background-image: ' + picUrl);
    }

    // Set up submit button
    clickListeners();
  }
}

function clickListeners() {
    $("#confirm_button").click(function(evt) {
        var data = JSON.stringify(state);

        // Create submission url
        var submissionUrl = SUBMIT_COMMENT_API;
        submissionUrl = util.addFirstParameter(submissionUrl, "RoomId", state.api.RoomId);
        submissionUrl = util.addParameter(submissionUrl, "Content", state.typeLabel);
        submissionUrl = util.addParameter(submissionUrl, "Linkman", state.api.Linkman);
        submissionUrl = util.addParameter(submissionUrl, "LinkTel", state.api.LinkTel);
        submissionUrl = util.addParameter(submissionUrl, "remark", state.api.remark);
        submissionUrl = util.addParameter(submissionUrl, "companyID", state.companyID);
        submissionUrl = util.addParameter(submissionUrl, "ps_guid", util.uuid());

        console.log(submissionUrl);

        // Submit data
        $.ajax({
            url: submissionUrl,
            success: function (data) {
                console.log(data);

                setTimeout(function(){
                  // Delete localStore
                  localStorage.removeItem(comment_data);

                  // Redirect to state 2 links ago
                  // Redirect to state 2 links ago
                  window.location = "comment_menu.html?onBack=" + BACK_MAIN + "&companyID=" + state.companyID;
                  console.log("Leaving...");
                }, 2500);

                // Animate OK
                var template = $.templates($("#okTemplate").html());
                $("#confirmation_wrapper").html(template.render({}));
            },
            error: function (err) {
                alert("Something went wrong when submitting your comment");
            }
        });

        // Add a loader
        var template = $.templates($("#loadingTemplate").html());
        $("#confirmation_wrapper").append(template.render({}));
    });
}
