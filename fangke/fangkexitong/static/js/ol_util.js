var center = ol.proj.transform([104.06667, 30.66667], 'EPSG:4326', 'EPSG:3857');//设置地图中心

var olUtil = {
  blankLayer: function() {
          var newLayer = new ol.layer.Vector({
              source: new ol.source.Vector({features: []}),
              updateWhileAnimating: true,
          });
          return newLayer;
  },
  addPoiFeatureHY: function(src,x,y,local){
	    var activity = new ol.Feature({
	        geometry: new ol.geom.Point(x,y)
	    });
	    if(local === 'local'){
	    	var anchor = [0.5,0.5]
	    }else{
	    	var anchor = [0.5, 1]
	    }
	    // 设置Feature的样式
	    activity.setStyle(new ol.style.Style({
	        image: new ol.style.Icon({
	            src: src,
	            anchor: anchor,
	            scale: .5
	        })
	    }));
	    return activity;
	},
}
