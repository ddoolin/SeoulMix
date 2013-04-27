var database = require("../../database"),
    path = require("path"),
    fs = require("fs"),
    async = require("async"),
    moment = require("moment"),
    passHash = require("password-hash"),

    users = db.collection("users"),
    that = this;

// Login

exports.autoLogin = function (user, pass, callback) {
    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            if (result.pass === pass) {
                callback(null, result);
            } else {
                callback("invalid-password", null);
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

                // Collect the time at this second and IP
                var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                    data = {
                        lastLoginIp: ipAddress,
                        lastLoginDate: date
                    };

                // Pass in the date, IP, and increment the # of logins
                users.findAndModify(
                    { user: user },
                    [["_id", "asc"]],
                    { $inc: { numLogins: 1 },
                      $set: data },
                    { new: true },
                    function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result);
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
    var user = data.user,
        pass = data.pass,
        email = data.email;

    // Make sure all fields are accounted for
    if (!user || !pass || !email) {
        callback("empty-field", null);
    } else {

        // Alphanumeric only, between 4 and 40 characters
        var regexp = /^[A-Za-z0-9_]{4,30}$/;

        // Regexp the username and check the length (redundant)
        if (user.length < 4 || user.length > 30 || !regexp.test(user)) {
            callback("invalid-username", null);
        } else {

            // Check the password length
            if (pass.length < 6) {
                callback("invalid-password");
            } else {

                // Look for the username in the DB
                users.findOne({
                    user: data.user
                }, function (err, result) {
                    if (result) {
                        callback("username-taken", null);
                    } else {

                        // Look for the email in the DB
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
                                        callback(null, result[0]);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    }
};

exports.updateAccount = function (data, callback) {

    var firstname = data.firstname,
        lastname = data.lastname,
        email = data.email,
        user = data.user,
        pass = data.pass,

        // Separate in case of non-changed password
        // Names CAN BE removed
        update = {
            firstname: firstname,
            lastname: lastname,
            email: email
        };

    // Check name lengths
    if (firstname.length <= 50 && lastname.length <= 50) {

        // Check if the email is already being used
        that.getAccountsByEmail(email, function (err, result) {
            if (!result || result.email === email) {
                if (pass === "") {
                        users.findAndModify(
                            { user: user },
                            [["_id", "asc"]],
                            { $set: update },
                            { new: true },
                            function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    result = {
                                        _id: result._id,
                                        user: result.user,
                                        firstname: result.firstname,
                                        lastname: result.lastname,
                                        email: result.email
                                    };
                                    callback(null, result);
                                }
                            }
                        );
                } else {
                    if (pass.length >= 6) {

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
                            function (err, result) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    result = {
                                        id: result._id,
                                        user: result.user,
                                        firstname: result.firstname,
                                        lastname: result.lastname,
                                        email: result.email
                                    };
                                    callback(null, result);
                                }
                            }
                        );
                    } else {
                        callback("invalid-password", null);
                    }
                }
            } else {
                callback("invalid-email");
            }
        });
    } else {
        callback("invalid-name", null);
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
        function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        }
    );
};

exports.updateProfilePic = function (data, callback) {

    var image = data.image,
        user = data.user,
        remove = data.remove;

    // If remove is false, check and add image
    if (remove === false) {

        // If the image size is within the limits
        if (image.size > 0 && image.size < 716800) {

            // If the image is a .JPG or .PNG
            if (image.type === "image/jpeg" || image.type === "image/png") {

                var tempPath = image.path,
                    targetPath;

                // If the directory exists, continue; If not, create it
                fs.exists(path.normalize(__dirname
                    + "/../../public/img/profile-images/"
                    + user), function (exists) {

                    if (!exists) {
                        fs.mkdir(path.normalize(__dirname
                            + "/../../public/img/profile-images/"
                            + user), function (err) {

                            if (err) {
                                throw err;
                            }
                        });
                    }
                });

                // Set the target path to the (perhaps new) directory
                targetPath =
                    path.normalize(__dirname
                    + "/../../public/img/profile-images/"
                    + user + "/" + image.name);

                // Keep trying to move the file until it's there w/ a 1 second
                // interval
                async.until(
                    function () {
                        // Move the file (this removes from the temp path)
                        fs.rename(tempPath, targetPath, function (err) {
                            if (err) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                    },
                    function (callback) {
                        setTimeout(callback, 1000);
                    },
                    function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                    }
                );

                users.update(
                    { user: user },
                    { $set: { profilePic: image.name } },
                    { safe: true },
                    function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result);
                        }
                    }
                );
            } else {
                callback("image-count", null);
            }
        } else {
            callback("image-size", null);
        }
    } else {

        // Else, remove it by setting the property to null
        users.update(
            { user: user },
            { $set: { profilePic: null } },
            { safe: true },
            function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result);
                }
            }
        );

        // Remove the actual file (if the user had one)
        fs.exists(path.normalize(__dirname
            + "/../../public/img/profile-images/"
            + user + "/" + image), function (exists) {

            if (exists) {
                fs.unlink(path.normalize(__dirname
                    + "/../../public/img/profile-images/"
                    + user + "/" + image), function (err) {

                    if (err) {
                        throw err;
                    }
                });
            }
        });
    }
};

exports.deleteAccount = function (id, pass, callback) {
    users.findOne({
        _id: getObjectId(id)
    }, function (err, result) {
        if (err) {
            callback("record-not-found", null);
        } else {
            if (passHash.verify(pass, result.pass)) {

                // Remove anything dependent on DB results before removing
                var profilePic = result.profilePic,
                    user = result.user;

                that.updateProfilePic({
                    image: profilePic,
                    user: user,
                    remove: true
                }, function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {

                        // Lastly, remove from DB
                        users.remove({
                            _id: getObjectId(id)
                        }, function (err, result) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, result);
                            }
                        });

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

exports.getUsers = function (callback) {
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