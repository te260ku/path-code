////////////////////////////////////////////////////////////////////
//Node.jsを使った HTTPS で通信するサーバプログラムの例
////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
//Appサーバ側のポート設定
//  - チーム毎に異なるport番号を使用する必要があります
//  - 各チーム, 自分のチーム番号の行だけ、冒頭の//を削除して、命令を有効化してください
///////////////////////////////////////////////////////////

//var server_port=11080; //For team 0=大越テスト  外からは port 1080番 https://usa2021.jn.sfc.keio.ac.jp:1080/ で繋がります
var server_port = 11081; //For team 1   外からは port 1081番 https://usa2021.jn.sfc.keio.ac.jp:1081/ で繋がります
//var server_port=11082; //For team 2   外からは port 1082番 https://usa2021.jn.sfc.keio.ac.jp:1082/ で繋がります
//var server_port=11083; //For team 3   外からは port 1083番 https://usa2021.jn.sfc.keio.ac.jp:1083/ で繋がります
//var server_port=11084; //For team 4   外からは port 1084番 https://usa2021.jn.sfc.keio.ac.jp:1084/ で繋がります
//var server_port=11085; //For team 5   外からは port 1085番 https://usa2021.jn.sfc.keio.ac.jp:1085/ で繋がります
//var server_port=11086; //For team 6   外からは port 1086番 https://usa2021.jn.sfc.keio.ac.jp:1086/ で繋がります
//var server_port=11087; //For team 7   外からは port 1087番 https://usa2021.jn.sfc.keio.ac.jp:1087/ で繋がります
//var server_port=11088; //For team 8   外からは port 1088番 https://usa2021.jn.sfc.keio.ac.jp:1088/ で繋がります
//var server_port=11089; //For team 9   外からは port 1089番 https://usa2021.jn.sfc.keio.ac.jp:1089/ で繋がります
//var server_port=11090; //For team 10   外からは port 1090番 https://usa2021.jn.sfc.keio.ac.jp:1090/ で繋がります
//var server_port=11091; //For team 11   外からは port 1091番 https://usa2021.jn.sfc.keio.ac.jp:1091/ で繋がります
//var server_port=11092; //For team 12   外からは port 1092番 https://usa2021.jn.sfc.keio.ac.jp:1092/ で繋がります
//var server_port=11093; //For team 13   外からは port 1093番 https://usa2021.jn.sfc.keio.ac.jp:1093/ で繋がります
//var server_port=11094; //For team 14   外からは port 1094番 https://usa2021.jn.sfc.keio.ac.jp:1094/ で繋がります
//var server_port=11095; //For team 15   外からは port 1095番 https://usa2021.jn.sfc.keio.ac.jp:1095/ で繋がります

///////////////////////////////////////////////////////////
//ここから下は、書き替える必要はありません
///////////////////////////////////////////////////////////
// HTTP server moduleの "express" を読み込み、準備
var express = require('express');
var app = express();

// HTTP"S"サーバーを準備して起動
var fs = require('fs');
var https = require('https');
var options = {
  key:  fs.readFileSync('/etc/apache2/myCA3/server.key'),
  cert: fs.readFileSync('/etc/apache2/myCA3/server.crt')
};
var server = https.createServer(options, app);

//Body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})
///////////////////////////////////////////////////////////
//ここから上は、書き替える必要はありません
///////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////
//HTTPのPOSTメソッドで、パス=/ に通信を受け付けたときの処理を定義
///////////////////////////////////////////////////////////
var mydata = [];
app.post('/',function(req, res){
    var obj = {};

    nickname = JSON.stringify( req.body.nickname );
    activities = JSON.parse( req.body.activities );
    positions = JSON.parse( req.body.positions );
    message = JSON.stringify( req.body.message );

    
    for (i=0; i<positions.length; i++) {
      positions[i] = JSON.parse(positions[i]);
    }
    
    
    var data = {"nickname": nickname, "pathInfo" :{"positions": positions, "activities": activities}, "message": message };
    
    // mydata.push(data);

    console.log(data["pathInfo"]["positions"]);
    console.log(data["pathInfo"]["activities"]);


    // res.send(mydata);
});


///////////////////////////////////////////////////////////
//HTTPSサーバを起動し、クライアントからのコネクションを待ち始める
///////////////////////////////////////////////////////////
console.log("Now start listening at the port: " + server_port );
server.listen(server_port);

