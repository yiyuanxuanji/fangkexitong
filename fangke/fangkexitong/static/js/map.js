const ANIMATION_DURATION = 750;
const pad = 50
const VIEW_PADDING = [pad, pad, pad, pad];
const LAYER_SWITCH_RES = 0.33;
const HALL_ZOOM = LAYER_SWITCH_RES + 0.27;
const BOOTH_ZOOM = LAYER_SWITCH_RES - 0.01;
const ROOM_NAME = 0.25;
const COMPANY_NAME = 0.13;

const MAX_LARGE_LABEL = 15
var curNumActiveFeatures = 0;

// THE m a p

var map = new ol.Map({
  layers: [],
  view: new ol.View({
    center: [0, 0],
    zoom: 20,
    minZoom: 20,
    maxZoom: 23,
    // extent: [-450.19285, -1170.35518, 1240.96498, 505.39661]
  }),
  logo: false
});


var select = new ol.interaction.Select({
  style: styleSelected
});
map.addInteraction(select);

const cPrimary = "#ffa5a5"
const cSecondary = "#FF5151"
const cSelectedPrimary = cSecondary
const cSelectedSecondary = cPrimary

function styleFeature(feature) {
  var r = map.getView().getResolution();
  var text = "";
  var font = "";
  var stroke = cSecondary;
  var fill = cPrimary;

  if(r > LAYER_SWITCH_RES) {
    // Hall names
    text = feature.positionCode;
    font = "bold 18pt Helvetica, sans-serif"
  } else if (r < LAYER_SWITCH_RES && r >= ROOM_NAME){
    text = feature.positionCode;
    font = "10pt Helvetica, sans-serif"
  } else if(r < ROOM_NAME && r >= COMPANY_NAME) {
    // Room id only
    text = feature.positionCode;
    const fs = (shouldUseSmallText()) ? "6" : "14";
    font = fs + "pt Helvetica, sans-serif"
  } else if (r < COMPANY_NAME) {
    // room + company name
    text = getFullLabel(feature);
    const fs = (shouldUseSmallText()) ? "8" : "14";
    font = fs + "pt Helvetica, sans-serif"
  }

  var style = new ol.style.Style ({
    fill: new ol.style.Fill({
      color: fill
    }),
    text: new ol.style.Text({
      font: font,
      text: text,
      fill: new ol.style.Fill({
        color: "white"
      }),
      stroke: new ol.style.Stroke({
        color: "black",
        width: 2
      })
    }),
    stroke: new ol.style.Stroke({
      color: stroke,
      width: 3
    })
  });

  return [style];
}

function styleSelected(feature) {
  var style = new ol.style.Style ({
    fill: new ol.style.Fill({
      color: cSelectedPrimary
    }),
    stroke: new ol.style.Stroke({
      color: cSelectedSecondary,
      width: 3
    }),
    text: new ol.style.Text({
      font: "14pt Helvetica, sans-serif",
      text: getFullLabel(feature),
      fill: new ol.style.Fill({
        color: "white"
      }),
      stroke: new ol.style.Stroke({
        color: "black",
        width: 2
      })
    })
  });

  return [style];
}

function shouldUseSmallText() {
  return (curNumActiveFeatures > MAX_LARGE_LABEL);
}


function getFullLabel(feature) {
  if (!feature.displayName) {
    reelect = new ol.interaction.Select();
    rn feature.positionCode
  } else {
    return feature.displayName + "\n" + feature.positionCode
  }
}

function createFeature(verts, label = "") {
  if(!verts) {
    return;
  }
  var p = new ol.geom.Polygon([verts]);

  var feature = new ol.Feature(p);

  return feature;
}

function zoomTo(extent) {
  map.getView().fit(extent, {
    duration: ANIMATION_DURATION,
    padding: VIEW_PADDING
  });
}

function blankLayer() {
  return new ol.layer.Vector({
    source: new ol.source.Vector({
      features: []
    }),
    style: styleFeature,
    updateWhileAnimating: true,
  });
}


function clearMap() {
  map.getLayers().clear();
}


function renderFloor(floor) {
  var layer = blankLayer();

  for(var room of floor.ROOM) {
    // Render feature
    var feature = createFeature(room.Vertices);
    if(!feature) {
      continue;
    }
    feature.setId(room.BIM_ID);
    feature.bimID = room.BIM_ID;
    feature.displayCode = room.DISPLAY_CODE;
    feature.displayName = room.DISPLAY_NAME;
    feature.positionCode = room.PositionCode;

    // Add it to layer
    layer.getSource().addFeature(feature);
  }

  // Set an identifier for this layer
  layer.level = floor.LEVEL;

  // Add layer to map
  map.addLayer(layer);
}

function setActiveLayer(activeIndex) {
  map.getLayers().forEach((layer, idx) => {
      layer.setVisible(idx == activeIndex);
      if(idx == activeIndex) {
        zoomTo(layer.getSource().getExtent());
        curNumActiveFeatures = layer.getSource().getFeatures().length;
      }
  });

  console.log(activeIndex);
  console.log(map.getLayers());

  // Deselect all selected elements
  clearSelection();
}

function clearSelection() {
  select.getFeatures().forEach(f => {
    f.isSelected = false;
  })
  select.getFeatures().clear();
}

function zoomToFeature(feature) {
  zoomTo(feature.getGeometry().getExtent());
  feature.isSelected = true;
}
