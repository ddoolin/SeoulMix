var MongoDB = require("mongodb").Db;
var Server = require("mongodb").Server;
var moment = require("moment");
var passHash = require("password-hash");

var dbPort = 27017;
var dbHost = "localhost";
var dbName = "seoulmix";

// DB Connection

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});

db.open(function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to database :: " + dbName);
	}
});

var users = db.collection("users");

// Login

exports.autoLogin = function(user, pass, callback) {
	users.findOne({
		user: user
	}, function(err, result) {
		if (result) {
			result.pass == pass ? callback(result) : callback(null);
		} else {
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback) {
	users.findOne({
		user: user
	}, function(err, result) {
		if (result == null) {
			callback("user-not-found");
		} else {
			if (passHash.verify(pass, result.pass)) {
				callback(null, result);
			} else {
				callback("invalid-password");
			}
		}
	});
}

// Account creation

exports.addNewAccount = function(data, callback) {;
	users.findOne({
		user: data.user
	}, function(err, result) {
		if (result) {
			callback("username-taken");
		} else {
			users.findOne({
				email: data.email
			}, function(err, result) {
				if (result) {
					callback("email-used");
				} else {
					data.pass = passHash.generate(data.pass, {
						algorithm: "sha512",
						saltLength: 16,
						iterations: 2
					});

					data.date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
					users.insert(data, {safe: true}, callback);
				}
			});
		}
	});
}

exports.updateAccount = function(data, callback) {
	users.findOne({
		user: data.user
	}, function(err, result) {
		result.user = data.user;
		result.email = data.email;
		result.name = data.name;

		if (data.pass == "") {
			users.save(result, {safe: true}, callback);
		} else {
			result.pass = passHash.generate(data.pass, {
				algorithm: "sha512",
				saltLength: 16,
				iterations: 2
			});

			users.save(result, {safe: true}, callback);
		}
	});
}

// Account lookup

exports.deleteAccount = function(id, callback) {
	users.remove({
		_id: getObjectId(id)
	}, callback);
}

exports.getAccountsByEmail = function(email, callback) {
	users.findOne({
		email: email
	}, function(err, result) {
		callback(result);
	});
}

exports.validateResetLink = function(email, passhash, callback) {
	users.find({
		$and: [{
			email: email,
			pass: passhash
		}]
	}, function(err, result) {
		callback(result ? "OK" : null);
	});
}

exports.getAllRecords = function(callback) {
	users.find().toArray(function(err, result) {
		if (err) {
			callback(err);
		} else {
			callback(null, result);
		}
	});
}

// Aux. methods

var getObjectId = function(id) {
	return users.db.bson_serializer.ObjectID.createFromHexString(id);
}

var findById = function(id, callback) {
	users.findOne({
		_id: getObjectId(id)
	}, function(err, result) {
		if (err) { 
			callback(err);
		} else {
			callback(null, result);
		}
	});
}

var findByMultipleFields = function(arr, callback) {
	users.find({
		$or: arr
	}).toArray(
		function(err, results) {
			if (err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
}