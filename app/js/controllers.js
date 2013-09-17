'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
        controller('MyCtrl1', ['$scope', '$http', function(sc, h) {

        sc.wfsdata = {
            'intact': '<do click>',
            'light': '<do click>',
            'heavy': '<do click>',
            'collapsed': '<do click>'
        };

        var ortho = L.tileLayer.wms('http://geoportale2.regione.abruzzo.it/ecwp/ecw_wms.dll', {
            layers: 'IMAGES_ORTO_AQUILA_2010.ECW',
            transparent: true,
            format: 'image/png'
        });

        var shakem = L.tileLayer.wms('http://crisma.cismet.de/geoserver/ows', {
            layers: 'shakem_1',
            transparent: true,
            format: 'image/png',
            opacity: 0.8
        });

        var buildVuln = L.tileLayer.wms('http://crisma.cismet.de/geoserver/ows', {
            layers: 'abcd_cell',
            transparent: true,
            format: 'image/png',
            opacity: 0.8
        });

        var map = L.map('map', {
            center: new L.LatLng(42.35651, 13.37036),
            zoom: 14,
            layers: [ortho, buildVuln],
            crs: L.CRS.EPSG3857,
//            drawControl: true
        });
        
//        var drawitems = new L.FeatureGroup();
//        map.addLayer(drawitems);
//        
//        var drawcontrol = new L.Control.Draw({
//            edit: {
//                featureGroup : drawitems
//            }
//        });
//        map.addControl(drawcontrol);
        
        var poly = L.polygon([{lat:42.449,lng:13.302},{lat:42.399,lng:13.213},{lat:42.348,lng:13.337}]);

        
        var eCircle = new L.CircleEditor({lat:42.449,lng:13.302}, 500);
        
        
        var lControl = {
//            "OSM": osm,
            "Ortho": ortho,
            "Shakemap": shakem,
            "Building Vul Classes": buildVuln,
            "poly":poly,
            "edit":eCircle
        };

        sc.onclickf = function(e) {
            L.popup().setLatLng(e.latlng).setContent("Clicked at: " + e.latlng.toString()).openOn(map);

            crisma.reqBuildingVulClasses({x: e.latlng.lng, y: e.latlng.lat}, h, function(result) {
                sc.wfsdata = result;
                var phase = sc.$root.$$phase;
                if(!(phase == '$apply' || phase == '$digest')){
                    sc.$apply();
                }
            });
        };

        map.on('click', sc.onclickf);

        L.control.layers(null, lControl).addTo(map);
        
        
        var OpacitySlider = L.Control.extend({
            initialize: function(layer, options){
                L.Util.setOptions(this, options);
                this.layer = layer;
                
                this.layer.setOpacity(this.options.opacity);
            },
            
            options: {
                position: 'bottomright',
                opacity: 100
            },
            
            onAdd: function(map){
                this.sliderDiv = L.DomUtil.create('div', 'custom-opacity-slider');
                var slider = L.DomUtil.create('input', 'slider', this.sliderDiv);
                slider.setAttribute('id', 'opSlider');
                slider.setAttribute('type', 'range');
                slider.setAttribute('min', '0');
                slider.setAttribute('max', '100');
                slider.setAttribute('step', '1');
                slider.setAttribute('value', this.options.opacity);
                
                var self = this;
                L.DomEvent
                        .on(this.sliderDiv, 'click', L.DomEvent.stopPropagation)
                        .on(this.sliderDiv, 'mousedown', L.DomEvent.stopPropagation)
                        .on(this.sliderDiv, 'dblclick', L.DomEvent.stopPropagation)
                        .on(this.sliderDiv, 'change', function(e){
                    L.DomEvent.stopPropagation(e);
                    self.layer.setOpacity(slider.value === 0 ? 0 : slider.value / 100);
                });
                
                return this.sliderDiv;
            },
                    
            onRemove: function(map){
                L.DomEvent.removeListener(this.sliderDiv, 'mousemove');
            }
        });
        
        map.addControl(new OpacitySlider(buildVuln));
        
        L.control.scale({imperial:false}).addTo(map);
        
        
    }])
        .controller('MyCtrl2', ['$scope', '$http', function(sc, h) {

        var map = new OpenLayers.Map('map', {
            projection: 'EPSG:4326',
        controls: [
            new OpenLayers.Control.PanZoom(),
            new OpenLayers.Control.Navigation()
        ]
        });
        var ortho = new OpenLayers.Layer.WMS("ortho", "http://geoportale2.regione.abruzzo.it/ecwp/ecw_wms.dll", {
            layers: 'IMAGES_ORTO_AQUILA_2010.ECW',
            transparent: true,
            format: 'image/png',
            isBaseLayer:false
        });

        var buildVuln = new OpenLayers.Layer.WMS('buildVul', 'http://crisma.cismet.de/geoserver/ows', {
            layers: 'abcd_cell',
            transparent: true,
            format: 'image/png',
            wrapDateLine: false,
            displayOutsideMaxExtent: true,
            isBaseLayer: false
        });
        var wms = new OpenLayers.Layer.WMS("OpenLayers WMS",
                "http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic', visibility: false, opacity: 0.0});
        var fake = new OpenLayers.Layer("fake", {isBaseLayer: true, displayInLayerSwitcher:false});
//        map.setBaseLayer(buildVuln);

//        var wfs = new OpenLayers.Layer.Vector("Editable Features", {
//        strategies: [new OpenLayers.Strategy.BBOX()],
//        projection: new OpenLayers.Projection("EPSG:4326"),
//        protocol: new OpenLayers.Protocol.WFS({
//            version: "1.1.0",
//            srsName: "EPSG:4326",
//            url: "http://crisma.cismet.de/geoserver/wfs",
//            featureNS :  "de:cismet:cids:custom:crisma",
//            featureType: "abcd_cell",
//            geometryName: "the_geom",
//            schema: "http://demo.opengeo.org/geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=crisma:abcd_cell"
//        })
//    });
    var wfs = new OpenLayers.Layer.Vector("Editable Features");
    var panel = new OpenLayers.Control.Panel({
        displayClass: 'customEditingToolbar',
        allowDepress: true
    });
     var edit = new OpenLayers.Control.ModifyFeature(wfs, {
        title: "Modify Feature",
        displayClass: "olControlModifyFeature"
    });

    var draw = new OpenLayers.Control.DrawFeature(wfs, OpenLayers.Handler.Polygon, {title:"Draw", displayClass:"olControlDrawFeaturePolygon", multi:true});
panel.addControls([draw, edit]);
        map.addLayers([fake, ortho, buildVuln, wfs]);
//        map.addLayers([ortho, buildVuln]);
        map.setCenter(new OpenLayers.LonLat(13.37036, 42.35651), 10);
//map.zoomToMaxExtent();
        map.addControl(new OpenLayers.Control.LayerSwitcher({ascending: false}));
        map.addControl(panel);

        map.events.register("click", map, function(e) {
            var lonlat = map.getLonLatFromPixel(e.xy);

            var popup = new OpenLayers.Popup(
                    'testp', 
                    new OpenLayers.LonLat(lonlat.lon, lonlat.lat), 
                    null, 
                    'Lon: ' + lonlat.lon + ', Lat: ' + lonlat.lat, 
                    true);
            popup.autoSize = true;
//
            map.addPopup(popup);
//
            crisma.reqBuildingVulClasses({x: lonlat.lon, y: lonlat.lat}, h, function(result) {
                sc.wfsdata = result;
                var phase = sc.$root.$$phase;
                if(!(phase == '$apply' || phase == '$digest')){
                    sc.$apply();
                }
            });
//            var l1 = map.layers[1];
//            l1.setOpacity(0.5);
//            map.raiseLayer(l1, 99);
//            map.layers[1].setOpacity(1);
        });
    }]);