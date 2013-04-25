var database = require("../../database"),

    events = db.collection("events");
    that = this;

// Create event

exports.addEvent = function (data, callback) {
    var name = data.name;

    if (!name) {
        callback("empty-field", null);
    } else {
        data.creationDate = moment
            .format("dddd, MMMM Do YYYY, h:mm:ss a");

        events.insert(data, { safe: true }, function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
};