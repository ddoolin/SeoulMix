var database = require("../../database"),
    path = require("path"),
    fs = require("fs"),
    async = require("async"),
    moment = require("moment"),
    passHash = require("password-hash"),
    cloudinary = require("cloudinary"),
    constants = require("./constants"),

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

// Account lookup

exports.getUsers = function (req, res) {
    users.find({}, { pass: 0, _id: 0 }).toArray(function (err, result) {
        res.send(result);
    });
};

exports.getUser = function (req, res) {
    users.findOne(
        { user: req.param("id") },
        { pass: 0, _id: 0 },
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

                                // Set profile image url to default
                                data.profileImage = {
                                    url: cloudinary.url(constants.DEFAULT_PROFILE_IMAGE),
                                    default_image: true
                                }

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
        firstname = req.param("firstname"),
        lastname = req.param("lastname"),
        email = req.param("email"),
        user = req.param("id"),
        pass = req.param("pass");

    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

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
            if (email !== self.email) {
                that.findByEmail(email, function (err, result) {
                    if (result) {
                        res.send({"error": "E-mail in use"});
                    } else {
                        data.email = email;
                    }
                });
            } else {
                data.email = self.email;
            }
        } else {
            res.send({"error": "Invalid e-mail"});
        }

        if (pass) {
            if (pass.length < 6) {
                res.send({"error": "Invalid password"});
            }

            data.pass = passHash.generate(pass, {
                algorithm: "sha512",
                saltLength: 16,
                iterations: 2
            });
        } else {
            data.pass = self.pass;
        }

        users.findAndModify(
            { user: user },
            [["_id", "asc"]],
            { $set: data },
            { new: true },
            function (err, result) {
                if (err) {
                    res.send({"error": "An error has occured"});
                } else {
                    req.session.user = result;
                    res.send(result);
                }
            }
        );
    });
};

exports.updateProfileImage = function (req, res) {
    // Validate image
    // Upload image to cloudinary
    // save url to user.profileImage.url
    // Set user.profileImage.default_image to false

    var image = req.files.images[0],
        cloudinaryStream,
        fileReader,
        newImageId;

    if (image.size > 716800) {
        res.send({"error": "Image too large"});
    }

    if (image.type !== "image/jpeg" || image.type !== "image/png") {
        res.send({"error": "Incorrect image format"});
    }

    users.findOne({
        user: req.param("id")
    }, function (err, result) {
        if (result) {

            console.log(req.files.images[0]);

            // Prepare the uploader
            cloudinaryStream = cloudinary.uploader.upload_stream(function (result) {
                newImageId = result.public_id;
            });

            // Begin streaming to the uploader
            fileReader = fs.createReadStream(req.files.images[0].path, { encoding: "binary" })
                           .on("data", cloudinaryStream.write)
                           .on("end", cloudinaryStream.end);
        }
    });
};

exports.deleteProfileImage = function (req, res) {
    console.log("AM#deleteProfileImage");
};

exports.deleteUser = function (req, res) {
    users.findOne({
        user: req.param("id")
    }, function (err, result) {
        if (result) {
            if (passHash.verify(req.param("pass"), result.pass)) {
                users.remove({
                    _id: result._id
                }, function (err, result) {
                    if (err) {
                        res.send({"error": "An error has occured"});
                    } else {
                        res.send({"status": "success"});

                        req.session.destroy();
                    }
                });
            } else {
                res.send({"error": "Invalid password"});
            };
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
