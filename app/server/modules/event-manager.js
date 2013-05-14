var database = require("../../database"),
    ObjectID = require("mongodb").ObjectID,
    path = require("path"),
    fs = require("fs"),
    moment = require("moment"),

    events = db.collection("events"),
    users = db.collection("users"),
    that = this;

// Get events

exports.getEvents = function (req, res) {
    events.find(/*{}, { _id: 0 }*/).toArray(function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result);
    });
};

exports.getEvent = function (req, res) {
    events.findOne(
        { _id: ObjectID(req.param("id")) },
        { _id: 0 },
    function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result);
    });
};

exports.getUserEvents = function (req, res) {
    events.find(
        { user: req.param("id") },
        { _id: 0 }
    ).toArray(function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result);
    });
};

// Create event

exports.addEvent = function (req, res) {
    var data = {},
        user = req.session.user,
        name = req.param("name"),
        description = req.param("description"),
        location = req.param("location");

    if (!name) {
        res.send({"error": "Name cannot be blank"});
        return false;
    }

    if (!location) {
        res.send({"error": "Location cannot be blank"});
        return false;
    }

    // Set the creation date
    data.creationDate = moment()
        .format("dddd, MMMM Do YYYY, h:mm:ss a");

    data.user = user.user
    data.name = name;
    data.description = description;
    data.location = location;

    events.insert(data, { safe: true }, function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result[0]);
    });
};

exports.updateEvent = function (req, res) {

};