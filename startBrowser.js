const puppeteer = require("puppeteer");

async function startBrowser(search_engine, query) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=en-US"],
    });

    const page = await browser.newPage();
    await page.goto(`https://${search_engine}.com/?q=${query}`);
    let newResult = {};
    newResult.search_parameters = {
        engine: search_engine,
        query: query,
        kl: "en-US",
    };
    newResult.search_information = { organic_results_state: "Results for exact spelling" };
    const finalResult = await page.evaluate(() => {
        let finalResult = {};
        const bottom = document.querySelector("#links .result--more a");
        bottom?.click();
        const ads = [];
        const ads_container = Array.from(document.querySelectorAll("#ads .nrn-react-div article"));
        ads_container.forEach((ad, index) => {
            let temp = {};
            temp.position = index + 1;
            if (ad.childElementCount > 3) {
                let sitelinks = [];
                temp.title = ad.querySelector("h2").innerText;
                temp.link = ad.querySelector("div div a").href;
                temp.source = ad.querySelector("div div a").innerText;
                let sitelinks_container = Array.from(ad.lastChild("div ul li a"));
                sitelinks_container.forEach((sitelink) => {
                    sitelinks.push({
                        title: sitelink.innerText,
                        link: sitelink.href,
                    });
                });
                temp.sitelinks = sitelinks;
            } else {
                let sitelinks = [];
                temp.title = ad.querySelector("h2").innerText;
                temp.link = ad.querySelector("div div a").href;
                temp.source = ad.querySelector("div div a").innerText;
                let sitelinks_container = Array.from(ad.querySelectorAll("div div a"));
                sitelinks_container.forEach((sitelink) => {
                    sitelinks.push({ title: sitelink.innerText, link: sitelink.href });
                });
                temp.sitelinks = sitelinks;
            }
            ads.push(temp);
        });

        const organic_results = [];
        const organic_results_divs = Array.from(document.querySelectorAll("#links .nrn-react-div article"));
        organic_results_divs.forEach(async (el, index) => {
            let temp = {};
            temp.position = index + 1;
            if (el.childElementCount > 3) {
                let sitelinks = [];
                let sitelinks_divs = Array.from(el.querySelectorAll("div ul li"));
                sitelinks_divs.forEach((siteElem) => {
                    sitelinks.push({
                        title: siteElem.querySelector("a").innerText,
                        link: siteElem.querySelector("a").href,
                        snippet: siteElem.querySelector("p").innerText,
                    });
                });
                temp.title = el.querySelector("div h2 a").innerText;
                temp.url = el.querySelector("div h2 a").href;
                temp.favicon = el.querySelector("div div span a img").src;
                temp.snippet = el.children[2].querySelector("div").lastChild.innerText;
                temp.sitelinks = sitelinks;
            } else {
                temp.title = el.querySelector("div h2 a").innerText;
                temp.url = el.querySelector("div h2 a").href;
                temp.favicon = el.querySelector("div div span a img").src;
                temp.snippet = el.lastChild.innerText;
            }

            organic_results.push(temp);
        });

        const related_searches = [];
        const related_searches_elements = document.querySelectorAll(".related-searches__lists ol li a");
        related_searches_elements.forEach((element) => {
            related_searches.push({ link: element.href, query: element.innerText });
        });

        finalResult.ads = ads;
        finalResult.organic_results = organic_results;
        finalResult.related_searches = related_searches;

        return finalResult;
    });

    await browser.close();
    newResult = { ...newResult, ...finalResult };
    return newResult;
}
exports.startBrowser = startBrowser;
