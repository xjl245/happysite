var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var fs = require('fs');
var bagpipe = require('Bagpipe');

exports.CollectFilmInfo = function (res) {
    //此处电影名从数据库中读来
    var searchName = encodeURI('加勒比海盗');
    request({
        url: 'https://gaoqing.fm/s.php?q=' + searchName,
        encoding: null
    },function(error, response, body){
        if (!error) {
            var html = iconv.decode(body, 'utf8');
            var ch = cheerio.load(html);

            res(html);
        }
    });
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
			/*request({
				url:currentYearUrls[i],
				encoding: null
				},CollectName()
			);*/
			
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

function collectFilmName()
{
	return CollectName('.emTit', './testFilm.txt');
}

function collectWatchName()
{
	return CollectName('.sTit', './testWatch.txt');
}

function CollectName(className, filePath)
{
	return function(error, response, body){
				if (!error)
				{
					var html = iconv.decode(body, 'gbk');
					var ch = cheerio.load(html);
					
					ch(className).each(function(i, elem){
						var title = ch(this).children().first().text();
						
						fs.writeFile(filePath, title + '\r\n', { 'flag': 'a' }, function(err) {
							if (err) {
								console.log(err);
							}
						});
					});
				}
				else{
				}
			};
};