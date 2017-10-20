var mongoose = require('mongoose');

//连接数据库
db_url = 'mongodb://localhost:27017/data';
mongoose.Promise = global.Promise; 
mongoose.connect(db_url, {useMongoClient: true});

//连接成功
mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + db_url);  
});    

//连接异常
mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    
 
//连接断开
mongoose.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
});   

//创建电影信息Schema
var schema = mongoose.Schema;    

var infoSchema = new schema({
	urlName: String,    //种子和磁力统一名称
	size: String,       //大小
	pixel: String,      //清晰度
	zz: String,         //种子地址
	cili: String,        //磁力地址
	isOwner: Boolean
});

var filmSchema = new schema({
	realName: String, //电影名
	gut: String,      //剧情
	type: Number,     //类型：0代表电影，1代表电视剧
	infos: [infoSchema]  //电影详细信息                  
}); 

//创建模型
var filmDB = mongoose.model('filmDB',filmSchema, 'filmInfos');

//增，删，改，查
exports.Insert = function(jsonData, callback){
	var db = new filmDB(jsonData);
	db.save(function (err, res) {
        if (err) {
            callback(err);
        }
        else {
			//console.log(res);
        }
    });
}

exports.Find = function(condition, callback){
	var json = {realName:{'$regex':condition, '$options':'$i'}};
	filmDB.find(json, function(err, docs){
		if(err){
			callback(err);
		}
		else{
			callback(null, docs);
		}
	});
}

exports.Remove = function(){
	
}
















