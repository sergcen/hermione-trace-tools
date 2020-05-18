'use strict';
const { getCPUInstructions } = require('./getCPUInstructions');

module.exports = (hermione, opts) => {
    const config = opts;
    if (!config.enabled) {
        return;
    }

    hermione.on(hermione.events.NEW_BROWSER, function (browser) {
        browser.addCommand('getCPUInstructions', async function (
            action,
            options
        ) {
            if (!this.puppeteer) {
                throw Error(
                    'Plugin must be used with Hermione-puppeter plugin'
                );
            }

            const browser = await this.puppeteer();

            return getCPUInstructions(browser, action, options);
        });
    });
};
