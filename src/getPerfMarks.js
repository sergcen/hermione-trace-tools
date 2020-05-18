function getPerfMarks({ traceEvents }, options) {
    const { startPerfSuffix, endPerfSuffix } = options;

    const startPattern = new RegExp(`${startPerfSuffix}$`);
    const endPattern = new RegExp(`${endPerfSuffix}$`);

    const result = {};

    for (let index = 0; index < traceEvents.length; index++) {
        const { name, ticount, ts } = traceEvents[index];

        if (startPattern.test(name)) {
            const nameNormalized = name.replace(startPattern, '');

            result[nameNormalized] = {
                start: { ticount, index, ts },
            };
            continue;
        }
        if (endPattern.test(name)) {
            const nameNormalized = name.replace(endPattern, '');

            if (!result[nameNormalized]) {
                throw Error(`${nameNormalized} start event not found`);
            }
            result[nameNormalized].end = { ticount, index, ts };
        }
    }

    return result;
}

module.exports = { getPerfMarks };
