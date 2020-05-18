const fs = require('fs');
const os = require('os');
const path = require('path');

const { promisify } = require('util');
const mkdtemp = promisify(fs.mkdtemp);

async function getBrowserTrace({ browser, action, categories }) {
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    const dir = await mkdtemp(path.join(os.tmpdir(), 'tracing-'));
    const tracePath = path.join(dir, 'browser-trace.json');

    await page.tracing.start({
        path: tracePath,
        categories,
    });
    await action(page, browser);
    await page.tracing.stop();

    return require(tracePath);
}

module.exports = {
    getBrowserTrace,
};
