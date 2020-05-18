# Hermione-trace-tools

usage:

```js
it(async function () {
    const cpuInsructions = await this.browser.getCPUInstructions(
        async (makeMark, page) => {
            await makeMark('div-render', async () => {
                return page.evaluate(() => {
                    document.body.appendChild(document.createElement('div'));
                });
            });
        }
    );

    console.log(cpuInsructions); // { 'div-render': 383692 }
});
```
