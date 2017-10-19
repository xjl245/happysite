var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next){
	var json = {};
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
	json.infos = infos;  
	
	
    var films = [
        {
            filmTitle:"加勒比海盗5：死无对证 Pirates of the Caribbean: Dead Men Tell No Tales",
            state: "1223",
            id: "2"
        },
        {
            filmTitle:"加勒比海盗2（电视剧）",
            state:"剧情简介：广袤的中华大地，数不胜数的美丽生灵与人类共生，谱写一曲曲壮美的生命之歌。生活在高原地带的雪豹达娃不久前刚刚成为两个小家伙的妈妈，为了抚养孩子长大，她不仅要一次次出击捕猎，还要面对来自强劲对手的挑战。四川某处的茂密竹林中，大熊猫丫丫正和女儿美美快乐玩耍，美美对世界充满好奇，渴望尽早挣脱妈妈的束缚去拥抱未知的世界。神农架的原始丛林里，小金丝猴淘淘倍感落寞，因为新出生的妹妹夺走了本该属于他的关爱，于是淘淘离开家人，成为了流浪猴中的一员，却必须面对种种残酷的现实。可可西里的荒原上，母藏羚羊和丈夫们告别，成群结队赶往某个圣地，迎接新生命的到来。而另一边，仙鹤在长空中翱翔，带走一个又一个结束了生命之旅的灵魂，展开下一段充满未知的轮回……",
            id: "2"
        },
        /*{
            filmTitle:"加勒比海盗3",
            state:"剧情简介：广袤的中华大地，数不胜数的美丽生灵与人类共生，谱写一曲曲壮美的生命之歌。生活在高原地带的雪豹达娃不久前刚刚成为两个小家伙的妈妈，为了抚养孩子长大，她不仅要一次次出击捕猎，还要面对来自强劲对手的挑战。四川某处的茂密竹林中，大熊猫丫丫正和女儿美美快乐玩耍，美美对世界充满好奇，渴望尽早挣脱妈妈的束缚去拥抱未知的世界。神农架的原始丛林里，小金丝猴淘淘倍感落寞，因为新出生的妹妹夺走了本该属于他的关爱，于是淘淘离开家人，成为了流浪猴中的一员，却必须面对种种残酷的现实。可可西里的荒原上，母藏羚羊和丈夫们告别，成群结队赶往某个圣地，迎接新生命的到来。而另一边，仙鹤在长空中翱翔，带走一个又一个结束了生命之旅的灵魂，展开下一段充满未知的轮回……",
            id: "3"
        },
        {
            filmTitle:"加勒比海盗4",
            state:"剧情简介：广袤的中华大地，数不胜数的美丽生灵与人类共生，谱写一曲曲壮美的生命之歌。生活在高原地带的雪豹达娃不久前刚刚成为两个小家伙的妈妈，为了抚养孩子长大，她不仅要一次次出击捕猎，还要面对来自强劲对手的挑战。四川某处的茂密竹林中，大熊猫丫丫正和女儿美美快乐玩耍，美美对世界充满好奇，渴望尽早挣脱妈妈的束缚去拥抱未知的世界。神农架的原始丛林里，小金丝猴淘淘倍感落寞，因为新出生的妹妹夺走了本该属于他的关爱，于是淘淘离开家人，成为了流浪猴中的一员，却必须面对种种残酷的现实。可可西里的荒原上，母藏羚羊和丈夫们告别，成群结队赶往某个圣地，迎接新生命的到来。而另一边，仙鹤在长空中翱翔，带走一个又一个结束了生命之旅的灵魂，展开下一段充满未知的轮回……",
            id: "4"
        },
        {
            filmTitle:"加勒比海盗5",
            state:"剧情简介：广袤的中华大地，数不胜数的美丽生灵与人类共生，谱写一曲曲壮美的生命之歌。生活在高原地带的雪豹达娃不久前刚刚成为两个小家伙的妈妈，为了抚养孩子长大，她不仅要一次次出击捕猎，还要面对来自强劲对手的挑战。四川某处的茂密竹林中，大熊猫丫丫正和女儿美美快乐玩耍，美美对世界充满好奇，渴望尽早挣脱妈妈的束缚去拥抱未知的世界。神农架的原始丛林里，小金丝猴淘淘倍感落寞，因为新出生的妹妹夺走了本该属于他的关爱，于是淘淘离开家人，成为了流浪猴中的一员，却必须面对种种残酷的现实。可可西里的荒原上，母藏羚羊和丈夫们告别，成群结队赶往某个圣地，迎接新生命的到来。而另一边，仙鹤在长空中翱翔，带走一个又一个结束了生命之旅的灵魂，展开下一段充满未知的轮回……",
            id: "5"
        }*/
    ];
    var filmList = [
        {
            sourceTitle:"Born.In.China.2016.1080p.BluRay.x264-RedBlade[rarbg]" ,
            size:"12.3G",
            clarity:"1080P",
            torrent:"www.baidu.com",
            magnetic:"www.baidu.com",
            isOwner:true
        },
        {
            sourceTitle:"Born.In.China.2016.1080p.BluRay.x264-RedBlade[rarbg]" ,
            size:"12.3G",
            clarity:"1080P",
            torrent:"www.baidu.com",
            magnetic:"www.baidu.com",
            isOwner:true
        },
        {
            sourceTitle:"Born.In.China.2016.1080p.BluRay.x264-RedBlade[rarbg]" ,
            size:"12.3G",
            clarity:"枪版",
            torrent:"https://gaoqing.fm/torrent.php?btname=Born.In.China.2016.1080p.BluRay.x264-RedBlade[rarbg]&bthash=QyTaAn2gQzzhYo4nMgTxdiFaOnEMzNzk4OUY1NDdERjQ0QURFRDc5QzBGQTc5M0RBQwO0O0OO0O0O",
            magnetic:"http://www.baidu.com",
            isOwner:true
        },
        {
            sourceTitle:"加勒比海盗1" ,
            size:"未知",
            clarity:"720p",
            isOwner:false
        },
    ];
	
    res.render('recommend', { title: 'Express',  films: films, filmList: filmList});
});

module.exports = router;