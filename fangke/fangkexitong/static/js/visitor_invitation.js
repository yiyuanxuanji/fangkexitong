const VIEW_EXTENT = 47;
const MIN_ZOOM = 19;
const MAX_ZOOM = 23;
const MIN_LABEL_ZOOM = 20.5;
const MAX_ALL_FEATURE_TEXT = 50;
const MAX_COMMENT_LENGTH = 255;

// Maintenance states
const SELECT_ROOM = 0;
const SELECT_MARKER = 1
const SELECT_OK = 2;

// Z INDEXES
const SELECTED_Z_INDEX = 300;
const MARKER_Z_INDEX = (SELECTED_Z_INDEX + 1)*2;

var floorRegex = new RegExp(/^(\d{1,3})F$/);
var baseRegex = new RegExp(/^B(\d{1,3})$/);

var oJson = util.getArgs();
var companyID = oJson.companyID;
var onBack= oJson.onBack;

handleHistoryState(onBack, companyID);
var JR = window.jsrender;

// Selections are indicated by indexes
var selectedCategory;
var selectedProblems = [];
var problems = [];
var roomCache = {};
var floors;
var selectedFloor = 0;
var floorLayers = [];
var previousSelected;

var map;
var view;
var select;
var markerFeature;
var markerLayer;
var featureLayer;
var pictureFile;

var curPictureID = 0;
var state = {"roomID": "",
    "uploading": 0,
    "projectid": 1009,
    "ContactName": "XXX",
    "companyID": parseInt(companyID),                 // Determined from other API
    "CustName": "", // Need to get from API
    "ServStyle": "",
    "RepairType": [],  // List
    "BookServDate": "",
    "ContactTelephone": "",
    "remark": "",
    "pictures": [], // List
    "Urgency": "紧迫",
    "Importance": "重要",
    "problem_coordinates": {},
    "ServType": "室内无偿服务", // Category
};

var csrfToken;
const csrfRegex = /name='csrfmiddlewaretoken' value='([^']*)' \/>/g;
$(document).ready(function (){

    // Request the picture form
    // $.ajax({
    //     url: PICTURE_API,
    //     type: "GET",
    //     xhrFields: {
    //         withCredentials: true
    //     },
    //     success: function(output, status, xhr) {
    //         formData = output;
    //         var match = csrfRegex.exec(formData);
    //         csrfToken = match[1];
    //     },
    //     error: function(error) {
    //         console.log(error.statusText);
    //     }
    // })

    // Render UI
    initializeMap();
    renderCategories();
    renderInfoPanel();

    // Set up submit listener
    $("#submit_button").click(function(){

      var format = "";

      var x = $('#invite_time').val();

      year= x.substring(0,4);

      month= x.substring(5,7);

      day= x.substring(8,10);

      hour= x.substring(11,13);

      minute= x.substring(14,16);

      format=month+"/"+day+"/"+year+" "+hour+":"+minute;
      $.ajax({
        type: "post",
        url: "http://106.14.178.162:8830/api/users/invite",
        data: {
          'full_name':$('#contact_name_input').val(),
          'phone':$('#contact_phone_input').val(),
          'visitor_count':$('#num_input').val(),
          'visit_time':format,
          'position':$('.selected_company_name').html()+$('.sleected_feature_name').html(),
          'reason': $('#comment_box').val(),
          'check_in':$('#f_0').html().replace(/\s+/g, ""),
          'sessionid':localStorage.getItem('sessionid'),
        },
        dataType: 'json',
        // xhrFields: {
        //     withCredentials: true
        // },
        // crossDomain: true,
        success: function(data) {
          console.log(data);
          CompanyId = data.data.CompanyId;
          if(data.success==0){
            alert(data.data);
          }else if (data.success==1) {
            alert("邀请成功");
            window.location.href="visitor_list.html";
            // window.location.href="invitation_info.html?auth_code="+data.data.auth_code+"&invite_id="+data.data.invite_id;
          }
        },
        error: function(error){
          alert(error.error);
        }
      });
    });

    // Set up picture listener
    $("#camera_add").click(function(evt) {
        var bottomEvent = new $.Event("click");
        $("#hidden_picture").trigger(bottomEvent);
    });

    $("input[type=file]").change(function(){

        var file = $("input[type=file]")[0].files[0];
        pictureFile = file;
        var pID = curPictureID;
        curPictureID += 1;

        previewPicture(pID);
        mUploadPicture(file, pID);
    });

    $("#ok_button").click(function(){
        util.scrollTo("finishing_up");
    })

});

