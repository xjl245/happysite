//var testEmit = require('./testEmit');
var events = require('events'); 
var emitter = new events.EventEmitter(); 
var db = require('./mysql-pool');
var bagpipe = require('Bagpipe');
var request = require('request').defaults({jar: true});
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var fs = require('fs'); 

//var i = 0;
var arr = ['那年花开月正圆', '加勒比海盗', '变形金刚', '三生三世十里桃花', '老友记', '侠盗联盟', '高尔夫球手', '极寒之城', '黑暗塔'];
var data = [];
var length = 5; //每次取出的长度
var index = 0; //当前取出的id

var start = 0;
var bag = new bagpipe(2);
var cookies;

function GetData(){
	console.log('start-----------------------------------------------');
	var sql = 'select name from filmname limit ' + start + ',' + length;
	db.con(sql, function(err, rows){
		if(!err && rows.length === 0){
			console.log('over');
			return;
		}
		if(!err){
			console.log(rows);
			data = rows;
			emitter.emit('Collect');
		}	
		else if(err){
			console.log(err);
		}
		start += length;
	});
}

/* function GetData(){
	//先取100个
	//取完就通知开始收集
	//当全部取出后返回
	var j = 0;
	while(1){
		
		if(index >= arr.length){
			return;
		} 
		
		if(j < length){
			if(typeof(arr[index]) === 'undefined'){		
				emitter.emit('Collect');
				return;
			}
			if(typeof(arr[index + j]) === 'undefined'){
				j = length;
				continue;
			}
			
			data.push(arr[index + j]);
			console.log('index3:' + index);
			j++;
		}
		else{
			//console.log('emit Collect');
			//通知开始采集						
			//console.log(data);
			index += length;
			emitter.emit('Collect');
			return;
		}
	}
} */

function StartCollect()
{
	//console.log('collect');
	var i = 0;
	var timer = setInterval(function(){
        console.log(data[i++].name);//处理url采集
		if(i === data.length){
			clearInterval(timer);
			data = [];
			emitter.emit('Read');
		}		
    }, 3000);
}

function CollectDetailUrls(res){
	//1.取出第一层所有的url
	//2.循环第一层所有url取出对应种子信息
	console.log(data);
	var allUrls = [];
	var time = (Math.floor(Math.random()*5+5) + 1) * 1000;
	console.log(time);
	var i = 0;
	var timer = setInterval(function(){
		var nameEncode = encodeURI(data[i].name);
		var jsonBag = {url:'https://gaoqing.fm/s.php?q=' + nameEncode, encoding: null, headers: {
		  'User-Agent':'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)',
		  'Accept':'*/*',
		  'Referer':'https://www.baidu.com'
		}};
		
		request(jsonBag, GetDetailUrls(function(err, urls){
			i++;
			for(var k = 0; k < urls.length; k++){
				//console.log(urls[k]);
				allUrls.push(urls[k]);
			}
			if(i === data.length){
				//console.log(data.length);
				clearInterval(timer);
				data = [];				
				res(null, allUrls);
				emitter.emit('Read');
			}	
		}));
		
		
		//console.log('dddddddddddddddddddddddddd');
	}, time);
}

function GetDetailUrls(res)
{
	var allDetailUrls = [];
	return function(error, response, body){
				if (!error)
				{
					/* if(!cookies){
						cookies = response.headers['Set-Cookie'];
						console.log(cookies);
					} */
					var html = iconv.decode(body, 'utf8');
					WriteInfo(html);
					var ch = cheerio.load(html);
					AnalyzeHtml(ch, allDetailUrls, 'result1');
					AnalyzeHtml(ch, allDetailUrls, 'others');
					res(null, allDetailUrls);
				}
				else{
					console.log(error);					
					res(error);
				}	
			};
}

function AnalyzeHtml(ch, allDetailUrls, id){
	ch('#' + id).children('.row').each(function(i, elem){			
						var realName = ch(elem).children('.col-md-9').find('h4').text();
						var detailUrl = ch(elem).children('.x-m-side.col-md-3').find('a').attr('href');
						
						var type = 0;
						ch(elem).children('.col-md-9').find('#viewfilm').children('.x-m-label').each(function(j, elem1){
							if(ch(elem1).text() === '集数'){
								type = 1;
							}
						});						
						
						var urlInfo = {};
						urlInfo.realName = realName;
						urlInfo.url = detailUrl;
						urlInfo.type = type;
						allDetailUrls.push(urlInfo);
					});
}

function func(){
	//console.log('start');
	emitter.on('Collect', function(){
		//console.log('Collect');
		//StartCollect();
		CollectDetailUrls(function(err, urls){
			for(var i = 0; i < urls.length; i++){				
				console.log(urls[i]);
			}
		});
	});
	emitter.on('Read', function() {
		//console.log('Read');
		GetData();
	});
	GetData();
}

function WriteInfo(html)
{
	html += '\r\n\r\n\r\n'
	fs.writeFile('./testHtml.txt', html, { 'flag': 'a' }, function(err) {
		if (err) {
			console.log(err);
		}
	});
}

func();
