const axios = require("axios");

const fetchSatelliteData = async () => {
    try {
        const response = await axios.get(
            "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"
        );

        return response.data;

    } catch (error) {
        console.error(
            "Error fetching CelesTrak data:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    fetchSatelliteData
};