function previewPicture(pID) {
    var picturePreviewTemplate = $.templates($("#picturePreviewTemplate").html());
    var renderedPicturePreview = picturePreviewTemplate.render({"pictureID": pID});
    $("#picture_wrapper").prepend(renderedPicturePreview);
}

/*
 * Form validation before can move to confirmation
 */
function canSubmit() {
    if(!state.roomID) {
        alert("请在平面中选择房间"); // Please select a room.
        util.scrollTo("map_wrapper");
        util.flashAttention("map_wrapper", 1000);
        return false;
    } else if (!state.ServStyle) {
        alert("请选择类型"); // Please select a category.
        util.scrollTo("finishing_up");
        util.flashAttention("problem_categories", 1000);
        return false;
    } else if (state.RepairType.length <= 0 && state.ServStyle != "H") {
        alert("请选择故障现象"); // Please select a problem.
        util.scrollTo("problem_types");
        util.flashAttention("problem_types", 500);
        return false;
    } else if(state.uploading != 0) {
        alert("你还在上传，请稍等。");
        return false;
    } else if (!state.ContactName) {
        alert("请输入报修人姓名。");
        util.flashAttention("contact_name_input", 0);
        return false;
    } else if (!state.ContactTelephone) {
        alert("请输入报修人电话。");
        util.flashAttention("contact_phone_input", 0);
        return false;
    } else if(state.ServStyle == "H" && !state.remark.trim() ) { // TODO: Do this a better way. I have become the thing I hate the most :'(
        alert("请输入其他说明。");
        util.scrollTo("comment_box");
        util.flashAttention("comment_box", 0);
        return false;
    } else if(state.RepairType.length == 1 && state.RepairType[0].problemID == 1 && !state.remark.trim()) {
	// If the only problem they select is "other", then they new to leave a comment
	alert("请在其他说明中输入内容。");
	util.flashAttention("comment_box", 0);
	return false;
    } else if(state.remark.length > MAX_COMMENT_LENGTH) {
        alert("其他说明，不要超过" + MAX_COMMENT_LENGTH + "字符。");
        util.flashAttention("comment_box", 0);
        return false;
    }

    // All good; submit
    return true;
}

function setupData() {
    var categories = [];
    var specificProblems = [];
    for(var a = 0; a < problems.length; a++) {
        var curProblem = problems[a];
        curProblem.index = a;
        categories.push(curProblem);
    }

    return {category: categories};
}

function setMapState(state) {
    switch (state) {
        case SELECT_ROOM:
            $("#ok_button").hide('slow');
            $("#map_directions").html("请点击区域");
            break;
        case SELECT_MARKER:
            $("#ok_button").hide('slow');
            $("#map_directions").html("请双击确定详细位置")
                break;
        case SELECT_OK:
            $("#ok_button").show('slow');
            $("#map_directions").html("点击OK向下滑动");
            break;
        default:
            console.error("Unexpected state: " + state );
    }
}

function styleSelected(f) {
  var room_id = f.roomID;
  $('.sleected_feature_name').html(room_id);

  var selectedStyle = new ol.style.Style({
      // fill: new ol.style.Fill({color: "red"}),
      stroke: new ol.style.Stroke({color: '#324D6B', width: 1}),
      text: new ol.style.Text({
          text: f.roomID,
          font: "bold 18px Arial, sans-serif",
          fill: new ol.style.Fill({color: "#3C5D8F"}),
          stroke: new ol.style.Stroke({color: "#fff", width: 4})
      }),
      zIndex: -1
  });

  return [selectedStyle];
}

function zoomToFeature(f) {
    var extent = f.getGeometry().getExtent();

    // Handle marker selected in different room (remove marker and state transition)
    if(previousSelected != f && markerLayer.getSource().getFeatures().indexOf(markerFeature) >= 0) {
        markerLayer.getSource().removeFeature(markerFeature);
        setMapState(SELECT_MARKER);
    }

    // Remove selected styling from previously selected room
    if(previousSelected) {
       previousSelected.setStyle();
    }

    selectedCategory = "";
    renderProblems({problems: []});
    previousSelected = f;

    // var selectedStyle = new ol.style.Style({
    //     fill: new ol.style.Fill({color: '#A8C7EA'}),
    //     stroke: new ol.style.Stroke({color: '#324D6B'}),
    //     text: new ol.style.Text({
    //         text: f.roomID,
    //         font: "bold 18px Arial, sans-serif",
    //         fill: new ol.style.Fill({color: "#3C5D8F"}),
    //         stroke: new ol.style.Stroke({color: "#fff", width: 4})
    //     })
    // });
    //
    // f.setStyle(selectedStyle);
    map.getView().fit(extent, {
        duration: 1000
    });

    setMapState(SELECT_MARKER);

    getRoomProblemList();
}

