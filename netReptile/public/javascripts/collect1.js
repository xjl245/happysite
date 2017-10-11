var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var bagpipe = require('Bagpipe');
var db = require('./mysql-pool');
var util = require('util');
var async = require('async');

var fs = require('fs'); 

var bag = new bagpipe(10);
//var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
var years = [2000];
exports.CollectFilmName = function (res) {
	//循环每一年
	async.eachSeries(years, function(curYear, callback){
		GetCurYearFilm(curYear, function(err){
			callback(err);
		});
	}, function(err){
		if(!err){
			res('OK');
		}
		else{
			console.log(err);
		}
	});
}

var GetCurYearFilm = function(curYear, res){
	async.waterfall([
		function(cb)  
		{  
			//得到当前年份所有的url并拼接成list
			GetFilmNameUrls(curYear, cb);  
		},
		function(urls, cb)
		{
			//得到当前年份所有url的电影名
			GetUrlsFilmName(urls, cb);
		},
		function(list, cb)
		{
			//将所有当前年份的电影名按100个一组存入数据库
			cb(null);
		}
	], function(err){
		res(err);
	});
}

function GetFilmNameUrls(curYear, cb)
{
	GetFilmMaxPage(curYear, function(num){
		//拼出所有url
		var currentYearUrls = [];
		for(var i = 1; i <= +num; i++)
		{
			currentYearUrls.push('http://dianying.2345.com/list/----' + curYear + '---' + i + '.html');
		}
		
		cb(null, currentYearUrls);
	});
}

function GetFilmMaxPage(curYear, res)
{
	var dstUrl = 'http://dianying.2345.com/list/----' + curYear + '--.html';
	
	GetMaxPage(dstUrl, res);
}

function GetMaxPage(url, res)
{
	request({
			url: url,
			encoding: null
		},function(error, response, body){
			if (!error) {
				var html = iconv.decode(body, 'gbk');
				var ch = cheerio.load(html);
				
				var num = ch('.v_page').children().last().prev().text();
				
				res(num);
			}
		});
}

//所有url的电影名
function GetUrlsFilmName(urls, cb)
{
	var curYearFilmNames = [];
	async.eachSeries(urls, function(url, callback){
		GetUrlFilmName(url, function(err, names){
			for(var i = 0; i < names.length; i++){
				curYearFilmNames.push(names[i]);
			}
			callback(err);
		});
	}, function(err){
		if(!err){
			cb(null, curYearFilmNames);
		}
		else{
			cb(err);
		}
	});
}

//单个url的电影名
function GetUrlFilmName(url, callback)
{
	var jsonBag = {url:url,encoding: null};
	bag.push(request, jsonBag, GetFilmName(callback));
}

function GetFilmName(callback)
{
	return CollectName('.emTit', 0, callback);
}

//解析网页得到电影名
function CollectName(className, type, callback)
{
	return function(error, response, body){
				if (!error)
				{
					var names = [];
					var html = iconv.decode(body, 'gbk');
					var ch = cheerio.load(html);

					ch(className).each(function(i, elem){						
						var title = ch(this).children().first().text();
						var obj = {title: title};
						
						if(FilterName(obj)){
							names.push(obj.title);
							//callback(error, names);
							//var sql = util.format("insert into filmname(name, type) values('%s', %s)", trim(obj.title), type);
							/* db.con(sql, function(result){
								//res.send(result);
							}); */
							/* fs.writeFile(filePath, trim(obj.title) + '\r\n', { 'flag': 'a' }, function(err) {
								if (err) {
									console.log(err);
								}
							}); */
						}
					});
					callback(null, names);
				}
				else{
					callback(error);
				}
			};
};

function FilterName(obj){
	var filtersEqualDel = ['\r\n', '\n'];
	var filterContainsDel = ['微电影', '微电', '优酷', '京畿道', '北京国际电影', '好莱坞', 'BBC：', 'KBS：', '《'];
	var filtersCut = ['（', '…', '[', '1：', '2：', '3：', '4：', '5：', '6：', '7：', '8：', '9：', '10：'
						, '第1季', '第2季', '第3季', '第4季', '第5季', '第6季', '第7季', '第8季', '第9季', '第10季', '第11季', '第12季'
						, '第一季', '第二季', '第三季', '第四季', '第五季', '第六季', '第七季', '第八季', '第九季', '第十季', '第十一季', '第十二季', '未删'
						, '电影版', '粤语', '国语', '英语'];
	
	for(var i = 0; i < filtersEqualDel.length; i++){
		if(obj.title === filtersEqualDel[i]){
			return false;
		}
	}
	
	for(var i = 0; i < filterContainsDel.length; i++){
		if(IsContains(obj.title, filterContainsDel[i])){
			return false;
		}
	}	
	
	for(var i = 0; i < filtersCut.length; i++){
		if(IsContains(obj.title, filtersCut[i])){
			obj.title = obj.title.substr(0, obj.title.indexOf(filtersCut[i]));
		}
	}

	
	return true;
}

//小函数
function IsContains(source, dest){
	if(source.indexOf(dest) >= 0){
		return true;
	}
	return false;
}

function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
}
