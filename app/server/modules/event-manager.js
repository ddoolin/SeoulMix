var database = require("../../database"),
    path = require("path"),
    fs = require("fs"),
    moment = require("moment"),

    events = db.collection("events"),
    users = db.collection("users"),
    that = this;

// Get events

exports.getEvents = function(callback) {
    events.find().toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

// Create event

exports.addEvent = function (data, callback) {
    var name = data.name,
        description = data.description;

    if (!name) {
        callback("empty-field", null);
    } else {

        // Set the creation date
        data.creationDate = moment()
            .format("dddd, MMMM Do YYYY, h:mm:ss a");

        data.user = getObjectId(data.user)

        events.insert(data, { safe: true }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result[0]);
            }
        });
    }
};

exports.updateEvent = function (data, callback) {

};

var getObjectId = function (id) {
    return events.db.bson_serializer.ObjectID.createFromHexString(id);
};