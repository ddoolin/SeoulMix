var database = require("../../database"),
	seoulmix = require("../../../seoulmix"),
	ObjectID = require("mongodb").ObjectID,
	path = require("path"),
	fs = require("fs"),
	cloudinary = require("cloudinary"),
	moment = require("moment"),

	events = db.collection("events"),
	users = db.collection("users"),
	that = this;

// Look-up

exports.getEventPage = function (req, res) {
	var eventId = ObjectID(req.param("id"));

	events.findOne({
		_id: eventId
	}, function (err, result) {
		// !result is probably enough but lets be explicit
		if (err || !result) {
			// Render something?
		} else {
			res.render("event", {
				user: req.session.user,
				event: result,
				cloudinary: cloudinary
			});
		}
	});
}

// Get events

exports.getEvents = function (req, res) {
	events.find({}, { /*_id: 0*/ }).toArray(function (err, result) {
		if (err) {
			res.send({"error": "An error has occured"});
			return false;
		}

		if (req.query["front"]) {
			result.forEach(function (item) {
				delete item.address;
				delete item.startTime;
				delete item.endTime;
			});

			res.send(result);
		} else {
			res.send(result);
		}
	});
};

exports.getEvent = function (req, res) {
	events.findOne(
		{ _id: ObjectID(req.param("id")) },
		{ /*_id: 0*/ },
	function (err, result) {
		if (err) {
			res.send({"error": "An error has occured"});
			return false;
		}

		res.send(result);
	});
};

exports.getUserEvents = function (req, res) {
	events.find(
		{ user: req.param("id") },
		{ /*_id: 0*/ }
	).toArray(function (err, result) {
		if (err) {
			res.send({"error": "An error has occured"});
			return false;
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
		address = req.param("address"),
		location = req.param("location"),
		startTime = new Date(req.param("startTime")),
		endTime = new Date(req.param("endTime")),
		now = new Date();

	// Validation
	if (!name) {
		res.send({"error": "Name cannot be blank"});
		return false;
	}

	if (!address || !location) {
		res.send({"error": "Location cannot be blank"});
		return false;
	}

	if (!startTime || !endTime) {
		res.send({"error": "Times cannot be blank"});
		return false;
	}

	if (startTime < now || endTime < now) {
		res.send({"error": "Times cannot be in the past"});
		return false;
	}

	if (startTime > endTime) {
		res.send({"error": "End time must come after start time"});
		return false;
	}

	if (!moment(startTime).isValid() || !moment(endTime).isValid()) {
		res.send({"error": "Invalid time"});
		return false;
	}

	data = {
		creationDate: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
		user: user.user,
		name: name,
		description: description,
		address: address,
		location: {
			lat: location[0],
			lng: location[1]
		},
		startTime: startTime,
		endTime: endTime
	};

	events.insert(data, { safe: true }, function (err, result) {
		if (err) {
			res.send({"error": "An error has occured"});
			return false;
		}

		res.send(result[0]);
	});
};

exports.updateEvent = function (req, res) {

};