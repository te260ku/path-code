soundON = true;
var soundActivity = new Audio();

var currentActivity = "";

//CONFIG: Length of each time window
const NUM_DATA_PER_FRAME = 200;

//Arrays for saving the raw sensor data
var xdata = [];
var ydata = [];
var zdata = [];
var num_data = 0;

//Features
var xmin = 0.0;
var xmax = 0.0;
var xave = 0.0;
var ymin = 0.0;
var ymax = 0.0;
var yave = 0.0;
var zmin = 0.0;
var zmax = 0.0;
var zave = 0.0;

//////////////////////////////////////////////////////
//Function to get sensor access permission from the browser
//////////////////////////////////////////////////////
function requestMotionPermission(){
  if ( DeviceMotionEvent &&
       typeof DeviceMotionEvent.requestPermission === 'function' ){
      // iOS 13+ の Safari
      // 許可を取得
      DeviceMotionEvent.requestPermission().then(permissionState => {
	  if (permissionState === 'granted') {
        // 許可を得られた場合、devicemotionをイベントリスナーに追加
	      window.addEventListener("devicemotion", handleAcceleration, false);

        if (soundON) {
          soundActivity.src = '../assets/audio/stand.mp3';
          soundActivity.play();
        }
        
	  } else {
        // 許可を得られなかった場合の処理
	      console.log("Perrmission not granted!");
	      alert("Perrmission not granted!");
	  }
      }).catch(console.error) // https通信でない場合などで許可を取得できなかった場合

  } else {
      //For other devices
      console.log("detected other device. so adding listener...");
      window.addEventListener("devicemotion", handleAcceleration, false);
  }

}

function stopDeviceMotion(){ 
    window.removeEventListener("devicemotion", handleAcceleration, false);
}


////////////////////////////////////////////////////////////////////
//Function(1): 読み込まれてきた最新の加速度データ(X,Y,Z)を処理する関数
//  - この関数は(機種によりますが) 秒速10〜100回というような高頻度で呼ばれます
////////////////////////////////////////////////////////////////////
function handleAcceleration(ev){


    num_data++;
    //If we have enough raw sensor data...
    if( num_data == NUM_DATA_PER_FRAME ){

	//execute feature calculations.
	featureExtraction();

	//Let's classify the activity!
	currentActivity = classify();
	$('#current_result').text( current_activity );
	
	//clear the raw sensor data
	xdata=[];
	ydata=[];
	zdata=[];
	
	//Counter back to 0
	num_data=0;
    }
    
}

////////////////////////////////////////////////////////////////////
//Function(2):センサデータから "feature"(特徴量)を計算する関数
//  - この関数は NUM_DATA_PER_FRAME 変数で設定された数だけセンサデータが
//    「設定されたタイムフレーム」にたまる度に呼ばれます。
//  - 例: センサデータが 50Hz (=50 data / seconds)
//        NUM_DATA_PER_FRAME が 200 の場合
//        → 約4秒に1度の頻度で呼ばれます
////////////////////////////////////////////////////////////////////
//helper func. to calculate average
const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

function featureExtraction(){
    xmin = Math.min.apply(Math, xdata); $('#xmin').text(xmin);
    xmax = Math.max.apply(Math, xdata); $('#xmax').text(xmax);
    xave = ss.mean(xdata); $('#xave').text(xave);
    xstd = ss.sampleStandardDeviation(xdata); $('#xstd').text(xstd);
    
    ymin = Math.min.apply(Math, ydata); $('#ymin').text(ymin);
    ymax = Math.max.apply(Math, ydata); $('#ymax').text(ymax);
    yave = ss.mean(ydata); $('#yave').text(yave);
    ystd = ss.sampleStandardDeviation(ydata); $('#ystd').text(ystd);

    zmax = Math.max.apply(Math, zdata); $('#zmax').text(zmax);
    zmin = Math.min.apply(Math, zdata); $('#zmin').text(zmin);
    zave = ss.mean(zdata); $('#zave').text(zave);
    zstd = ss.sampleStandardDeviation(zdata); $('#zstd').text(zstd);

    xycor = ss.sampleCorrelation(xdata, ydata); $('#xycor').text(xycor);
    xzcor = ss.sampleCorrelation(xdata, zdata); $('#xzcor').text(xzcor);
    yzcor = ss.sampleCorrelation(ydata, zdata); $('#yzcor').text(yzcor);
}

////////////////////////////////////////////////////////////////////
//Function(3): 最新フレームにおける特徴量(feature)から、現在のユーザの
//行動を分類 (classify) する関数          
//  - ここに書いてあるのは、手打ちで書いたサンプルのif文ロジックです
//  - 実際には機械学習エンジンが出力したif文の固まり (決定木アルゴリズムの場合)
//  - がここに入ります
////////////////////////////////////////////////////////////////////
function classify(){

    res = ''
    if (xstd < 0.09) {
      if (xave < 0.39) {
        res = 'walk-camera';
      } else {
        res = 'stand';
      }
    } else {
      if (xave < 1.05) {
        res = 'walk-hand';
      } else {
        res = 'run-hand';
      }
    }

    if (soundON) {
      soundActivity.src = '../assets/audio/' + res + '.mp3';
      soundActivity.play();
    }

    return res;

}