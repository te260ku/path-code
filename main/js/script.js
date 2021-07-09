var positions = [];
var nextPositionNum = 0;
var threshold = 5;
var id;
var userPosition;
var modelInfo = {
        url: './assets/models/scene.gltf',
        scale: '2 2 2',
        rotation: '0 180 0'
    };
var start = false;
var currentMarker;
var currentPosition = [36.34901209450942, 138.99239407459294];
var currentPathData;


// activity
var activities = [];
var nextActivity;



var sound = new Audio();
sound.preload = "auto";
sound.src = "../../assets/audio/sound.mp3";
sound.load();


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

    // 現在地をマーカーで表示
    if (userPosition == null) {
        userPosition = L.marker([lat, lng], {icon: L.spriteIcon('green')}).addTo(map);
    } else {
        userPosition.setLatLng([lat, lng]);
    }
    

    if (!start) {
        return;
    }
    
    if (positions.length > 0) {
        var target = positions[nextPositionNum];
        
        // ----------------------------------
        // activity
        // if (activities.length > 0) {
        //     // 次が最後の目標地点ではない場合
        //     if (nextPositionNum < positions.length) {
        //         if (currentActivity == nextActivity) {
        //             activities[nextPositionNum].done = true;
        //             alert("done activity");
        //         }
        //     }
        // }
        // ----------------------------------

        var distToNextPosition = getDistance(currentPos, target)
        if (distToNextPosition < threshold) {
            console.log("reach");
            // sound.play();
            L.marker([target[0], target[1]], {icon: L.spriteIcon('red')}).addTo(map);
            if (nextPositionNum < positions.length-1) {
                nextPositionNum ++;
            } else {
                // 最終地点に到達したら
                navigator.geolocation.clearWatch(id);
                var isCompleted = true;


                // for (i=0; i<activities.length; i++) {
                //     if (activities[i].done == false) {
                //         isCompleted = false;
                //         break;
                //     }
                // }
                
                if (isCompleted) {
                    // 3Dモデルを作成する
                    createModel(target[0], target[1]);
                    alert("SUCCESS");
                } else{
                     alert("FAIL");
                }
                
                
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

$('.locate-button').on('click', function() {
    navigator.geolocation.getCurrentPosition(setCurrentPosition, error, options);
    map.setView([currentPosition[0], currentPosition[1]], 17);
    L.marker([currentPosition[0], currentPosition[1]], {icon: L.spriteIcon('green')}).addTo(map);
})

$('.start-button').on('click', function() {
    startFollowing();
})

function startFollowing() {
    // 道順を初期化
    positions = currentPathData["pathInfo"]["positions"];

    // 移動方法を初期化
    var rawActivities = currentPathData["pathInfo"]["activities"];
    for (i=0; i<rawActivities.length; i++) {
        var tmp = {name: rawActivities[i], done: false}
        activities.push(tmp);
    }
    nextActivity = activities[nextPositionNum];

    // viewマップに選択された経路を描画
    for (i=0; i<positions.length; i++) {
        var p = positions[i];
        var m = L.marker([p[0], p[1]]).addTo(mapView);

        if (i > 0) {
            var a = activities[i-1].name;
            var c = activityList.find((activity) => {
                return (activity.name === a);
            });
            var line = L.polyline([
                markers[i-1].getLatLng(), 
                markers[i].getLatLng(), 
            ],{
                "color": c.color,
                "weight": 5,
                "opacity": 1,  
            }).addTo(mapView);
        }
    }
    
    
    start = true;
}

// $('.reach-button').on('click', function() {
//     console.log("push");
//     // center: createModel(36.34933127648259, 138.99257243887092);
//     // outside: createModel(36.34901209450942, 138.99239407459294);
//     createModel(36.34901209450942, 138.99239407459294);
// })


// AFRAME.registerComponent('gps-entity-place-added', {
// 	init: function(){
// 	    // alert('add');
//         console.log("add");
// 	}
// });