function mUploadPicture(file, pID) {
    // Initialize upload
    var upload = new Upload(file, csrfToken, pID, function(data) {
        responseData = JSON.parse(data);
        console.log(responseData);


        var img = new Image();

        var imgUrl = "http://" + responseData.thumbnail_url;
        img.onload = function(){
            // code here to use the dimensions
            state["pictures"].push({"pictureFileName": responseData.pk,
                "pictureURL": responseData.url,
                "thumbnail_url": responseData.thumbnail_url,
                "width": responseData.width,
                "height": responseData.height
            });
        }

        img.src = imgUrl;

        // var picUrl = 'url("http://' + picture.pictureURL + '");';
        var picUrl = 'url("' + imgUrl + '");';

        console.log(picUrl);

        // Set uploaded picture as background
        $("#pic_" + pID).attr('style', 'background-image: ' + picUrl);
        $("#bar_" + pID).parent().hide();
        $("#pic_" + pID).off('click');
        state.uploading--;
    });

    $("#pic_" + pID).click(function() {
      console.log("attempting to abort");
      upload.abort();
      $(this).remove();
      state.uploading--;
    })

    state.uploading++;
    upload.doUpload();
}

function initializeMap() {
    markerLayer = olUtil.blankLayer();
    markerLayer.setZIndex(MARKER_Z_INDEX);

    view = new ol.View({
        center: [0, 0],
        extent: [-VIEW_EXTENT, -VIEW_EXTENT, VIEW_EXTENT, VIEW_EXTENT],
        zoom: MIN_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
    });

    map = new ol.Map({
        target: 'map_wrapper',
        logo: false,
        interactions: ol.interaction.defaults({
          doubleClickZoom: false
        }),
        layers: [
            markerLayer
        ],
        view: view
    });

    // Initialize select
    select = new ol.interaction.Select({
      style: styleSelected,
      condition: function(e) {
        return ol.events.condition.singleClick(e) | ol.events.condition.doubleClick(e);
      }
    });

    var zoom = new ol.interaction.DoubleClickZoom();
    map.addInteraction(select);

    select.on('select', function(e) {
      if(e.selected.length != 0) {
        // Zoom to room
        zoomToFeature(e.selected[0]);
      }

      // Deselect previously selected
      if(e.deselected.length != 0 ){
        for(var a = 0; a < e.deselected.length; a++) {
          e.deselected[a].isSelected = false;
        }
      }

      // Elevate marker
      if(markerLayer.getSource().getFeatures().indexOf(markerFeature) >= 0) {
          select.select(markerFeature);
      }
    });


    map.on('dblclick', function(e) {
      console.log(e);
      view.animate({
        center: e.coordinate,
        duration: 1000
      });

      createOrMove(e);
    })

    getRooms(companyID);
}

function renderCategories() {
    // var problemData = setupData();

    // Render template
    var categoryTemplate = $.templates($("#categoryTemplate").html());
    // var categoryTemplate = categoryTemplate.render(problemData);
    $("#problem_categories").html(categoryTemplate);

    // Setup on click listeners
    $(".category").click(function () {
        var curIndex = parseInt($(this).attr("index"));
        $("#c_" + selectedCategory).toggleClass("selected_nugget");
        $(this).toggleClass("selected_nugget");
        selectedCategory = curIndex;

        // Update state on category change
        state.ServStyle = problems[curIndex].MstTypeCode;
        state.ServType = problems[curIndex].MstTypeName;
        state.RepairType = [];

        selectedProblems = [];
        var curProblems = [];
        for(var a = 0; a < problems[selectedCategory].DTL.length; a++) {
            var curProb = problems[selectedCategory].DTL[a];
            curProb.index = a;
            curProblems.push(curProb);
        }
        renderProblems({problems: curProblems});
    });
}

function renderProblems(problemData) {
    var problemTemplate = $.templates($("#problemTemplate").html());
    var problemHtml = problemTemplate.render(problemData);
    $("#problem_types").html(problemHtml);

    // Setup on click listeners
    $(".problem").click(function () {
        var curIndex = parseInt($(this).attr("index"));
        $(this).toggleClass("selected_nugget");
        addOrRemoveProblem(curIndex);

        // Update state
        state.RepairType = [];
        for(var a in selectedProblems) {
            var curIndex = selectedProblems[a];
            var curItem = {};
            curItem.problemID = problems[selectedCategory].DTL[curIndex].DtlTypeCode;
            curItem.problemName = problems[selectedCategory].DTL[curIndex].DtlTypeName;
            state.RepairType.push(curItem);
        }
    });
}

