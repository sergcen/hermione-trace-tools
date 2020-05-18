const numberFormatter = new Intl.NumberFormat('en-EN');

function assertWithDeviation(value, expected, percentDeviation = 1) {
    const diff = (value / 100) * percentDeviation;

    if (value > expected + diff || value < expected - diff) {
        throw Error(
            `Assert error: expected ${numberFormatter.format(
                expected
            )}, got: ${numberFormatter.format(value)} (${value})`
        );
    }
}

module.exports = {
    assertWithDeviation,
};
