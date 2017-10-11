var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var fs = require('fs'); 
var bagpipe = require('Bagpipe');
var db = require('./mysql-pool');
var util = require('util');


exports.CollectFilmInfo = function (res) {
    //此处电影名从数据库中读来
    /*var searchName = encodeURI('加勒比海盗');
    request({
        url: 'https://gaoqing.fm/s.php?q=' + searchName,
        encoding: null
    },function(error, response, body){
        if (!error) {
            var html = iconv.decode(body, 'utf8');
            var ch = cheerio.load(html);

            res(html);
        }
    });*/
	
	//读出所有电影名或者电视剧
	//var films = ['加勒比海盗', '三生三世十里桃花', '权力的游戏', '一年永恒'];
	//var films = ['大鱼海棠'];
	var films = ['加勒比海盗'];
	//循环每一个电影名采集		
	var bag = new bagpipe(10);
	for(var i = 0; i < films.length; i++)
	{
		var nameEncode = encodeURI(films[i]);
		var jsonBag = {url:'https://gaoqing.fm/s.php?q=' + nameEncode, encoding: null};
		bag.push(request, jsonBag, GetFilm());
	}
    res('OK');
};

exports.CollectFilmName = function (res) {	
	var currentYear = 2000;
	
	while(1){
		if(currentYear > 2017)
		{
			res('ok');
			return;
		}
		
		GetCurYearFilms(currentYear);
		
		currentYear++;
	}
};	

exports.CollectWatchName = function (res) {
    var currentYear = 2000;
	
	while(1){
		if(currentYear > 2017)
		{
			res('ok');
			return;
		}
		
		GetCurYearWatches(currentYear);
		
		currentYear++;
	}
};

function GetCurYearFilms(currentYear)
{
	var num = '';
	GetFilmMaxPage(currentYear, function(pageNum)
	{
		//先得到当前年份的最大页数
		num = pageNum;
		
		//拼出所有url
		var currentYearUrls = [];
		for(var i = 1; i <= +num; i++)
		{
			currentYearUrls.push('http://dianying.2345.com/list/----' + currentYear + '---' + i + '.html');
		}
		
		//开始采集
		var bag = new bagpipe(10);
		for(var i = 0; i < currentYearUrls.length; i++)
		{
			var jsonBag = {url:currentYearUrls[i],encoding: null};
			bag.push(request, jsonBag, collectFilmName());
			
			if(i == currentYearUrls.length - 1)
			{
			}
		}
	});	
}

function GetCurYearWatches(currentYear)
{
	var num = '';
	GetWatchMaxPage(currentYear, function(pageNum){
		//先得到当前年份的最大页数
		num = pageNum;
		
		//拼出所有url
		var currentYearUrls = [];
		for(var i = 1; i <= +num; i++)
		{
			currentYearUrls.push('http://tv.2345.com/---' + currentYear + '--' + i + '.html');
		}
		
		//开始采集
		var bag = new bagpipe(10);
		for(var i = 0; i < currentYearUrls.length; i++)
		{
			var jsonBag = {url:currentYearUrls[i],encoding: null};
			bag.push(request, jsonBag, collectWatchName());
			
			if(i == currentYearUrls.length - 1)
			{				
			}
		}
	});
}

function GetWatchMaxPage(currentYear, res)
{
	var dstUrl = 'http://tv.2345.com/---' + currentYear + '.html';
	
	GetMaxPage(dstUrl, res);
}

function GetFilmMaxPage(currentYear, res)
{
	var dstUrl = 'http://dianying.2345.com/list/----' + currentYear + '--.html';
	
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

function GetFilm()
{
	return function(error, response, body){
				if (!error)
				{
					var html = iconv.decode(body, 'utf8');
					var ch = cheerio.load(html);
					ch('#result1').children('.row').each(function(i, elem){
						var realName = ch(this).children('.col-md-9').find('h4').text();
						var detailUrl = ch(this).children('.x-m-side.col-md-3').find('a').attr('href');
						CollectUrls(detailUrl, realName);
					});
				}
				else{
					console.log('error');
				}
			};
}

function collectFilmName()
{
	//return CollectName('.emTit', './testFilm.txt');
	return CollectName('.emTit', 0);
}

function collectWatchName()
{
	//return CollectName('.sTit', './testWatch.txt');
	return CollectName('.sTit', 1);
}

function CollectName(className, type)
{
	return function(error, response, body){
				if (!error)
				{
					var html = iconv.decode(body, 'gbk');
					var ch = cheerio.load(html);
					
					ch(className).each(function(i, elem){
						var title = ch(this).children().first().text();
						var obj = {title: title};
						
						//每采集一个名字往sql语句加一个，采集到100个时开始插入,另外判断当前是否是最后一页
						if(FilterName(obj)){
							var sql = util.format("insert into filmname(name, type) values('%s', %s)", trim(obj.title), type);
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
				}
				else{
				}
			};
};

function CollectUrls(detailUrl, realName)
{
	request({
			url: detailUrl,
			encoding: null
		},function(error, response, body){
			if (!error) {
				var urlName = [];
				var zz = [];
				var cili = [];
				var sizes = [];
				var pixels = [];
				
				var html = iconv.decode(body, 'utf8');
				var ch = cheerio.load(html);

				//剧情
				var gut = ch('#des-ex').text();
				
				ch('#cili').find('tr').each(function(i, elem){
					var info = ch(this);
					
					if(!info.hasClass('hidden-cililian-btn') && !info.hasClass('show-cililian-btn')){
						var name = info.find('b').text();
						urlName.push(name);
						//console.log(name);

						info.find('a').each(function(j, val){
							if(j === 0){
								//console.log('种子' + ch(this).attr('href'))
								zz.push(ch(this).attr('href'));
							}
							else {
								//console.log('磁力' + ch(this).attr('href'))
								cili.push(ch(this).attr('href'));
							}
						});

						info.find('span').each(function(j, value){
							var spanInfo = ch(this);
							if(spanInfo.hasClass('label') && spanInfo.hasClass('label-warning'))	{
								var size = spanInfo.text();
								sizes.push(size);
								//console.log(size);
							}
							if(spanInfo.hasClass('label') && spanInfo.hasClass('label-danger')){
								var pixel = spanInfo.text();
								pixels.push(pixel);
								//console.log(pixel);
							}
						});
					}
				});
				
				for(var i = 0; i < urlName.length; i++){
					WriteInfo(gut, realName, urlName[i], zz[i], cili[i], sizes[i], pixels[i]);
				}
			}
		});
}

function WriteInfo(gut, realName, urlName, zz, cili, size, pixel)
{
	var content = '剧情：'+ gut + '\r\n电影名：' + realName + '-------------------\r\nurl名字：' + urlName + '\r\n种子：' + zz + '\r\n磁力：' + cili + '\r\n大小' + size + '\r\n清晰度：' + pixel + '\r\n\r\n';
	fs.writeFile('./testUrls.txt', content, { 'flag': 'a' }, function(err) {
		if (err) {
			console.log(err);
		}
	});
}

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
