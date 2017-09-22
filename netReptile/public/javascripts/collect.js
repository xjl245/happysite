var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

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
		for(var i = 0; i < currentYearUrls.length; i++)
		{
			request({
			url:currentYearUrls[i],
			encoding: null
			},function(error, response, body){
				if (!error) {
					var html = iconv.decode(body, 'gbk');
					var ch = cheerio.load(html);
					
					var title = ch('.emTit').children().first().text();
					res(title);
				}
				else{
					res('collect film error');
				}
			});
		}
	});		
};
	
	
	//根据规律取得所有的url
	/*var filmUrls = [];
	
	var partUrl = 'http://dianying.2345.com/list/----2008---2.html';
	var partUrl1 = 'http://dianying.2345.com/list/----';
	var partUrl2 = '---';
	var partUrl3 = '.html';
	var currentYear = 2000;
	while(1)
	{
		if(currentYear == 2018)
		{
			break;
		}
		
		
		
		currentYear++;
	}
	
	
	//循环一步步采集
	var currentYear = 2000;
	while(1)
	{
		if(currentYear == 2018)
		{
			break;
		}
		
		request({
			url:'http://dianying.2345.com/list/----2013--.html',
			encoding: null
		},function(error, response, body){
			if (!error) {
				var html = iconv.decode(body, 'gbk');
				var ch = cheerio.load(html);

				res(html);
			}
		});
	}*/

exports.CollectWatchName = function (res) {
    request({
        url: 'http://movie.5snow.com/tv_y2017',
        encoding: null
    },function(error, response, body){
        if (!error) {
            var html = iconv.decode(body, 'utf8');
            var ch = cheerio.load(html);

            res(html);
        }
    });
};

function GetFilmMaxPage(currentYear, res)
{
	var dstUrl = 'http://dianying.2345.com/list/----' + currentYear + '--.html';
	
	request({
			url: dstUrl,
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

function CollectRes(res)
{
	return function(error, response, body){
				if (!error) {
					var html = iconv.decode(body, 'gbk');
					var ch = cheerio.load(html);
					
					var title = ch('.emTit').children().first().text();
					res(title);
				}
				else{
					res('collect film error');
				}
			};
};

