var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var bagpipe = require('Bagpipe');
var db = require('./mysql-pool');
var util = require('util');
var async = require('async');

var fs = require('fs'); 

var bag = new bagpipe(10);
var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
//var years = [2000];
exports.CollectFilmName = function (res) {
	//循环每一年	
	db.con('TRUNCATE TABLE filmname', function(err, result){
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
	});
}

exports.CollectWatchName = function (res) {
	//循环每一年	
	async.eachSeries(years, function(curYear, callback){
		GetCurYearWatch(curYear, function(err){
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
			//得到所有的sql语句
			GetSqls(list, 0, cb);
		},
		function(sqls, cb)
		{
			//保存名称
			for(var i = 0; i < sqls.length; i++){
				db.con(sqls[i], function(err, result){
					if(err)
					{
						cb(err);
					}
				});
			}
			cb(null);
		}
	], function(err){
		res(err);
	});
}

var GetCurYearWatch = function(curYear, res){
	async.waterfall([
		function(cb)  
		{  
			//得到当前年份所有的url并拼接成list
			GetWatchNameUrls(curYear, cb);  
		},
		function(urls, cb)
		{
			//得到当前年份所有url的电影名
			GetUrlsWatchName(urls, cb);
		},
		function(list, cb)
		{
			//得到所有的sql语句
			GetSqls(list, 1, cb);
		},
		function(sqls, cb)
		{
			//保存名称
			for(var i = 0; i < sqls.length; i++){
				db.con(sqls[i], function(err, result){
					if(err)
					{
						cb(err);
					}
				});
			}
			cb(null);
		}
	], function(err){
		res(err);
	});
}

function GetWatchNameUrls(curYear, cb)
{
	GetWatchMaxPage(curYear, function(num){
		//拼出所有url
		var currentYearUrls = [];
		for(var i = 1; i <= +num; i++)
		{
			currentYearUrls.push('http://tv.2345.com/---' + curYear + '--' + i + '.html');
		}
		
		cb(null, currentYearUrls);
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

function GetWatchMaxPage(curYear, res)
{
	var dstUrl = 'http://tv.2345.com/---' + curYear + '.html';
	
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

//所有url电视剧名
function GetUrlsWatchName(urls, cb)
{
	var curYearWatchNames = [];
	async.eachSeries(urls, function(url, callback){
		GetUrlWatchName(url, function(err, names){
			for(var i = 0; i < names.length; i++){
				curYearWatchNames.push(names[i]);
			}
			callback(err);
		});
	}, function(err){
		if(!err){
			cb(null, curYearWatchNames);
		}
		else{
			cb(err);
		}
	});
}

//单个url电视剧名
function GetUrlWatchName(url, callback)
{
	var jsonBag = {url:url,encoding: null};
	bag.push(request, jsonBag, GetWatchName(callback));
}

//单个url的电影名
function GetUrlFilmName(url, callback)
{
	var jsonBag = {url:url,encoding: null};
	bag.push(request, jsonBag, GetFilmName(callback));
}

function GetFilmName(callback)
{
	return CollectName('.emTit', callback);
}

function GetWatchName(callback)
{
	return CollectName('.sTit', callback);
}

//解析网页得到电影名或电视剧名
function CollectName(className, callback)
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
							names.push(trim(obj.title));
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
						, '电影版', '粤语', '国语', '英语', '英文','DVD' ,'TV版'];
	
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
	return str.replace(/(^\s*)|(\s*$)/g, "").replace(/([0-9])$/, "");
}

function GetSqls(list, type, cb)
{
	var sqls = [];
	
	var sql = 'insert into filmname(name, type) values';
	var sqlAdds = [];
	for(var i = 0; i < list.length; i++){				
		var sqlAdd = util.format("('%s', %d)", list[i], type);
		sqlAdds.push(sqlAdd);
		
		if((i + 1) % 100 === 0 || i === list.length - 1){
			sql += sqlAdds.join(',');
			sqls.push(sql);
			
			sql = 'insert into filmname(name, type) values';
			sqlAdds = [];
		}
	}
	
	cb(null, sqls);
} 

//以下是采集电影种子
//将数据库中每100条读取出来
//循环这些名称采集
//1.先取得搜索之后的页面并分析出结果url和真实电影名称[{realname:xxx, url:xxxx, type:x}]
//2.循环上面的url取出所有种子并和真实电影名称一起存入数据库[{realname:xxxxxxxxx, urls:[], type:x}]
//{urlName:xxxxx,zhongzi:xxxxx,cili:xxxxx,size:xxxx,pixel:xxxx}

exports.CollectFilmInfo = function(res)
{
	async.waterfall([
		function(cb)  
		{  
			//得到100条名字
			//cb(null, ['加勒比海盗', '那年花开月正圆', '电话撒哈达萨']); 
			cb(null, ['加勒比海盗']); 
		},
		function(nameList, cb)
		{
			//循环这些名称采集出真正的名字和url以及其类型
			var allUrls = [];
			async.eachSeries(nameList, function(name, callback){
				GetUrlsByName(name, allUrls, function(err){
					callback(err);
				});
			}, function(err){
				cb(err, allUrls);
			});
		},
		function(urlList, cb)
		{
			//console.log(urlList.length);
			//循环所有url采集出名字对应的种子等信息
			var allInfos = [];
			async.eachSeries(urlList, function(url, callback){
				GetAllInfo(url.url, function(err, gut, infos){
					allInfos.push({realName:url.realName, gut:gut, infos:infos, type:url.type});
					//console.log(allInfos[0].infos)
					callback(err);
				}); 
			}, function(err){
				cb(err, allInfos);
			});
		},
		function(allInfos, cb)
		{
			//将所有信息存入数据库
			//console.log(allInfos);
			cb(null);
		}
	], function(err){
		res(err);
	});
}

function GetUrlsByName(name, allUrls, res)
{
	var nameEncode = encodeURI(name);
	var jsonBag = {url:'https://gaoqing.fm/s.php?q=' + nameEncode, encoding: null};
	bag.push(request, jsonBag, GetUrls(allUrls, res));
}

function GetUrls(allUrls, res)
{
	return function(error, response, body){
				if (!error)
				{
					var html = iconv.decode(body, 'utf8');
					var ch = cheerio.load(html);
					ch('#result1').children('.row').each(function(i, elem){
						var realName = ch(elem).children('.col-md-9').find('h4').text();
						var detailUrl = ch(elem).children('.x-m-side.col-md-3').find('a').attr('href');
						//console.log(realName + ': ' +　detailUrl);
						
						var type = 0;
						ch(elem).children('.col-md-9').find('#viewfilm').children('.x-m-label').each(function(j, elem1){
							//console.log(ch(elem1).text());
							if(ch(elem1).text() === '集数'){
								type = 1;
							}
						});						
						
						var urlInfo = {};
						urlInfo.realName = realName;
						urlInfo.url = detailUrl;
						urlInfo.type = type;
						//console.log(realName);
						allUrls.push(urlInfo);
					});
				}
				else{
				}
				
				res(error);
			};
}

function GetAllInfo(url, res)
{
	request({
			url: url,
			encoding: null
		},function(error, response, body){
			if (!error) {				
				var html = iconv.decode(body, 'utf8');
				var ch = cheerio.load(html);

				//剧情
				var gut = '';
				if((gut = ch('#des-ex').text()) === ''){
					gut = ch('#des-full').text();
				}
				var infos = [];
				ch('#cili').find('tr').each(function(i, elem){
					var info = {};					
					if(!ch(elem).hasClass('hidden-cililian-btn') && !ch(elem).hasClass('show-cililian-btn')){
						info.urlName = ch(elem).find('b').text();
						//urlName.push(name);
						//console.log(info.urlName);

						ch(elem).find('a').each(function(j, val){
							if(j === 0){
								//console.log('种子' + ch(this).attr('href'))
								//zz.push(ch(this).attr('href'));
								info.zz = ch(val).attr('href');
								//console.log(info.zz);
							}
							else {
								//console.log('磁力' + ch(this).attr('href'))
								//cili.push(ch(this).attr('href'));
								info.cili = ch(val).attr('href')
								//console.log(info.cili);
							}
						});

						ch(elem).find('span').each(function(j, value){
							var spanInfo = ch(value);
							if(spanInfo.hasClass('label') && spanInfo.hasClass('label-warning'))	{
								//var size = spanInfo.text();
								//sizes.push(size);
								//console.log(size);
								info.size = spanInfo.text();
								//console.log(info.size);
							}
							if(spanInfo.hasClass('label') && spanInfo.hasClass('label-danger')){
								//var pixel = spanInfo.text();
								//pixels.push(pixel);
								//console.log(pixel);
								info.pixel = spanInfo.text();
								//console.log(info.pixel);
							}
						});
					}
					//console.log(info);
					infos.push(info);
				});
				
				/* for(var i = 0; i < urlName.length; i++){
					WriteInfo(gut, realName, urlName[i], zz[i], cili[i], sizes[i], pixels[i]);
				} */
				//console.log(infos);
				res(null, gut, infos)
			}
			else{
				res(error);
			}
		});
}
