var express = require('express');
var mongo = require('../netReptile/public/javascripts/mongo');
var router = express.Router();

router.get('/', function(req, res, next){
	res.send('横说竖说');
});

router.post('/', function(req, res, next){	
	mongo.Find(req.body.filmName, function(err, docs){		
		if(!err){
			for(var i = 0; i < docs.length; i++){
				console.log(docs[i].infos);
				if(docs[i].type === 0){
					docs[i].realName += '(电影)';
				}
				else if(docs[i].type === 1){
					docs[i].realName += '(电视剧)';
				}
				/*for(var j = 0; j < docs[i].infos.length; j++){
					if(docs[i].infos[j].urlName.length > 50){
						docs[i].infos[j].urlName = docs[i].infos[j].urlName.substr(0, 70);
						docs[i].infos[j].urlName += '......';
					}
				}*/
			}
			
			res.render('recommend', { title: 'Express',  films: docs});
		}
		else{
			res.send(err);
		}
	});

});

module.exports = router;