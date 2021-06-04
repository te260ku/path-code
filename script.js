var positions = [];
var nextPositionNum = 0;
const threshold = 1;
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
var cameraArea = $('#camera-area');
cameraArea.hide();

var map = L.map('map', {
    center: [35.66572, 139.73100],
    zoom: 17,
    zoomControl: true,
});

var sound = new Audio();
sound.preload = "auto";
sound.src = "./assets/audio/sound.mp3";
sound.load();

var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer.addTo(map);

map.on('click', function(e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;
    console.log("lat: " + lat + ", lng: " + lng);
    var p = [lat, lng];
    positions.push(p);
    L.marker([lat, lng]).addTo(map); 
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
    map.setView([lat, lng], 17);
    // L.marker([lat, lng], {icon: L.spriteIcon('green')}).addTo(map);

    if (!start) {
        return;
    }
    
    if (positions.length > 0) {
        var target = positions[nextPositionNum];
        var distToNextPosition = getDistance(currentPos, target)
        if (distToNextPosition < threshold) {
            console.log("reach");
            sound.play();
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

function createModel(lat, lng) {
    var scene = $('a-scene');
    var model = $('<a-entity></a-entity');
    model.attr('scale', modelInfo.scale);
    model.attr('rotation', modelInfo.rotation);
    model.attr('gltf-model', modelInfo.url);
    model.attr('look-at', "[gps-camera]");
    model.attr('gps-entity-place', `latitude: ${lat}; longitude: ${lng}; `);
    scene.append(model);
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}


if (navigator.geolocation) {
    id = navigator.geolocation.watchPosition(success, error, options);
} else {
    // 対応していない場合
    var errorMessage = "error";
    alert( errorMessage );
}

$('.locate-button').on('click', function() {
    navigator.geolocation.getCurrentPosition(success, error, options);
})
$('.start-button').on('click', function() {
    start = true;
})
$('.map-button').on('click', function() {
    cameraArea.hide();
    mapArea.show();
})
$('.camera-button').on('click', function() {
    mapArea.hide();
    cameraArea.show();
})
$('.reach-button').on('click', function() {
    createModel(36.34901209450942, 138.99239407459294);
})
