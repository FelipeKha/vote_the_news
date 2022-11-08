import fetch from 'node-fetch';
import getUrls from 'get-urls';
import isBase64 from 'is-base64';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';

import domainsAndLogos from './logos/domainsAndLogos.js';
import { DomainNotInWhiteListError } from "./errors.js";

class LinkPreview {
    constructor(executablePath) {
        this.executablePath = executablePath;
    }

    async linkPreview(
        uri,
        puppeteerArgs = [],
        puppeteerAgent = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        executablePath = this.executablePath
    ) {
        puppeteer.use(pluginStealth());

        const params = {
            headless: true,
            // args: [...puppeteerArgs]
            args: ['--no-sandbox']
        };

        if (executablePath) {
            params["executablePath"] = executablePath
        }

        // params["executablePath"] = process.env.PUPPETEER_EXECUTABLE_PATH;
        // params["executablePath"] = 'google-chrome-unstable';


        console.log("Puppeteer executable path: ", puppeteer.executablePath());

        const browser = await puppeteer.launch(params);
        const page = await browser.newPage();
        page.setUserAgent(puppeteerAgent)

        await page.goto(uri);
        // await page.exposeFunction("urlImageIsAccessible", this.urlImageIsAccessible);

        const obj = {};
        obj.domain = await this.getDomainName(page, uri);
        if (LinkPreview.checkDomainWhiteList(obj.domain)) {
            obj.title = await this.getTitle(page);
            obj.description = await this.getDescription(page);
            obj.img = await this.getImg(page, uri);
            await browser.close()
            return obj
        } else {
            await browser.close()
            throw new DomainNotInWhiteListError(`"${obj.domain}" not in the domain white list.`)
        }

    }

