import path from "path";
import url from "url";

const currentDirPath = path.dirname(url.fileURLToPath(import.meta.url));

const domainsAndLogos = {
    "www.nytimes.com": null,
    "www.wsj.com": null
}

export default domainsAndLogos;

// Does not allow scraping:
// "www.washingtonpost.com": null,
