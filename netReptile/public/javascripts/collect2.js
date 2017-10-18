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
//var data = [];
var length = 1; //每次取出的长度
var index = 0; //当前取出的id

var start = 0;
var bag = new bagpipe(2);
var cookies;

function GetData(res){
	console.log('start-----------------------------------------------');
	var sql = 'select distinct name from filmname1 limit ' + start + ',' + length;//先匹配distinct再匹配limit
	db.con(sql, function(err, rows){
		if(!err && rows.length === 0){
			console.log('over');
			return;
		}
		if(!err){
			//console.log(rows);
			res(null, rows);
		}	
		else if(err){
			console.log('err end----------------------');
			res(err);
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
/* 	//console.log('collect');
	var i = 0;
	var timer = setInterval(function(){
        console.log(data[i++].name);//处理url采集
		if(i === data.length){
			clearInterval(timer);
			data = [];
			emitter.emit('Read');
		}		
    }, 3000); */
}

function CollectDetailUrls(data, res){
	//1.取出第一层所有的url
	//2.循环第一层所有url取出对应种子信息
	console.log(data);
	var allUrls = [];
	var time = (Math.floor(Math.random()*2 + 1) + 1) * 1000;
	console.log(time);
	var i = 0;
	var state = 'free';
	
	var timer = setInterval(function(){
		console.log('CollectDetailUrls:' + i);
		var nameEncode = encodeURI(data[i].name);	
		var jsonBag = {url:'https://gaoqing.fm/s.php?q=' + nameEncode, encoding: null, timeout: time * 3, headers: {
		  'User-Agent':'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)',
		  'Accept':'*/*',
		  'Referer':'https://www.baidu.com'
		}};	
		
		if(state === 'free'){
			state = 'padding';
			request(jsonBag, GetDetailUrls(function(err, urls){
				if(err){
					console.log('Get Urls: ' + err);					
				}
				else{				
					for(var k = 0; k < urls.length; k++){
						//console.log(urls[k]);
						allUrls.push(urls[k]);
					}
					i++;
					if(i === data.length){
						//console.log(data.length);
						clearInterval(timer);
						//data = [];				
						res(null, allUrls);				
					}
				}
				state = 'free';
			}));
		}
		
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
					//WriteInfo(html);
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

function GetInfos(urls, res){
	if(urls.length === 0){
		emitter.emit('Read');
	}
	console.log(urls);
	var allInfos = [];
	var time = (Math.floor(Math.random()* 5 + 2) + 1) * 1000;
	var i = 0;
	//var j = 0;
	var state = 'free';
	var timer = setInterval(function(){
		console.log('GetInfos: ' + i);
		var jsonBag = {url : urls[i].url, encoding: null, timeout: time * 3, headers: {
		  'User-Agent':'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)',
		  'Accept':'*/*'
		}};
		
		console.log(state);
		if(state === 'free'){			
			state = 'padding';
			request(jsonBag, GetInfo(function(err, gut, infos){	
				
				if(err){
					console.log('Get Deatils: ' + err);
					console.log(err.connect === true);
					//state = 'free';	
					//return;
				}
				else{
					//此处当前面一个url还未采集完，定时时间已经到下面一个，i的值已经等于urls.length 会少采集
					allInfos.push({realName:urls[i].realName, gut:gut, infos:infos, type: urls[i].type});
					i++;
					if(i === urls.length){
						clearInterval(timer);			
						res(null, allInfos);
						//emitter.emit('Read');
					}
					//state = 'free';		
				}	
				state = 'free';					
			}));	
		}		
	}, time);
}

function GetInfo(res){
	return function(error, response, body){
		console.log('GetInfo');
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

					ch(elem).find('a').each(function(j, val){
						if(j === 0){
							info.zz = ch(val).attr('href');
						}
						else {
							info.cili = ch(val).attr('href')
						}
					});

					ch(elem).find('span').each(function(j, value){
						var spanInfo = ch(value);
						if(spanInfo.hasClass('label') && spanInfo.hasClass('label-warning'))	{
							info.size = spanInfo.text();
						}
						if(spanInfo.hasClass('label') && spanInfo.hasClass('label-danger')){
							info.pixel = spanInfo.text();
						}
					});
				}
				infos.push(info);
			});
			res(null, gut, infos)
		}
		else{
			res(error);
		}
	};
}

function func(){
	emitter.on('Collect', function(data){
		CollectDetailUrls(data, function(err, urls){				
			emitter.emit('details', urls);
		});
	});
	
	emitter.on('Read', function() {
		GetData(function(err, data){		
			emitter.emit('Collect', data);
		});
	});
	
	emitter.on('details', function(urls){
		//console.log('details:  '+ urls[2].realName);
		GetInfos(urls, function(err, allInfos){
			for(var i = 0; i < allInfos.length; i++){
				console.log(allInfos[i].realName);
			}
			emitter.emit('Read');
		});
	});
	
	GetData(function(err, data){	
		emitter.emit('Collect', data);
	});
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
