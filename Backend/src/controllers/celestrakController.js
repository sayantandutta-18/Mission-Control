const { fetchSatelliteData } = require("../services/celestrakService");
const { parseTLEData } = require("../services/tleParser");
const { syncSatellites } = require("../services/satelliteSyncService");
const getCelestrakSatellites = async (req, res) => {
    try {
        const data = await fetchSatelliteData();

        const parsedData = parseTLEData(data);

        await syncSatellites(parsedData);

        res.status(200).json({
            success: true,
            count: parsedData.length,
            data: parsedData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch satellite data",
            error: error.message
        });
    }
};

module.exports = {
    getCelestrakSatellites
};