var positions = [];
var nextPositionNum = 0;
var threshold = 5;
var id;
var options = {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 2000,
};
var modelInfo = {
        url: './assets/models/scene.gltf',
        scale: '2 2 2',
        rotation: '0 180 0'
    };
var start = false;
var mapArea = $('#map-area');
var currentMarker;
var currentPosition = [36.34901209450942, 138.99239407459294]

var map = L.map('map', {
    center: [35.66572, 139.73100],
    zoom: 17,
    zoomControl: true,
});


var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer.addTo(map);



var selectedLine;
const activities = [
    {name: "walk", color: "blue" }, 
    {name: "run", color: "green" }, 
];
var activityLines = [];
var markers = [];
var lines = [];
var modes = {
    path : 0, 
    activity : 1
};
var currentMode = modes.path;
map.on('click', function(e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;

    if (currentMode == modes.path) {
        console.log("lat: " + lat + ", lng: " + lng);
        var p = [lat, lng];
        positions.push(p);
        var m = L.marker([lat, lng]).addTo(map);
        markers.push(m);



        if (markers.length >= 2) {
            var len = markers.length;
            var line = L.polyline([
                markers[len-1].getLatLng(), 
                markers[len-2].getLatLng(), 
            ],{
                "color": "#666666",
                "weight": 5,
                "opacity": 1, 
            }).addTo(map);
            line.id = len-2;
            line.activity = activities[0].name;
            
            line.on('click', function(event) {
                if (currentMode != modes.activity) {
                    return;
                }
                selectedLine = event.target;
                selectLine(selectedLine);
            });
    
            lines.push(line);
            console.log("draw line");
    } 

    
    }
    
function selectLine() {
    activitySelector.val(selectedLine.activity);
    $('.selected-line').text('selected-line: ' + selectedLine.id);
    console.log("select line");
}
    
    
});

function getDistance(pos1, pos2) {
    var [lat1, lng1] = pos1;
    var [lat2, lng2] = pos2;
    lat1 *= Math.PI / 180;
    lng1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    lng2 *= Math.PI / 180;
    return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}


function success(pos) {
    console.log("get");
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    var currentPos = [lat, lng];

    L.marker([lat, lng], {icon: L.spriteIcon('green')}).addTo(map);
   

    if (!start) {
        return;
    }
    
    if (positions.length > 0) {
        var target = positions[nextPositionNum];
        var distToNextPosition = getDistance(currentPos, target)
        if (distToNextPosition < threshold) {
            console.log("reach");
            L.marker([target[0], target[1]], {icon: L.spriteIcon('red')}).addTo(map);
            if (nextPositionNum < positions.length-1) {
                nextPositionNum ++;
            } else {
                navigator.geolocation.clearWatch(id);
                // 3Dモデルを作成する
                createModel(target[0], target[1]);
                alert("MESSAGE");
            }
        }
    }
}

function setCurrentPosition(pos) {
    console.log("get");
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    currentPosition = [lat, lng]
    
}

function createModel(lat, lng) {
    var scene = $('a-scene');
    var model = $('<a-entity></a-entity');
    model.attr('scale', modelInfo.scale);
    model.attr('rotation', modelInfo.rotation);
    model.attr('gltf-model', modelInfo.url);
    model.attr('look-at', "[gps-camera]");
    model.attr('gps-entity-place', `latitude: ${lat}; longitude: ${lng}; `);
    model.attr('gps-entity-place-added', "");
    scene.append(model);
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}


if (navigator.geolocation) {
    // id = navigator.geolocation.watchPosition(success, error, options);
} else {
    // 対応していない場合
    var errorMessage = "error";
    alert( errorMessage );
}

var activitySelector = $('.activity-selector');
setCurrentModeText(currentMode);

