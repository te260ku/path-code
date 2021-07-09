var mapArea = $('#map-area');
var selectedLine;
const activityList = [
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
setCurrentModeText(currentMode);

var activitySelector = $('.activity-selector');



// ビュー切り替え
$('.set-map-button').on('click', function() {
    setMapModal.show();
})
$('.view-map-button').on('click', function() {
    viewMapModal.show();
})

// モード切り替え
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


function setCurrentModeText(mode) {
    var keys = Object.keys(modes);
    $('.current-mode').text(keys[mode] + ' setting');
}



// ------------------------------------------------
// UI

// mapを作成
var map = L.map('map', {
    center: [35.66572, 139.73100],
    zoom: 17,
    zoomControl: true,
});
var tileLayer_set = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer_set.addTo(map);

var mapView = L.map('view-map', {
    center: [35.66572, 139.73100],
    zoom: 17,
    zoomControl: true,
});
var tileLayer_view = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
tileLayer_view.addTo(mapView);

var setMapModal = new bootstrap.Modal(document.getElementById('set-map-modal'));
var viewMapModal = new bootstrap.Modal(document.getElementById('view-map-modal'));
$('#set-map-modal').on('show.bs.modal', function(){
    setTimeout(function() {
      map.invalidateSize();
    }, 10);
});

$('#view-map-modal').on('show.bs.modal', function(){
    setTimeout(function() {
      mapView.invalidateSize();
    }, 10);
});




// マーカー設置イベント
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
            line.bindPopup("<h3 class='text-center'>" + line.id + "</h3>");
            line.activity = activityList[0].name;
            
            line.on('click', function(event) {
                if (currentMode != modes.activity) {
                    return;
                }
                selectedLine = event.target;
                selectLine(selectedLine);
            });
    
            lines.push(line);

            createPathTables();

            console.log("draw line");
    } 
    }
});

function selectLine(line) {
    activitySelector.val(line.activity);
    console.log("select line");
}

// 行動設定イベント
$('.set-activity-button').on('click', function() {
    if (selectedLine == null) {
        return;
    }
    selectedLine.activity = activityList[activitySelector.prop("selectedIndex")].name;
    selectedLine.setStyle({
        color: activityList[activitySelector.prop("selectedIndex")].color
    });
    lines[selectedLine.id] = selectedLine;
    createPathTables();
})

function createPathTables() {
    var pathList = $('.path-list');
    pathList.empty();
    for (i=0; i<markers.length-1; i++) {
        var row = `<tr><td>` + i + `</td><td>` + lines[i].activity + `</td><td>` + (i+1) + `</td></tr>`;
        $('.path-list').append(row);
    }
}


// 送信ボタンを押したときの処理
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
        "pathInfo": {'positions': positions, 'activities': JSON.parse(a)}, 
        "message": message
    }
    

    var sendData = {
        "nickname": nickname, 
        "positions": p, 
        "activities": a, 
        "message": message
    }

    showSelectedPath(currentPathData);
    sendPathData(sendData);
});

$('.fetch-path-button').on('click', function () {
    var num = $('.fetch-form').val();
    sendFetchRequest(num);
})

function showSelectedPath(data) {
    $('.creator-nickname').text("created by: " + data["nickname"]);
    
    var pathList = $('.selected-path-list');
    pathList.empty();

    var m = data["pathInfo"]["positions"];
    var l = data["pathInfo"]["activities"];
    for (i=0; i<m.length-1; i++) {
        var row = `<tr><td>` + i + `</td><td>` + l[i] + `</td><td>` + (i+1) + `</td></tr>`;
        pathList.append(row);
    }
}


function sendPathData(data) {
    $.ajax({
        async: true,
        url: 'https://usa2021.jn.sfc.keio.ac.jp:1081',
        type: 'post',
        cache: false,
        data: data,
        dataType: 'json', 
        traditional: true,

    }).done(function(res, status, jqXHR) {
        console.log(currentPathData);
        alert("submited path");
        
    }).fail(function(xhr, status, error){
	    console.log(status);
    });

}

function sendFetchRequest(num){
    $.ajax({
        async: true,
        url: 'https://usa2021.jn.sfc.keio.ac.jp:1081',
        type: 'get',
        data: {num: num},

    }).done(function(res, status, jqXHR) {
        console.log("send request");
        console.log(res);
        currentPathData = res;
        showSelectedPath(currentPathData);
        alert("retrieved path");

    }).fail(function(xhr, status, error){
	    console.log(status);
    });
}






