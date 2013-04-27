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

exports.getUsers = function (req, res) {
    users.find({}, { pass: 0 }).toArray(function (err, result) {
        res.send(result);
    });
};

exports.getUser = function (req, res) {
    users.findOne(
        { user: req.param("id") },
        { pass: 0 },
    function (err, result) {
        res.send(result);
    });
};

exports.addUser = function (req, res) {
    var data = {},
        user = req.param("signup-username"),
        pass = req.param("signup-password"),
        email = req.param("signup-email"),
        registrationIp;

    // Make sure all fields are accounted for
    if (!user || !pass || !email) {
        res.send({"error": "Field cannot be empty"});
    } else {

        // Alphanumeric only, between 4 and 40 characters
        var regexp = /^[A-Za-z0-9_]{4,30}$/;

        // Regexp the username and check the length (redundant)
        if (user.length < 4 || user.length > 30 || !regexp.test(user)) {
            res.send({"error": "Invalid username"});
        } else {

            // Check the password length
            if (pass.length < 6) {
                res.send({"error": "Invalid password"});
            } else {

                // Look for the username in the DB
                users.findOne({
                    user: user
                }, function (err, result) {
                    if (result) {
                        res.send({"error": "Username taken"});
                    } else {

                        // Look for the email in the DB
                        users.findOne({
                            email: email
                        }, function (err, result) {
                            if (result) {
                                res.send({"error": "E-mail in use"});
                            } else {

                                // Hash the password
                                data.pass = passHash.generate(pass, {
                                    algorithm: "sha512",
                                    saltLength: 16,
                                    iterations: 2
                                });

                                // Set the registration date
                                data.registrationDate = moment()
                                    .format("dddd, MMMM Do YYYY, h:mm:ss a");

                                // Set the number of logins to 0
                                data.numLogins = 0;

                                // Get the IP from the header
                                if (req.header("x-forwarded-for")) {
                                    data.registrationIp = req.header("x-forwarded-for").split("/")[0];
                                } else {
                                    data.registrationIp = req.connection.remoteAddress;
                                }

                                // Set the rest of the data
                                data.user = user;
                                data.email = email;

                                // Insert the data
                                users.insert(data, {safe: true}, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.send({"error": "An error has occured"});
                                    } else {
                                        req.session.user = result[0];
                                        res.send(result[0]);
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

exports.updateUser = function (req, res) {

    var data = {},
        self,
        firstname = req.param("update-firstname"),
        lastname = req.param("update-lastname"),
        email = req.param("update-email"),
        user = req.param("id"),
        pass = req.param("update-password");

    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        } else {
            self = result;

            if (firstname && firstname.length > 50) {
                res.send({"error": "First name too long"});
            } else {
                data.firstname = firstname;
            }

            if (lastname && lastname.length > 50) {
                res.send({"error": "Last name too long"});
            } else {
                data.lastname = lastname;
            }

            if (email) {
                that.findByEmail(email, function (err, result) {
                    if (result && result.email !== self.email) {
                        res.send({"error": "E-mail in use"});
                    }
                });
            } else {
                data.email = email;
            }

            if (pass) {
                if (pass.length < 6) {
                    res.send({"error": "Invalid password"});
                } else {
                    data.pass = passHash.generate(pass, {
                        algorithm: "sha512",
                        saltLength: 16,
                        iterations: 2
                    });
                }
            } else {
                data.pass = self.pass;
            }

            users.findAndModify(
                { user: user },
                [["_id", "asc"]],
                { $set: data },
                { new: true },
                { "pass": 0 },
                function (err, result) {
                    if (err) {
                        res.send({"error": "An error has occured"});
                    } else {
                        req.session.user = result;
                        res.send(result);
                    }
                }
            );
        }
    });
};

exports.findByEmail = function (email, callback) {
    users.findOne({
        email: email
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

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
};

// Aux. methods

var getObjectId = function (id) {
    return users.db.bson_serializer.ObjectID.createFromHexString(id);
};