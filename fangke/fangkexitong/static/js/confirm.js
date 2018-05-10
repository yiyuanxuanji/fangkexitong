var oJson = util.getArgs();
var phoneNumber = oJson.phoneNumber;
var companyID = oJson.companyID;

var apiData;

$(document).ready(function (){
  renderConfirmation();
});

function renderConfirmation() {
  if (submit_data in localStorage) {
    // Get data from localStorage
    apiData = JSON.parse(localStorage.getItem(submit_data));
    console.log(apiData);

    // Render Template
    var confirmationTemplate = $.templates($("#confirmationTemplate").html());
    var confirmationData = confirmationTemplate.render(apiData);
    $("#confirmation_wrapper").html(confirmationData);

    // Display pictures
    for(p in apiData.pictures) {
      var picture = apiData.pictures[p];
      var picID = "#pic_" + picture.pictureFileName;
      var picUrl = 'url("http://' + picture.thumbnail_url + '");';
      console.log(picUrl + "\n" + picID);
      $(picID).attr('style', 'background-image: ' + picUrl);
    }

    // Set up submit button
    clickListeners();
  }
}

function clickListeners() {
    $("#confirm_button").click(function(evt) {
      // Submit data
      var data = JSON.stringify(apiData); //

        // http://116.228.196.234:7390/shtower/Scan3D.asmx/SetRepairInfo?companyID=7413&RoomId=4029183&ServStyle=F&Urgency=紧迫&Importance=重要&ServType=室内无偿服务&BookServDate=2017-05-24 15:00:00&ContactName=XXX&ContactTelephone=12345678901&remark=&problem_coordinates={'x': 123.456,'y': 123.456}&RepairType=[{ 'problemID': 'problem_id', 'problemName': 'problem_name' },{ 'problemID':'problem_id111', 'problemName': 'problem_name222'}]&pictures=
        var u_submit = SUBMIT_MAINTENANCE_API;
        u_submit = util.addFirstParameter(u_submit, "companyID", apiData.companyID);
        u_submit = util.addParameter(u_submit, "RoomId", apiData.roomBimID);
        u_submit = util.addParameter(u_submit, "Floor", apiData.Floor);
        u_submit = util.addParameter(u_submit, "ServStyle", apiData.ServStyle);
        u_submit = util.addParameter(u_submit, "Urgency", apiData.Urgency);
        u_submit = util.addParameter(u_submit, "Importance", apiData.Importance);
        u_submit = util.addParameter(u_submit, "ServType", apiData.ServType);
        u_submit = util.addParameter(u_submit, "BookServDate", apiData.BookServDate);
        u_submit = util.addParameter(u_submit, "ContactName", apiData.ContactName);
        u_submit = util.addParameter(u_submit, "ContactTelephone", apiData.ContactTelephone);
        u_submit = util.addParameter(u_submit, "remark", apiData.remark);
        u_submit = util.addParameter(u_submit, "problem_coordinates", JSON.stringify(apiData.problem_coordinates));
        u_submit = util.addParameter(u_submit, "RepairType", JSON.stringify(apiData.RepairType));
        u_submit = util.addParameter(u_submit, "pictures", JSON.stringify(apiData.pictures));
        u_submit = util.addParameter(u_submit, "Tag", 2);
        u_submit = util.addParameter(u_submit, "ps_guid", util.uuid());

        console.log(u_submit);

        $.ajax({
            url: u_submit,
            success: function (data) {
                console.log(data);


                setTimeout(function() {
                  // Delete localStore
                  localStorage.removeItem(submit_data);

                  // Redirect to state 2 links ago
                  window.location = "maintenance_menu.html?onBack=" +  BACK_MAIN + "&companyID=" + apiData.companyID;
                  console.log("Leaving...");
                }, 2500);

                // Animate OK
                var template = $.templates($("#okTemplate").html());
                $("#main_wrapper").html(template.render({}));
           },
            error: function (err) {
                alert("Something went wrong when submitting your maintenance request");
                $(".fade_all").remove();
            }
         });

         // Add a loader
         var template = $.templates($("#loadingTemplate").html());
         $("#main_wrapper").append(template.render({}));
    });
}
