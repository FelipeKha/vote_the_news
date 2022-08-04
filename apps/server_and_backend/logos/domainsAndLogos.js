import path from "path";
import url from "url";

const currentDirPath = path.dirname(url.fileURLToPath(import.meta.url));

const domainsAndLogos = {
    "www.nytimes.com": path.join(currentDirPath, "/nyTimesLogo.png")
}

export default domainsAndLogos;