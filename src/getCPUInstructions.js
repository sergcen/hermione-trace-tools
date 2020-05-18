const fs = require('fs');

const { getPerfMarks } = require('./getPerfMarks');
const { getBrowserTrace } = require('./getBrowserTrace');

const defaultStartPerfSuffix = '_perf-start';
const defaultEndPerfSuffix = '_perf-end';

function getEventByPerfMark(trace, markName, eventName, options) {
    const perfs = getPerfMarks(trace, options);

    return trace.traceEvents.filter((item) => {
        const start = perfs[markName].start.ts;
        const end = perfs[markName].end.ts;
        const taskStart = item.ts;
        const taskEnd = item.ts + item.dur;

        return (
            item.name === eventName &&
            // check event bounds
            ((start >= taskStart && end <= taskEnd) ||
                (taskStart >= start && taskStart <= end) ||
                (taskEnd >= start && taskEnd <= end) ||
                (taskStart >= start && taskEnd <= end))
        );
    });
}

const makeMark = async (page, { startPerfSuffix, endPerfSuffix }, name, fn) => {
    const start = `${name}${startPerfSuffix}`;
    const end = `${name}${endPerfSuffix}`;

    await page.evaluate((start) => {
        window.performance.mark(start);
    }, start);
    await fn();
    await page.evaluate(
        (name, start, end) => {
            window.requestAnimationFrame(() => {
                window.performance.mark(end);
                window.performance.measure(name, start, end);
            });
        },
        name,
        start,
        end
    );
    await page.waitFor(1000);
};

function wrapAction(action, options) {
    return (page, ...args) => {
        return action(makeMark.bind(null, page, options), page, ...args);
    };
}

async function getCPUInstructions(
    browser,
    action,
    {
        categories = ['blink.user_timing', 'sequence_manager'],
        startPerfSuffix = defaultStartPerfSuffix,
        endPerfSuffix = defaultEndPerfSuffix,
        saveTraceToPath = null,
    } = {}
) {
    const traceData = await getBrowserTrace({
        browser,
        action: wrapAction(action, { startPerfSuffix, endPerfSuffix }),
        categories,
    });

    saveTraceToPath &&
        fs.writeFileSync(saveTraceToPath, JSON.stringify(traceData));

    const marks = getPerfMarks(traceData, { startPerfSuffix, endPerfSuffix });
    const res = Object.keys(marks).reduce((acc, key) => {
        const comps = getEventByPerfMark(traceData, key, 'compositor_tq', {
            startPerfSuffix,
            endPerfSuffix,
        });

        acc[key] = comps.reduce((r, v) => r + v.tidelta, 0);

        return acc;
    }, {});

    return res;
}

module.exports = {
    getPerfMarks,
    getBrowserTrace,
    getCPUInstructions,
    getEventByPerfMark,
};
