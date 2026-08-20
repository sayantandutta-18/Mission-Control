const parseTLEData = (rawData) => {
    const lines = rawData
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const satellites = [];

    for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i];
        const tleLine1 = lines[i + 1];
        const tleLine2 = lines[i + 2];

        if (!name || !tleLine1 || !tleLine2) {
            continue;
        }

        satellites.push({
            name,
            noradId: Number(tleLine1.substring(2, 7).trim()),
            tleLine1,
            tleLine2
        });
    }

    return satellites;
};

module.exports = {
    parseTLEData
};