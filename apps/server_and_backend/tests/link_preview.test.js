import LinkPreview from "../link_preview";
import puppeteer from 'puppeteer-extra';
import path from 'path';
import url from 'url'
import express from 'express'


const timeout = 9000;

describe('LinkPreview', () => {
    const currentDirPath = path.dirname(url.fileURLToPath(import.meta.url));
    const mockHtmlWebpagesDirPath = path.join(currentDirPath, '/webpages_for_testing');


    describe('Open Graph Protocol', () => {
        let browser;
        let page;
        let linkPreview;
        let server;

        beforeAll(async () => {
            const app = express();
            const port = 5000;
            const mockHtmlWebpagePath = path.join(mockHtmlWebpagesDirPath, '/nytimes-open_graph_protocol.html');

            app.get('/', (req, res) => {
                res.sendFile(mockHtmlWebpagePath);
            })

            server = app.listen(port);

            browser = await puppeteer.launch();
            page = await browser.newPage();
            await page.goto(`http://localhost:${port}/`);

            linkPreview = new LinkPreview();
        }, timeout)

        describe('getTitle', () => {
            test('returns expected title using the Open Graph Protocol', async () => {
                const ogTitle = await linkPreview.getTitle(page);
                const expectedTitle = 'OG Title: Farewell to the iPod';
                expect(ogTitle).toBe(expectedTitle);
            })
        })

        describe('getDescription', () => {
            test('returns expected description using the Open Graph Protocol', async () => {
                const ogDescription = await linkPreview.getDescription(page);
                const expectedDescription = 'OG Title: After nearly 22 years, Apple is stopping production of the devices that changed consumer electronics and led to the creation of the iPhone.';
                expect(ogDescription).toBe(expectedDescription);
            })
        })

        describe('getImg', () => {
            test('returns expected image using the Open Graph Protocol', async () => {
                const ogImg = await linkPreview.getImg(page);
                const expectedImg = 'https://static01.nyt.com/images/2022/05/11/business/10ipod/10ipod-facebookJumbo.jpg';
                expect(ogImg).toBe(expectedImg);
            })
        })


        describe('getDomainName', () => {
            test('returns expected domain using the Open Graph Protocol', async () => {
                const ogDomain = await linkPreview.getDomainName(page, 'http://localhost:5000/');
                const expectedDomain = 'www.nytimes.com';
                expect(ogDomain).toBe(expectedDomain);
            })
        })


        afterAll(async () => {
            await browser.close();
            server.close();
        })
    })


    describe('Twitter Card Tags via property', () => {
        let browser;
        let page;
        let linkPreview;
        let server;

        beforeAll(async () => {
            const app = express();
            const port = 5001;

            const mockHtmlWebpagePath = path.join(mockHtmlWebpagesDirPath, '/nytimes-twitter_card_tags_prop.html');

            app.get('/', (req, res) => {
                res.sendFile(mockHtmlWebpagePath);
            })

            server = app.listen(port);

            browser = await puppeteer.launch();
            page = await browser.newPage();
            await page.goto(`http://localhost:${port}/`);

            linkPreview = new LinkPreview();
        }, timeout)

        describe('getTitle', () => {
            test('returns expected title using the Twitter Card Tags', async () => {
                const twitterTitle = await linkPreview.getTitle(page);
                const expectedTitle = 'Twitter Card: Farewell to the iPod';
                expect(twitterTitle).toBe(expectedTitle);
            })
        })

        describe('getDescription', () => {
            test('returns expected description using the Twitter Card Tags', async () => {
                const twitterDescription = await linkPreview.getDescription(page);
                const expectedDescription = 'Twitter Card: After nearly 22 years, Apple is stopping production of the devices that changed consumer electronics and led to the creation of the iPhone.';
                expect(twitterDescription).toBe(expectedDescription);
            })
        })

        describe('getImg', () => {
            test('returns expected image using the Twitter Card Tags', async () => {
                const twitterImg = await linkPreview.getImg(page);
                const expectedImg = 'https://static01.nyt.com/images/2022/05/11/business/10ipod/10ipod-videoSixteenByNine3000.jpg';
                expect(twitterImg).toBe(expectedImg);
            })
        })

        describe('getDomainName', () => {
            test('returns expected domain using the Twitter Card Tags', async () => {
                const twitterDomain = await linkPreview.getDomainName(page, 'http://localhost:5001/');
                const expectedDomain = 'www.nytimes.com';
                expect(twitterDomain).toBe(expectedDomain);
            });
        })


        afterAll(async () => {
            await browser.close();
            server.close();
        })
    })


    describe('Twitter Card Tags via name', () => {
        let browser;
        let page;
        let linkPreview;
        let server;

        beforeAll(async () => {
            const app = express();
            const port = 5002;

            const mockHtmlWebpagePath = path.join(mockHtmlWebpagesDirPath, '/wsj-twitter_card_tags_name.html');

            app.get('/', (req, res) => {
                res.sendFile(mockHtmlWebpagePath);
            })

            server = app.listen(port);

            browser = await puppeteer.launch();
            page = await browser.newPage();
            await page.goto(`http://localhost:${port}/`);

            linkPreview = new LinkPreview();
        }, timeout)

        describe('getTitle', () => {
            test('returns expected title using the Twitter Card Tags', async () => {
                const twitterTitle = await linkPreview.getTitle(page);
                const expectedTitle = 'Twitter Card: Social-Media Regulations Expand Globally as Elon Musk Plans Twitter Takeover ';
                expect(twitterTitle).toBe(expectedTitle);
            }, 6000)
        })

        describe('getDescription', () => {
            test('returns expected description using the Twitter Card Tags', async () => {
                const twitterDescription = await linkPreview.getDescription(page);
                const expectedDescription = 'Twitter Card: Countries are taking more steps to compel social-media platforms to shield users from material they deem harmful, a trend that could test Elon Musk’s views on content moderation. ';
                expect(twitterDescription).toBe(expectedDescription);
            })
        })

        describe('getImg', () => {
            test('returns expected image using the Twitter Card Tags', async () => {
                const twitterImg = await linkPreview.getImg(page);
                const expectedImg = 'https://images.wsj.net/im-533390/social';
                expect(twitterImg).toBe(expectedImg);
            })
        })

        describe('getDomainName', () => {
            test('returns expected domain using the Twitter Card Tags', async () => {
                const twitterDomain = await linkPreview.getDomainName(page, 'http://localhost:5002/');
                const expectedDomain = 'www.wsj.com';
                expect(twitterDomain).toBe(expectedDomain);
            })
        })


        afterAll(async () => {
            await browser.close();
            server.close();
        })
    })


    describe('Other head meta data', () => {
        let browser;
        let page;
        let linkPreview;
        let server;

        beforeAll(async () => {
            const app = express();
            const port = 5003;

            const mockHtmlWebpagePath = path.join(mockHtmlWebpagesDirPath, '/nytimes-other_meta_data.html');

            app.get('/', (req, res) => {
                res.sendFile(mockHtmlWebpagePath);
            })

            server = app.listen(port);

            browser = await puppeteer.launch();
            page = await browser.newPage();
            await page.goto(`http://localhost:${port}/`);

            linkPreview = new LinkPreview();
        }, timeout)

        describe('getTitle', () => {
            test('returns expected title using the <title> element', async () => {
                const twitterTitle = await linkPreview.getTitle(page);
                const expectedTitle = 'Head title: Apple Stops Production of iPods, After Nearly 22 Years - The New York Times';
                expect(twitterTitle).toBe(expectedTitle);
            })
        })

        describe('getDescription', () => {
            test('returns expected description using the description meta data', async () => {
                const twitterDescription = await linkPreview.getDescription(page);
                const expectedDescription = 'Head description: After nearly 22 years, Apple is stopping production of the devices that changed consumer electronics and led to the creation of the iPhone.';
                expect(twitterDescription).toBe(expectedDescription);
            })
        })

        describe('getDomainName', () => {
            test('returns expected domain using the canonical property of the <link> element', async () => {
                const twitterDomain = await linkPreview.getDomainName(page, 'http://localhost:5003/');
                const expectedDomain = 'www.nytimes.com';
                expect(twitterDomain).toBe(expectedDomain);
            })
        })


        afterAll(async () => {
            await browser.close();
            server.close();
        })
    })


    describe('Elements', () => {
        let browser;
        let page;
        let linkPreview;
        let server;

        beforeAll(async () => {
            const app = express();
            const port = 5004;

            const mockHtmlWebpagePath = path.join(mockHtmlWebpagesDirPath, '/wsj-element_title.html');

            app.get('/', (req, res) => {
                res.sendFile(mockHtmlWebpagePath);
            })

            server = app.listen(port);

            browser = await puppeteer.launch();
            page = await browser.newPage();
            await page.goto(`http://localhost:${port}/`);

            linkPreview = new LinkPreview();
        }, timeout)

        describe('getTitle', () => {
            test('returns expected title using the <h1> element', async () => {
                const twitterTitle = await linkPreview.getTitle(page);
                const expectedTitle = 'Element h1: Social-Media Regulations Expand Globally as Elon Musk Plans Twitter Takeover';
                expect(twitterTitle).toBe(expectedTitle);
            })
        })

        describe('getImg', () => {
            test('returns expected image using the <img> element', async () => {
                const elementImg = await linkPreview.getImg(page);
                const expectedImg = 'https://images.wsj.net/im-539132?width=401';
                expect(elementImg).toBe(expectedImg);
            })
        })


        afterAll(async () => {
            await browser.close();
            server.close();
        })
    })
})