const puppeteer = require('puppeteer');

async function getTickets(destination, origin, date)  {
    const browser = await puppeteer.launch({headless: true, defaultViewport: null,
        args: ['--start-maximized']})
    const page = await browser.newPage();
    await page.goto('https://reiseauskunft.bahn.de/bin/query.exe/dn?tbpMode=1%20&date=%2B1&getstop=1&tariffTravellerType.1=Y');
    await page.setDefaultTimeout(3000);

    
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
        document.querySelector("body > div:nth-child(1)").shadowRoot.querySelector("#consent-layer > div.consent-layer__btn-container > button.btn.btn--secondary.js-accept-all-cookies").click()
    })

    await page.waitForSelector('#locS0');

    await page.$eval('#locS0', (el, v) => el.value = v, origin);
    await page.$eval('#locZ0', (el, v) => el.value = v, destination);
    await page.$eval('#REQ0JourneyDate', (el, v) => el.value = v, date);
    await page.$eval('#REQ0JourneyTime', el => el.value = '00:00');
    await page.waitForSelector('#searchConnectionButton');
    await page.click('#searchConnectionButton');

    //workaround
    try {
        await page.waitForSelector('#searchConnectionButton');
        await page.click('#searchConnectionButton');
    }
    catch (e) {
        //do nothing
    }


    await page.waitForSelector('.tbp_0');

    try {
        await page.waitForTimeout(3000);
        let result = await getDataFromBlocks(page);
        console.log(result);
        await browser.close();
        return result;
    } catch(e) {
        await browser.close();
        throw e;
    }


    async function getDataFromBlocks(page) {
        return await page.evaluate(() => {
            let arr = [];
            const blocks = document.querySelectorAll(".TBPcheap")

            if (!blocks) {
                return []
            }

            blocks.forEach(block => {
                let time = block.querySelector(".time").innerText;
                let duration = block.querySelector(".duration").innerText;
                let fare = block.querySelector(".fareOutput").innerText; ;
                let stops = block.querySelector(".changes").innerText;

                arr.push({
                    time: time.replaceAll('\n', '').replaceAll('|', ''),
                    duration: duration.replaceAll('|', '').replaceAll('\n', ''),
                    fare: fare == undefined ? 'kein' : fare.replaceAll('\n', '').replaceAll('|', ''),
                    stops: stops.replaceAll('\n', '').replaceAll('|', '')
                }) 
            })
            console.log(arr);
            return arr;
        })
    }
}

exports.getTickets = getTickets;
