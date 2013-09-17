/**
 * Comment
 */
var crisma = {
    round: function(data, scale) {
        var factor = Math.pow(10, scale);
        var newData = data * factor + 0.5;

        return Math.floor(newData) / factor;
    },
    reqBuildingVulClasses: function(point, http, callback) {
        var wfsreq = ['<?xml version="1.0"?>',
            '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:crisma="de:cismet:cids:custom:crisma" version="1.1.0" service="WFS" outputFormat="text/xml; subtype=gml/3.1.1" resultType="results" maxFeatures="1">',
            '<wfs:Query typeName="crisma:abcd_cell" srsName="EPSG:4326">',
            '<ogc:Filter>',
            '<Intersects xmlns="http://www.opengis.net/ogc">',
            '<PropertyName>crisma:the_geom</PropertyName>',
            '<Point xmlns="http://www.opengis.net/gml">',
            '<coordinates>',
            point.x + ',' + point.y,
            '</coordinates>',
            '</Point>',
            '</Intersects>',
            '</ogc:Filter>',
            '<wfs:PropertyName>crisma:the_geom</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:gid</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:cipc</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:codcell</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:a</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:b</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:c</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:d</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:tot_edabit</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:pa</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:pb</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:pc</wfs:PropertyName>',
            '<wfs:PropertyName>crisma:pd</wfs:PropertyName>',
            '</wfs:Query>',
            '</wfs:GetFeature>'].join('');

        http({
            url: 'http://crisma.cismet.de/geoserver/wfs',
            method: 'POST',
            data: wfsreq
        }).success(function(data) {
            callback({
                'intact': crisma.round(data.substring(data.indexOf('<crisma:a>') + 10, data.indexOf('</crisma:a>', data.indexOf('<crisma:a>') + 10)), 2),
                'light': crisma.round(data.substring(data.indexOf('<crisma:b>') + 10, data.indexOf('</crisma:b>', data.indexOf('<crisma:b>') + 10)), 2),
                'heavy': crisma.round(data.substring(data.indexOf('<crisma:c>') + 10, data.indexOf('</crisma:c>', data.indexOf('<crisma:c>') + 10)), 2),
                'collapsed': crisma.round(data.substring(data.indexOf('<crisma:d>') + 10, data.indexOf('</crisma:d>', data.indexOf('<crisma:d>') + 10)), 2)
            });
        });
    }
};