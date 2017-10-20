var mongoose = require('mongoose');

//�������ݿ�
db_url = 'mongodb://localhost:27017/data';
mongoose.Promise = global.Promise; 
mongoose.connect(db_url, {useMongoClient: true});

//���ӳɹ�
mongoose.connection.on('connected', function () {    
    console.log('Mongoose connection open to ' + db_url);  
});    

//�����쳣
mongoose.connection.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    
 
//���ӶϿ�
mongoose.connection.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
});   

//������Ӱ��ϢSchema
var schema = mongoose.Schema;    

var infoSchema = new schema({
	urlName: String,    //���Ӻʹ���ͳһ����
	size: String,       //��С
	pixel: String,      //������
	zz: String,         //���ӵ�ַ
	cili: String,        //������ַ
	isOwner: Boolean
});

var filmSchema = new schema({
	realName: String, //��Ӱ��
	gut: String,      //����
	type: Number,     //���ͣ�0�����Ӱ��1������Ӿ�
	infos: [infoSchema]  //��Ӱ��ϸ��Ϣ                  
}); 

//����ģ��
var filmDB = mongoose.model('filmDB',filmSchema, 'filmInfos');

//����ɾ���ģ���
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
