function renderInfoPanel() {
    var time = new Date();

    var minutes = time.getMinutes();
    var hours = time.getHours();
    var hours = (hours < 10?'0':'') + hours;
    var minutes = (minutes<10?'0':'') + minutes;
    var timeString = time.toISOString().slice(0, 10); //+ " " + hours + ":" + minutes;

    state.BookServDate = timeString

        var infoData = {timeOfDay: timeString,
            companyName: state.CustName,
            contactName: state.ContactName,
            phoneNumber: state.ContactTelephone}

    var problemTemplate = $.templates($("#repairTemplate").html());
    var problemHtml = problemTemplate.render(infoData);
    $("#info_panel").html(problemHtml);


    var format = "";
    var nTime = new Date();
    format += nTime.getFullYear()+"-";
    format += (nTime.getMonth()+1)<10?"0"+(nTime.getMonth()+1):(nTime.getMonth()+1);
    format += "-";
    format += nTime.getDate()<10?"0"+(nTime.getDate()):(nTime.getDate());
    format += "T";
    format += nTime.getHours()<10?"0"+(nTime.getHours()):(nTime.getHours());
    format += ":";
    format += nTime.getMinutes()<10?"0"+(nTime.getMinutes()):(nTime.getMinutes());
    format += ":00";

    $('#invite_time').val(format);

    $("#comment_box").focusout(function (evt) {
        state.remark = evt.target.value;
    });

    $("#contact_name_input").focusout(function(evt) {
        state.ContactName = evt.target.value;
    });

    $("#contact_phone_input").focusout(function(evt) {
        state.ContactTelephone = evt.target.value;
    });
}

function addOrRemoveProblem(pIndex) {
    var i = selectedProblems.indexOf(pIndex)
        if(i < 0) {
            selectedProblems.push(pIndex);
        } else {
            selectedProblems.splice(i, 1);
        }
}

function removeMarker() {
  if(markerLayer.getSource().getFeatures().indexOf(markerFeature) >= 0) {
      markerLayer.getSource().removeFeature(markerFeature);
  }
}

function changeFloor(fIndex) {
    // Remove marker if it exists
    removeMarker();

    // Ensure Categories are reset
    $("#c_" + selectedCategory).toggleClass("selected_nugget");
    selectedCategory = undefined;
    selectedProblems = [];
    state.RepairType = [];
    renderCategories();
    renderProblems({problems: []});

    selectFloor(fIndex);
    view.animate({center: [0, 0],
        zoom: MIN_ZOOM,
        duration: 1000});
    selectedFloor = fIndex;

    console.log(fIndex);
}

function renderFloorButtons(fIndex) {
    var floorData = floors.LevelMaps;
    for(var a = 0; a < floorData.length; a++) {
        floorData[a].active = a == fIndex;
        floorData[a].wasJustActive = a == selectedFloor;
        floorData[a].index = a;
    }

    var floorTemplate = $.templates($("#floorChooserTemplate").html());
    var renderedFloor = floorTemplate.render({"floor": floorData});
    $("#floor_wrapper").html(renderedFloor);

    // Set on click listeners
    $(".floor_button").click(function (evt){
        var index = parseInt(evt.target.attributes.index.value);
        changeFloor(index);
        setMapState(SELECT_ROOM);
    });
}

function selectFloor(fIndex) {
    var curFloor = floors.LevelMaps[fIndex];

    console.log("Selecting floor " + fIndex);
    // Set active mapLayer
    for(var a = 0; a < floors.LevelMaps.length; a++) {
        map.getLayers().item(a+1).setVisible(a == fIndex);
    }

    // Clear selection
    clearSelection();

    // Reset company name
    state.floorIndex = fIndex;
    state.CustName = curFloor.COMPANY;
    state.Floor = curFloor.LEVEL;
    state.ContactName = curFloor.NAME;
    state.ContactTelephone = curFloor.PHONE;
    renderFloorButtons(fIndex);
    renderInfoPanel();
}

