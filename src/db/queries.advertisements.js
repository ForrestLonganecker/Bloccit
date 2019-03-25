const Advertisement = require("./models").Advertisement;

module.exports = {

    getAllAdvertisements(callback){
        return Advertisement.all()
        .then((advertisements) => {
            callback(null, advertisements);
        })
        .catch((err) => {
            callback(err);
        })
    }
}