$('.set-activity-button').on('click', function() {
    if (selectedLine == null) {
        return;
    }
    selectedLine.activity = activities[activitySelector.prop("selectedIndex")].name;
    selectedLine.setStyle({
        color: activities[activitySelector.prop("selectedIndex")].color
    });
    lines[selectedLine.id] = selectedLine;

    var pathList = $('.path-list');
    pathList.empty();
    
    for (i=0; i<markers.length-1; i++) {
        var row = `<tr><td>` + i + `</td><td>` + lines[i].activity + `</td><td>` + (i+1) + `</td></tr>`;
        $('.path-list').append(row);
    }
    
})

$('.locate-button').on('click', function() {
    navigator.geolocation.getCurrentPosition(setCurrentPosition, error, options);
    map.setView([currentPosition[0], currentPosition[1]], 17);
    L.marker([currentPosition[0], currentPosition[1]], {icon: L.spriteIcon('green')}).addTo(map);
})
$('.start-button').on('click', function() {
    if ($('.threshold-form').val() != '') {
        threshold = $('.threshold-form').val();
    }
    
    start = true;
})
$('.map-button').on('click', function() {
    mapArea.show();
})
$('.camera-button').on('click', function() {
    mapArea.hide();
})
$('.reach-button').on('click', function() {
    console.log("push");
    // center: createModel(36.34933127648259, 138.99257243887092);
    // outside: createModel(36.34901209450942, 138.99239407459294);
    createModel(36.34901209450942, 138.99239407459294);
})
$('.marker-button').on('click', function() {
    currentMode = modes.path;
    activitySelector.attr('disabled','disabled');
    setCurrentModeText(currentMode);
    
})
$('.line-button').on('click', function() {
    currentMode = modes.activity;
    activitySelector.removeAttr('disabled');
    setCurrentModeText(currentMode);
})


var currentPathData;
$('.submit-button').on('click', function () {
    var nickname = $('.nickname-form').val();
    var message = $('.message-form').val();

    // activity
    var a = [];
    for (i=0; i<lines.length; i++) {
        a.push(lines[i].activity)
    }
    a = JSON.stringify(a);

    // position
    var p = [];
    for (i=0; i<positions.length; i++) {
        p.push(JSON.stringify(positions[i]));
    }
    p = JSON.stringify(p);

    
    currentPathData = {
        "nickname": nickname, 
        "pathInfo": {'positions': positions, 'activities': a}, 
        "message": message
    }
    console.log(currentPathData);


    var sendData = {
        "nickname": nickname, 
        "positions": p, 
        "activities": a, 
        "message": message
    }
    
    sendPathData(sendData);
});



function sendPathData(data){

    $.ajax({
        async: true,
        url: 'https://usa2021.jn.sfc.keio.ac.jp:1081',
        type: 'post',
        cache: false,
        data: data,
        dataType: 'json', 
        traditional: true,

    }).done(function(res, status, jqXHR) {
        console.log("send");
        // $('#everyone_status').text("");
        // Object.keys(res).forEach(function (key) {
        //     $('#everyone_status').append(key + "は" + res[key] + "な状態<br/>");
        // });

    }).fail(function(xhr, status, error){
	    console.log(status);
	    $('#everyone_status').text( status );
    });

}

var respond;
function sendFetchRequest(num){
    $.ajax({
        async: true,
        url: 'https://usa2021.jn.sfc.keio.ac.jp:1081',
        type: 'get',
        data: {num: num},

    }).done(function(res, status, jqXHR) {
        console.log("send");
        // $('#everyone_status').text("");
        // Object.keys(res).forEach(function (key) {
        //     $('#everyone_status').append(key + "は" + res[key] + "な状態<br/>");
        // });
        console.log(res);
        respond = res;

    }).fail(function(xhr, status, error){
	    console.log(status);
	    // $('#everyone_status').text( status );
    });

}

function setCurrentModeText(mode) {
    var keys = Object.keys(modes);
    $('.current-mode').text('mode: ' + keys[mode] + ' setting');
}

$('.fetch-path-button').on('click', function () {
    var num = $('.fetch-form').val();
    sendFetchRequest(num);
})