function renderShapes(floors) {
  if(floors.LevelMaps == undefined) {
      console.error("No floors to render");
      return;
  }

  // Create all the floors for the current company
  for(var a = 0; a < floors.LevelMaps.length; a++) {
    var curFloor = floors.LevelMaps[a];

    var curFloorLayer = olUtil.blankLayer();
    curFloorLayer.setStyle(roomStyling);
    floorLayers.push(curFloorLayer);
    map.getLayers().push(curFloorLayer);

    // Create all the rooms for the current floor
    for(var b = 0; b < curFloor.ROOM.length; b++) {
      var curRoom = curFloor.ROOM[b];
      var f = createRoomFeature(curRoom);
      floors.LevelMaps[a].ROOM[b].feature = f;
      curFloorLayer.getSource().addFeature(f);
    }
  }

  // Force redraw
  curFloorLayer.changed();
}

/*
 * Room shape styling function
 */
function roomStyling(feature) {
    // Show all features text if less than MAX_ALL_FEATURE_TEXT
    // Otherwise, show feature text if zoom level is greater than MIN_LABEL_ZOOM
    var fText = feature.roomID;
    if(floorLayers[selectedFloor].getSource().getFeatures().length > MAX_ALL_FEATURE_TEXT) {
        fText = map.getView().getZoom() >= MIN_LABEL_ZOOM ? feature.roomID : "" ;
    }

    var style = new ol.style.Style({
        fill: new ol.style.Fill({color: '#C6E0FF'}),
        stroke: new ol.style.Stroke({color: '#324D6B'}),
        text: new ol.style.Text({
            font: "bold 14px Arial, sans-serif",
            stroke: new ol.style.Stroke({width: 2, color: "#fff"}),
            text: fText
        }),
        zIndex: SELECTED_Z_INDEX - 1
    });

    return [style];
}

$('#maintenance_menu').click(function(){
  window.location.href="visitor_list.html";
})
function createRoomFeature(curRoom) {
    var f = new ol.Feature(new ol.geom.Polygon([curRoom.Vertices]));
    f.roomID = (curRoom.DISPLAY_NAME) ? curRoom.DISPLAY_NAME : curRoom.BIM_ID;
    f.roomBimID = curRoom.BIM_ID;

    return f;
}

function getRooms(companyID) {
  $.ajax({
    dataType: 'json',
    type: 'GET',
    url:  util.getRoomURL(companyID, state.ContactTelephone),
      success: function(data) {
        floors = data.data;

        // Sort floors
        for(var a = 0; a < floors.LevelMaps.length; a++) {
            var match = floorRegex.exec(floors.LevelMaps[a].LEVEL);
            var baseMatch = baseRegex.exec(floors.LevelMaps[a].LEVEL);
            if(match && match.length >= 2) {
                floors.LevelMaps[a].sort = parseInt(match[1]);
            } else if(baseMatch && baseMatch.length >= 2){
                floors.LevelMaps[a].sort = -1 * parseInt(baseMatch[1]);
            }
        }
        floors.LevelMaps.sort(util.dynamicSort("sort"));

        renderShapes(floors);
        selectFloor(0);
      },
      error: function() {
        if(!companyID || companyID == "undefined") {
            alert("You don't have a companyID, so we don't know which floors to show you :(");
        } else {
            alert("服务器忙，请返回重试。"); // Something went wrong when downloading rooms, please try again
        }
      }
    });
}

function getRoomProblemList(){
  // Get problems from cache or download them
  if(!(previousSelected.roomID in roomCache)) {
    // Download
    // $.ajax({
    //   url: PROBLEM_URL + previousSelected.roomID,
    //   success: function(data) {
        // roomCache[previousSelected.roomID] = data.data;

        // Retrieve from cache
        problems = roomCache[previousSelected.roomID];

        // Rerender Problem UI
        renderCategories();
    //   },
    //   error: function () {
    //     alert("服务器忙，请返回重试。"); // Something went wrong when downloading room list
    //   }
    // });
  } else {
    // Retrieve from cache
    problems = roomCache[previousSelected.roomID];

    // Rerender Problem UI
    renderCategories();
  }

  state.roomID = previousSelected.roomID;
  state.roomBimID = previousSelected.roomBimID;
}

function createOrMove(evt) {
  var newCoords = evt.coordinate;
  if(!markerFeature) {
    markerFeature = olUtil.addPoiFeatureHY("images/now.png", newCoords[0], newCoords[1], "");
  }

  if(markerLayer.getSource().getFeatures().indexOf(markerFeature) < 0) {
    markerLayer.getSource().addFeature(markerFeature);
  }

  markerFeature.getGeometry().setCoordinates(newCoords);
  markerFeature.changed();

  // Update UI
  setMapState(SELECT_OK);

  // Update State
  state.problem_coordinates = {"x": newCoords[0], "y": newCoords[1]};
}

function clearSelection() {
  select.getFeatures().forEach(f => {
    f.isSelected = false;
  })
  select.getFeatures().clear();
}
