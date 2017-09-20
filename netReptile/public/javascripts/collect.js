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
    request({
        url: 'http://movie.5snow.com/dianying_y2017',
        encoding: null
    },function(error, response, body){
        if (!error) {
            var html = iconv.decode(body, 'utf8');
            var ch = cheerio.load(html);

            res(html);
        }
    });
};

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
