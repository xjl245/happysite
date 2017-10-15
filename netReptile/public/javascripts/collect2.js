//var testEmit = require('./testEmit');
var events = require('events'); 
var emitter = new events.EventEmitter(); 

//var i = 0;
var arr = ['那年花开月正圆', '加勒比海盗', '变形金刚', '三生三世十里桃花', '老友记'];
var data = [];
var length = 2; //每次取出的长度
var index = 0; //当前取出的id

function GetData(){
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
}

function StartCollect()
{
	//console.log('collect');
	var i = 0;
	var timer = setInterval(function(){
        console.log(data[i++]);//处理url采集
		if(i === data.length){
			clearInterval(timer);
			data = [];
			emitter.emit('Read');
		}		
    }, 3000);
}

function func(){
	//console.log('start');
	emitter.on('Collect', function(){
		//console.log('Collect');
		StartCollect();
	});
	emitter.on('Read', function() {
		//console.log('Read');
		GetData();
	});
	GetData();
}

func();

/* testEmit.SetFuncInterval(3000);

function func()
{
	//i++;
	console.log(arr[i++]);
	if(i == 2){
		testEmit.ClearFuncInterval();
	}
	
}

testEmit.ExecFunc(func); */