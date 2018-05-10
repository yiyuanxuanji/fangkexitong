function Upload(file, cToken, pID, successCallback) {
    this.file = file;
    this.pID = pID;
    this.csrfToken = cToken;
    this.successF = successCallback;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // Add assoc key values, this will be posts values
    formData.append("csrfmiddlewaretoken", this.csrfToken);
    formData.append("docfile", this.file, this.getName());
    formData.append("upload_file", true);

    $.ajax({
        type: "POST",
        url: PICTURE_API,
        xhrFields: {
          withCredentials: true
        },
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            that.myXhr = myXhr;
            myXhr.upload.pID = that.pID;
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            that.successF(data);
        },
        error: function (error) {
            // handle error
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
};

Upload.prototype.abort = function () {
  this.myXhr.abort();
  this.myXhr = undefined;
}

Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#bar_" + this.pID;
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }

    console.log(progress_bar_id + ", " + percent + "%");

    // update progressbars classes so it fits your code
    $(progress_bar_id).css("width", +percent + "%");
    $(progress_bar_id).text(percent + "%");
};


/*
  This is the entrypoint for all functionality
*/

function setupCamera() {
  var camera_add = $("#camera_add");
  var inputElement = $("#hidden_picture");
  var inputType = $("input[type=file]");

  // Set up picture listener
  camera_add.click(function(evt) {
    var bottomEvent = new $.Event("click");
    inputElement.trigger(bottomEvent);
  });

  inputType.change(function(){
      var file = inputType[0].files[0];
      pictureFile = file;
      var pID = state.curPictureID;
      state.curPictureID += 1;

      uploadPicture(file, pID);
    });
}


function uploadPicture(file, pID) {
  var picturePreviewTemplate = $.templates($("#picturePreviewTemplate").html());
  var renderedPicturePreview = picturePreviewTemplate.render({"pictureID": pID});
  $("#picture_wrapper").prepend(renderedPicturePreview);

  var upload = new Upload(file, "", pID, function(data) {
    responseData = JSON.parse(data);
      console.log(responseData);
      var img = new Image();

      img.onload = function(){
        // code here to use the dimensions
        var imgObj = {"pictureFileName": responseData.pk,
                                 "pictureURL": responseData.url,
                                 "width": responseData.width,
                                 "height": responseData.height
                               };

        state.pictures.push(imgObj);
      }
      var imgUrl = "http://" + responseData.url;

      img.src = imgUrl;

      // Set uploaded picture as background
      var picUrl = 'url("' + imgUrl + '");';
      $("#pic_" + pID).attr('style', 'background-image: ' + picUrl);
      $("#bar_" + pID).hide();
  });
  upload.doUpload();
}
