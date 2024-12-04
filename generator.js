var userAgent;
var defaultl = 65536;
var default1 = false;
var default2 = 6291456;
var default3 = 262144;

function getUserAgentandSetupSett() {
    try {
        const osList = ['Windows NT 10.0; Win64; x64', 'Macintosh; Intel Mac OS X 11_2_3', 'iPhone; CPU iPhone OS 14_4 like Mac OS X'];
        const browserVersion = Math.floor(Math.random() * (122 - 106 + 1)) + 106;
        const osName = osList[Math.floor(Math.random() * osList.length)];
        userAgent = `Mozilla/5.0 (${osName}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`;

        if (browserVersion == 122) {
            defaultl = 655366;
            default1 = false;
            default2 = 62914562;
            default3 = 2621442;
        } else if (browserVersion == 121) {
            defaultl = 655361;
            default1 = false;
            default2 = 62914561;
            default3 = 2621441;
        } else if (browserVersion == 120) {
            defaultl = 655360;
            default1 = false;
            default2 = 62914560;
            default3 = 2621440;
        } else if (browserVersion == 119) {
            defaultl = 655369;
            default1 = false;
            default2 = 62914569;
            default3 = 2621449;
        } else if (browserVersion == 118) {
            defaultl = 655368;
            default1 = false;
            default2 = 62914568;
            default3 = 2621448;
        } else if (browserVersion == 117) {
            defaultl = 655367;
            default1 = false;
            default2 = 62914567;
            default3 = 2621447;
        } else if (browserVersion == 116) {
            defaultl = 655366;
            default1 = false;
            default2 = 62914566;
            default3 = 2621446;
        } else if (browserVersion == 115) {
            defaultl = 655365;
            default1 = false;
            default2 = 62914565;
            default3 = 2621445;
        } else if (browserVersion == 114) {
            defaultl = 655364;
            default1 = false;
            default2 = 62914564;
            default3 = 2621444;
        } else if (browserVersion == 113) {
            defaultl = 655363;
            default1 = false;
            default2 = 62914563;
            default3 = 2621443;
        } else if (browserVersion == 112) {
            defaultl = 655362;
            default1 = false;
            default2 = 62914562;
            default3 = 2621442;
        } else if (browserVersion == 111) {
            defaultl = 655361;
            default1 = false;
            default2 = 62914561;
            default3 = 2621441;
        } else if (browserVersion == 110) {
            defaultl = 655360;
            default1 = false;
            default2 = 62914560;
            default3 = 2621440;
        } else if (browserVersion == 109) {
            defaultl = 655369;
            default1 = false;
            default2 = 62914569;
            default3 = 2621449;
        } else if (browserVersion == 108) {
            defaultl = 655368;
            default1 = false;
            default2 = 62914568;
            default3 = 2621448;
        } else if (browserVersion == 107) {
            defaultl = 655367;
            default1 = false;
            default2 = 62914567;
            default3 = 2621447;
        } else if (browserVersion == 106) {
            defaultl = 655366;
            default1 = false;
            default2 = 62914566;
            default3 = 2621446;
        }

        return { userAgent, defaultl, default1, default2, default3 };

    } catch (err) {
        console.log(err);
    }
}


function getSettings() {
    try {
        const settings = getUserAgentandSetupSett();
        return settings;
    } catch (err) {
        console.log(err);
    }
}

const getRandomHeader = (headerValues) => {
    return headerValues[Math.floor(Math.random() * headerValues.length)];
};

const getRandomString = (length) => {
    const pizda4 = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * pizda4.length);
        result += pizda4[randomIndex];
    }
    return result;
};

function getHeaders(parsed) {
    try {
        const settings = getSettings();
        const randnumbv1 = Math.floor(Math.random() * (101 - 8 + 1)) + 8;
        const randnumb = Math.floor(Math.random() * (122 - 120 + 1)) + 120;

        const header = {
            ':method': 'GET',
            ':authority': parsed.host,
            ':scheme': 'https',
            ':path': parsed.path,
            'sec-ch-ua': `\\"Not_A Brand\\";v=\\"${randnumbv1}\\", \\"Chromium\\";v=\\"${randnumb}\\", \\"Google Chrome\\";v=\\"${randnumb}\\"`,
            'sec-ch-ua-mobile': getRandomHeader(['?0', '?1', '?2', '?3', '?4', '?5', '?6', '?7', '?8', '?9']),
            'sec-ch-ua-platform': getRandomHeader(['Windows', 'Linux', 'MacOS']),
            'upgrade-insecure-requests': getRandomHeader(['0', '1']),
            'user-agent': settings.userAgent,
            'accept': getRandomHeader([
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'text/html,application/xhtml+xml,application/xml;q=0.8,image/webp,*/*;q=0.5',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            ]),
            ...(Math.random() < 0.5 && { 'sec-fetch-site': getRandomHeader(['none', 'same-origin', 'cross-site']) }),
            ...(Math.random() < 0.5 && { 'sec-fetch-mode': getRandomHeader(['navigate', 'cors', 'no-cors', 'same-origin']) }),
            ...(Math.random() < 0.5 && { 'sec-fetch-user': getRandomHeader(['?0', '?1', '?2', '?3', '?4', '?5', '?6', '?7', '?8', '?9']) }),
            ...(Math.random() < 0.5 && { 'sec-fetch-dest': getRandomHeader(['document', 'empty', 'audio', 'font', 'image', 'manifest', 'object', 'script', 'serviceworker', 'sharedworker', 'style', 'track', 'video', 'worker', 'xslt']) }),
            'accept-encoding': getRandomHeader(['gzip', 'deflate', 'br', 'identity']),
            'accept-language': getRandomHeader(['ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7', 'en-US;q=0.8,en;q=0.7']),
        };

        const kolvoheaders = Math.floor(Math.random() * (35 - 3 + 3)) + 3
        for (let i = 0; i < kolvoheaders; i++) {
            let pornohub = getRandomHeader(['gzip', 'deflate', 'br', 'identity', 'document', 'empty',
                'audio', 'font', 'image', 'manifest', 'object', 'script', 'serviceworker', 'sharedworker',
                'style', 'track', 'video', 'worker', 'xslt', 'navigate', 'cors', 'no-cors', 'same-origin',
                'Windows', 'Linux', 'MacOS',
            ]);
            if (Math.random() < 0.5) {
                header[`${getRandomString(8)}`] = `${pornohub}`;
            }
            if (Math.random() < 0.5) {
                header[`${pornohub}`] = `${getRandomString(8)}`;
            }
        }

        return { header, settings };
    } catch (err) {
        console.log(err);
    }
}

module.exports = { getHeaders };