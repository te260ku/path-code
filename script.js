var positions = [[36.35032826061445, 138.99267196655273]];
var nextPositionNum = 0;
const threshold = 1;
var options = {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 2000,
};

var map = L.map('map', {
    center: [35.66572, 139.73100],
    zoom: 17,
    zoomControl: true,
});

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
    L.marker([lat, lng]).addTo(map);
    if (positions.length > 0) {
        var distToNextPosition = getDistance(currentPos, positions[nextPositionNum])
        if (distToNextPosition < threshold) {
            console.log("reach");
            if (nextPositionNum < positions.length-1) {
                nextPositionNum ++;
            }  
        }
    }
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}


if (navigator.geolocation) {
    // var id = navigator.geolocation.watchPosition(success, error, options);
} else {
    // 対応していない場合
    var errorMessage = "error";
    alert( errorMessage );
}

$('.button').on('click', function() {
    navigator.geolocation.getCurrentPosition(success, error, options);
})
