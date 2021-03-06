var mongoose = require('mongoose');

db_url = 'mongodb://localhost:27017/data';
mongoose.Promise = global.Promise; 
mongoose.connect(db_url, {useMongoClient: true});

mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + db_url);  
});    

mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    
 
mongoose.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
});   

var schema = mongoose.Schema;    

var infoSchema = new schema({
	urlName: String,    
	size: String,       
	pixel: String,      
	zz: String,         
	cili: String,  
	other: String,      
	isOwner: Boolean
});

var filmSchema = new schema({
	realName: String, 
	gut: String,      
	type: Number,     
	infos: [infoSchema]               
}); 

var shareSchema = new schema({
	filmName: String,
	filmUrl: String
});

var resSchema = new schema({
	email: String,
	res: String
});

var filmDB = mongoose.model('filmDB',filmSchema, 'filmInfos');
var shareDB = mongoose.model('shareDB',shareSchema, 'share');
var resDB = mongoose.model('resDB',resSchema, 'res');

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

exports.Update = function(data, callbakc){
	var conditionJson = {realName:data.belong};
	var funcJson = {$push:{infos:{urlName: data.name, other:data.url, isOwner:false}}};
	filmDB.update(conditionJson, funcJson, function(err, result){
		if(err){
			callbakc(err);
		}
		else{
			callbakc(null, result);
		}
	})
}

exports.Remove = function(){
	
}

//film share
exports.ShareInsert = function(jsonData, callback){
	var db = new shareDB(jsonData);
	db.save(function (err, res) {
        if (err) {
            callback(err);
        }
        else {
			//console.log(res);
        }
    });
}

exports.ShareRemove = function(id, callback){
	shareDB.remove({_id:id}, function(err, result){
		callback(err, result);
	})
}

exports.ShareFind = function(callback){
	shareDB.find(function(err, docs){
		callback(err, docs);
	})
}

//user res
exports.ResInsert = function(jsonData, callback){
	var db = new resDB(jsonData);
	db.save(function (err, res) {
        if (err) {
            callback(err);
        }
        else {
			//console.log(res);
        }
    });
}

exports.ResFind = function(callback){
	resDB.find(function(err, docs){
		callback(err, docs);
	})
}

exports.ResRemove = function(id, callback){
	resDB.remove({_id:id}, function(err, result){
		callback(err, result);
	})
}
