    async getTitle(page) {
        const title = await page.evaluate(() => {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle != null && ogTitle.content.length > 0) {
                return ogTitle.content;
            }
            const twitterNameTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterNameTitle != null && twitterNameTitle.content.length > 0) {
                return twitterNameTitle.content;
            }
            const twitterPropTitle = document.querySelector('meta[property="twitter:title"]');
            if (twitterPropTitle != null && twitterPropTitle.content.length > 0) {
                return twitterPropTitle.content;
            }
            const docTitle = document.title;
            if (docTitle != null && docTitle.length > 0) {
                return docTitle;
            }
            const h1El = document.querySelector('h1');
            const h1 = h1El ? h1El.innerHTML : null;
            if (h1 != null && h1.length > 0) {
                return h1;
            }
            const h2El = document.querySelector('h2');
            const h2 = h2El ? h2El.innerHTML : null;
            if (h2 != null && h2.length > 0) {
                return h2;
            }
            return null;
        });
        return title;
    }

    async getDescription(page) {
        const description = await page.evaluate(() => {
            const ogDescription = document.querySelector(
                'meta[property="og:description"]'
            );
            if (ogDescription != null && ogDescription.content.length > 0) {
                return ogDescription.content;
            }
            const twitterNameDescription = document.querySelector(
                'meta[name="twitter:description"]'
            );
            if (twitterNameDescription != null && twitterNameDescription.content.length > 0) {
                return twitterNameDescription.content;
            }
            const twitterPropDescription = document.querySelector(
                'meta[property="twitter:description"]'
            );
            if (twitterPropDescription != null && twitterPropDescription.content.length > 0) {
                return twitterPropDescription.content;
            }
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription != null && metaDescription.content.length > 0) {
                return metaDescription.content
            }
            // let paragraphs = document.querySelectorAll('p');
            // let fstVisibleParagraph = null;
            // for (let i = 0; i < paragraphs.length; i++) {
            //     if (paragraphs[i].offsetParent !== null && !paragraphs[i].childElementCount != 0) {
            //         fstVisibleParagraph = paragraphs[i].textContent;
            //         break;
            //     }
            // }
            // return fstVisibleParagraph
        });
        return description;
    }

    async getImg(page, uri) {
        await page.exposeFunction("urlImageIsAccessible", this.urlImageIsAccessible);
        const img = await page.evaluate(async () => {
            const ogImg = document.querySelector('meta[property="og:image"]');
            if (
                ogImg != null &&
                ogImg.content.length > 0 &&
                (await window.urlImageIsAccessible(ogImg.content))
            ) {
                return ogImg.content;
            }
            const imgRelLink = document.querySelector('link[rel="image_src"]');
            if (
                imgRelLink != null &&
                imgRelLink.href.length > 0 &&
                (await window.urlImageIsAccessible(imgRelLink.href))
            ) {
                return imgRelLink.href;
            }
            const twitterNameImg = document.querySelector('meta[name="twitter:image"]');
            if (
                twitterNameImg != null &&
                twitterNameImg.content.length > 0 &&
                (await window.urlImageIsAccessible(twitterNameImg.content))
            ) {
                return twitterNameImg.content;
            }
            const twitterPropImg = document.querySelector('meta[property="twitter:image"]');
            if (
                twitterPropImg != null &&
                twitterPropImg.content.length > 0 &&
                (await window.urlImageIsAccessible(twitterPropImg.content))
            ) {
                return twitterPropImg.content;
            }
            let imgs = Array.from(document.getElementsByTagName("img"));
            if (imgs.length > 0) {
                imgs = imgs.filter((img) => {
                    let addImg = true;
                    if (img.naturalWidth > img.naturalHeight) {
                        if (img.naturalWidth / img.naturalHeight > 3) {
                            addImg = false;
                        }
                    } else {
                        if (img.naturalHeight / img.naturalWidth > 3) {
                            addImg = false;
                        }
                    }
                    if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
                        addImg = false;
                    }
                    return addImg
                });
                if (imgs.length > 0) {
                    imgs.forEach((img) =>
                        img.src.indexOf("//") === -1
                            ? (img.src = `${new URL(uri).origin}/${img.src}`)
                            : img.src
                    );
                    return imgs[0].src;
                }
            }
            return null;
        });
        return img;
    }

    async urlImageIsAccessible(url) {
        const correctedUrls = getUrls(url);
        if (isBase64(url, { allowMime: true })) {
            return true;
        }
        if (correctedUrls.size !== 0) {
            const urlResponse = await fetch(correctedUrls.values().next().value);
            const contentType = urlResponse.headers.get('content-type');
            return new RegExp("image/*").test(contentType);
        }
    }

    async getDomainName(page, uri) {
        const domainName = await page.evaluate(() => {
            const canonicalLink = document.querySelector("link[rel=canonical]");
            if (canonicalLink != null && canonicalLink.href.length > 0) {
                return canonicalLink.href
            }
            const ogUrlMeta = document.querySelector('meta[property="og:url"]');
            if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
                return ogUrlMeta.content;
            }
            const twitterNameUrlMeta = document.querySelector('meta[name="twitter:url"]');
            if (twitterNameUrlMeta != null && twitterNameUrlMeta.content.length > 0) {
                return twitterNameUrlMeta.content;
            }
            const twitterPropUrlMeta = document.querySelector('meta[property="twitter:url"]');
            if (twitterPropUrlMeta != null && twitterPropUrlMeta.content.length > 0) {
                return twitterPropUrlMeta.content;
            }
            return null;
        });
        return domainName != null ? new URL(domainName).hostname : new URL(uri).hostname;
    }

    static checkDomainWhiteList(domain) {
        const domainLower = domain.toLowerCase();
        return domainsAndLogos.hasOwnProperty(domainLower);
    }
}




export default LinkPreview;

// const targetArticleURL = 'https://www.nytimes.com/2022/04/06/technology/online-tracking-privacy.html';
// const linkPreview = new LinkPreview();
// console.log(await linkPreview.linkPreview(targetArticleURL));
// console.log(await linkPreview.urlImageIsAccessible('https://static01.nyt.com/images/2022/05/11/business/10ipod/10ipod-facebookJumbo.jpg'));
// const targetArticleURL = 'http://localhost:5000/';
// const linkPreview = new LinkPreview();
// console.log(await linkPreview.linkPreview(targetArticleURL));
// const imgUrl = 'https://static01.nyt.com/images/2022/05/11/business/10ipod/10ipod-videoSixteenByNine3000.jpg'
// const imgUrl = 'https://static01.nyt.com/images/2022/05/11/business/10ipod/10ipod-articleLarge.jpg?quality=75&auto=webp&disable=upscale'
// console.log(await linkPreview.urlImageIsAccessible(imgUrl));

// console.log(LinkPreview.checkDomainWhiteList("www.nytimes.com"));