var MongoDB = require("mongodb").Db;
var Server = require("mongodb").Server;
var moment = require("moment");
var passHash = require("password-hash");

var dbPort = 27017;
var dbHost = "localhost";
var dbName = "seoulmix";

// DB Connection

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});

db.open(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to database :: " + dbName);
    }
});

var users = db.collection("users");

// Login

exports.autoLogin = function (user, pass, callback) {
    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            if (result.pass === pass) {
                
                var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                    data = {
                        lastLoginIp: ipAddress,
                        lastLoginDate: date
                    };

                users.findAndModify(
                    { user: user },
                    [["_id", "asc"]],
                    { $inc: { numLogins: 1 },
                      $set: data },
                    { new: true },
                    function (err, obj) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, obj);
                        }
                    }
                );

            } else {
                callback("incorrect-pass", null);
            }
        }
    });
};

exports.manualLogin = function (user, pass, ipAddress, callback) {
    users.findOne({
        user: user
    }, function (err, result) {
        if (result === null) {

            // First callback is an error
            callback("user-not-found", null);
        } else {

            // Hash the password provided and callback invalid if no match
            if (passHash.verify(pass, result.pass)) {

                var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                    data = {
                        lastLoginIp: ipAddress,
                        lastLoginDate: date
                    };

                users.findAndModify(
                    { user: user },
                    [["_id", "asc"]],
                    { $inc: { numLogins: 1 },
                      $set: data },
                    { new: true },
                    function (err, obj) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, obj);
                        }
                    }
                );

            } else {
                callback("invalid-password", null);
            }
        }
    });
};

// Account creation

exports.addNewAccount = function (data, callback) {
    users.findOne({
        user: data.user
    }, function (err, result) {
        if (result) {
            callback("username-taken", null);
        } else {
            users.findOne({
                email: data.email
            }, function (err, result) {
                if (result) {
                    callback("email-used", null);
                } else {

                    // Hash the password
                    data.pass = passHash.generate(data.pass, {
                        algorithm: "sha512",
                        saltLength: 16,
                        iterations: 2
                    });

                    // Set the registration date
                    data.registrationDate = moment()
                        .format("dddd, MMMM Do YYYY, h:mm:ss a");

                    // Set the number of logins to 0
                    data.numLogins = 0;

                    // Inset the data
                    users.insert(data, {safe: true}, function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result);
                        }
                    });
                }
            });
        }
    });
};

exports.updateAccount = function (data, callback) {

    // Separate in case of non-changed password
    // Names CAN BE removed
    var update = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email
    };

    if (data.pass === "") {
        users.findAndModify(
            { user: data.user },
            [["_id", "asc"]],
            { $set: update },
            { new: true },
            function (err, obj) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, obj);
                }
            }
        );

    } else {

        // Save new password to update object
        update.pass = passHash.generate(data.pass, {
            algorithm: "sha512",
            saltLength: 16,
            iterations: 2
        });

        users.findAndModify(
            { user: data.user },
            [["_id", "asc"]],
            { $set: update },
            { new: true },
            function (err, obj) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, obj);
                }
            }
        );
    }
};

exports.updatePassword = function (email, pass, callback) {

    // Pass the new password to be hashed
    var newpass = passHash.generate(pass, {
        algorithm: "sha512",
        saltLength: 16,
        iterations: 2
    });

    users.findAndModify(
        { email: email },
        [["_id", "asc"]],
        { $set: { pass: newpass } },
        { new: true },
        function(err, obj) {
            if (err) {
                callback(null, null);
                console.log(err, null);
            } else {
                callback(null, obj);
            }
        }
    );
}

exports.deleteAccount = function (id, pass, callback) {
    users.findOne({
        _id: getObjectId(id)
    }, function (err, result) {
        if (err) {
            callback("record-not-found", null);
        } else {
            if (passHash.verify(pass, result.pass)) {
                users.remove({
                    _id: getObjectId(id)
                }, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, result);
                    }
                });
            } else {
                callback("invalid-password", null);
            }
        }
    });
};

// Account lookup

exports.getAccountsByEmail = function (email, callback) {
    users.findOne({
        email: email
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
},

exports.validateResetLink = function (email, passhash, callback) {
    users.find({
        $and: [{
            email: email,
            pass: passhash
        }]
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
},

exports.getAllRecords = function (callback) {
    users.find().toArray(function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

// Aux. methods

var getObjectId = function (id) {
    return users.db.bson_serializer.ObjectID.createFromHexString(id);
};

var findById = function (id, callback) {
    users.findOne({
        _id: getObjectId(id)
    }, function (err, result) {
        if (err) { 
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

var findByMultipleFields = function (arr, callback) {
    users.find({
        $or: arr
    }).toArray(
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
};