var mongo = require('../../netReptile/public/javascripts/mongo');

var allFilms = [];

exports.FetchAll = function(name, res){
	/* var json = {};
	var infos = [];
	var info = {};
	json.filmTitle = ""; //电影名
	json.state = "";     //剧情
	json.type = 0;       //电影或者电视剧
	info.sourceTitle = ""; //资源名
	info.torrent = "";    //种子地址
	info.magnetic = "";   //磁力链接地址
	info.size = "";      //大小
	info.clarity = "";   //清晰度
	info.isOwner = true; //是否属于本网站
	json.infos = infos; */
	
	mongo.Find(name, function(error, docs){
		if(error){
			res(error);
		}
		else{
			res(null, docs);
		}
	});
}