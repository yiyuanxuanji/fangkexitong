var handleDownEvent = function (evt) {
  var map = evt.map;

  var curTime = new Date().getTime();

  if(curTime - this.prevTime_ < this.DBLCLICK_) {
    // Handle double click
    createOrMove(evt);
    this.prevTime_ = curTime;
    this.isDbl_ = true;
    return true;
  } else {
      // Handle mouse down event
      this.prevTime_ = curTime;
      this.isDbl_ = false;
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        });

      this.start_ = evt.coordinate;
      this.startCenter_ = view.getCenter();

      if (feature) {
        this.feature_ = feature;
      }

      return true;
  }
};

var handleDragEvent = function(evt) {
  // Move the view and cancel down event
  var deltaX = this.start_[0] - evt.coordinate[0];
  var deltaY = this.start_[1] - evt.coordinate[1];

  var newCenter = [this.startCenter_[0] + deltaX, this.startCenter_[1] + deltaY];

  view.setCenter(newCenter);
  this.startCenter_ = view.getCenter();

  this.feature_ = null;
  this.coordinate_ = evt.coordinate;
};

var handleUpEvent = function() {
  if(!this.isDbl_ && this.feature_) {
    zoomToFeature(this.feature_);
  } else if(!view.getAnimating()) {
      view.animate({
          center: view.constrainCenter(view.getCenter()),
          duration: 1000
      });
  }
   

  this.isDbl = false;
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
};

var customPointer = function () {

  ol.interaction.Pointer.call(this, {
    handleDownEvent: handleDownEvent,
    handleDragEvent: handleDragEvent,
    handleUpEvent: handleUpEvent
  });

  this.DBLCLICK_ = 400;
  this.prevTime_ = new Date().getTime();
  this.isDbl_ = false;
  /**
  * @type {ol.Pixel}
  * @private
  */
  this.coordinate_ = null;
  this.start_ = null;
  this.startCenter_ = null;

  /**
  * @type {string|undefined}
  * @private
  */
  this.cursor_ = 'pointer';

  /**
  * @type {ol.Feature}
  * @private
  */
  this.feature_ = null;

  /**
  * @type {string|undefined}
  * @private
  */
  this.previousCursor_ = undefined;
};

ol.inherits(customPointer, ol.interaction.Pointer);
