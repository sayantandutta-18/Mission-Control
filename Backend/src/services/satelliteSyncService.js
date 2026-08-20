const Satellite = require("../models/Satellite");

const syncSatellites = async (satellites) => {
    try {
        for (const satellite of satellites) {

            await Satellite.findOneAndUpdate(
                { noradId: satellite.noradId },

                {
                    name: satellite.name,
                    noradId: satellite.noradId,
                    tleLine1: satellite.tleLine1,
                    tleLine2: satellite.tleLine2
                },

                {
                    new: true,
                    upsert: true
                }
            );
        }

        return true;

    } catch (error) {
        console.error("Satellite sync failed:", error.message);
        throw error;
    }
};

module.exports = {
    syncSatellites
};