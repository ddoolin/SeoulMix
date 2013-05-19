var database = require("../../database"),
    path = require("path"),
    fs = require("fs"),
    async = require("async"),
    moment = require("moment"),
    passHash = require("password-hash"),
    cloudinary = require("cloudinary"),
    constants = require("./constants"),
    email = require("./email-dispatcher"),

    users = db.collection("users"),
    that = this;

// Login/Logout

exports.autoLogin = function (req, res) {
    var user = req.session.user.user,
        pass = req.session.user.pass;

    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            req.session = null;
            res.redirect("/");
        }

        if (result.pass === pass) {
            res.redirect("/home");
        } else {
            req.session = null;
            res.redirect("/");
        }
    });
};

exports.manualLogin = function (req, res) {
    var user = req.param("user"),
        pass = req.param("pass");

    users.findOne({
        user: user
    }, function (err, result) {
        if (err || !result) {
            res.send({"error": "Incorrect login"});
            return false;
        }

        // Hash the password provided and callback invalid if no match
        if (!passHash.verify(pass, result.pass)) {
            res.send({"error": "Incorrect login"});
            return false;
        } else {

            var ipAddress,
                date,
                data = {};

            // Get the direct IP or proxy-forwarded IP if it exists
            if (req.header("x-forwarded-for")) {
                ipAddress = req.header("x-forwarded-for").split("/")[0];
            } else {
                ipAddress = req.connection.remoteAddress;
            }

            // Collect the time at this second
            date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),

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
                        res.send({"error": "An error has occured"});
                        return false;
                    }

                    req.session.user = result;

                    if (req.param("remember-me")) {
                        // 24 hours
                        req.session.cookie.maxAge = 86400000;
                    }

                    res.redirect("/home");
                }
            );
        }
    });
};

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            res.send({"error": "An error has occured"});
            return false;
        }

        res.send({"status": "success"});
    });
};

exports.getFront = function (req, res) {
    if (req.session.user === undefined) {
        res.render("front");
        return false;
    }

    that.autoLogin(req, res);
};

exports.getHome = function (req, res) {
    if (req.session.user === undefined) {
        res.redirect("/");
        return false;
    }

    // Render the home page and send the session data with it
    // Also send the cloudinary object for use in the views
    res.render("home", {
        userdata: req.session.user,
        cloudinary: cloudinary
    });
};

// Account lookup

exports.getUsers = function (req, res) {
    users.find({}, { pass: 0, _id: 0 }).toArray(function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result);
    });
};

exports.getUser = function (req, res) {
    users.findOne(
        { user: req.param("id") },
        { pass: 0, _id: 0 },
    function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        res.send(result);
    });
};

exports.addUser = function (req, res) {
    var data = {},
        user = req.param("user"),
        pass = req.param("pass"),
        email = req.param("email"),
        regExp = /^[A-Za-z0-9_]{4,30}$/,
        regIp;

    // Make sure all fields are accounted for
    if (!user || !pass || !email) {
        res.send({"error": "Field cannot be empty"});
        return false;
    }

    // Regexp the username and check the length (redundant)
    if (user.length < 4 || user.length > 30 || !regExp.test(user)) {
        res.send({"error": "Invalid username"});
        return false;
    }

    // Check the password length
    if (pass.length < 6) {
        res.send({"error": "Invalid password"});
        return false;
    }

    // Look for the username in the DB
    users.findOne({
        user: user
    }, function (err, result) {
        if (result) {
            res.send({"error": "Username taken"});
            return false;
        }

        // Look for the email in the DB
        users.findOne({
            email: email
        }, function (err, result) {
            if (result) {
                res.send({"error": "E-mail in use"});
                return false;
            }

            // Hash the password
            data.pass = generatePassword(pass);

            // Set the registration date
            data.registrationDate = moment()
                .format("dddd, MMMM Do YYYY, h:mm:ss a");

            // Set the number of logins to 0
            data.numLogins = 0;

            // Set profile image url to default
            data.profileImage = {
                id: constants.DEFAULT_PROFILE_IMAGE_ID,
                format: "jpg",
                default_image: true
            }

            // Get the IP from the header
            if (req.header("x-forwarded-for")) {
                data.regIp = req.header("x-forwarded-for").split("/")[0];
            } else {
                data.regIp = req.connection.remoteAddress;
            }

            // Set the rest of the data
            data.user = user;
            data.email = email;

            // Insert the data
            users.insert(data, {safe: true}, function (err, result) {
                if (err) {
                    res.send({"error": "An error has occured"});
                    return false;
                }

                req.session.user = result[0];
                res.send(result[0]);
            });
        });
    });
};

exports.updateUser = function (req, res) {

    if (!req.param("reset")) {
        var firstname = req.param("firstname"),
            lastname = req.param("lastname"),
            email = req.param("email");
    }

    var self,
        data = {},
        user = req.param("id"),
        pass = req.param("pass");

    users.findOne({
        user: user
    }, function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        self = result;

        if (firstname.length > 50) {
            res.send({"error": "First name too long"});
        } else {
            data.firstname = firstname;
        }

        if (lastname.length > 50) {
            res.send({"error": "Last name too long"});
        } else {
            data.lastname = lastname;
        }

        if (email) {
            if (email !== self.email) {
                findByEmail(email, function (err, result) {
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

            data.pass = generatePassword(pass);
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
                }

                req.session.user = result;
                res.send(result);
            }
        );
    });
};

exports.updateProfileImage = function (req, res) {
    if (req.method == "DELETE") {
        var data = {};

        cloudinary.api.delete_resources(
            [req.session.user.profileImage.id],
            function (result) {}
        );

        data.profileImage = {
            id: constants.DEFAULT_PROFILE_IMAGE_ID,
            format: "jpg",
            default_image: true
        };

        users.findAndModify(
            { user: req.param("id") },
            [["_id", "asc"]],
            { $set: data },
            { new: true },
            function (err, result) {
                if (err) {
                    res.send({"error": "An error has occured"});
                    return false;
                }

                req.session.user = result;
                res.send(result);
            }
        );
    } else {
        var image = req.files.images[0],
            cloudinaryStream,
            fileReader;

        if (image.size > 716800) {
            res.send({"error": "Image too large"});
            return false;
        }

        if (image.type !== "image/jpeg" && image.type !== "image/png") {
            res.send({"error": "Incorrect image format"});
            return false;
        }

        users.findOne({
            user: req.param("id")
        }, function (err, result) {
            if (err) {
                res.send({"error": "An error has occured"});
                return false;
            }

            // Prepare the uploader
            cloudinaryStream = cloudinary.uploader.upload_stream(function (result) {
                var data = {};

                data.profileImage = { 
                    id: result.public_id,
                    format: result.format,
                    default_image: false
                };

                users.findAndModify(
                    { user: req.param("id") },
                    [["_id", "asc"]],
                    { $set: data },
                    { new: true },
                    function (err, result) {
                        if (err) {
                            res.send({"error": "An error has occured"});
                            return false;
                        }

                        req.session.user = result;
                        res.send(result);
                    }
                );
            });

            // Begin streaming to the uploader
            fileReader = fs.createReadStream(
                req.files.images[0].path,
                { encoding: "binary" })
            .on("data", cloudinaryStream.write)
            .on("end", cloudinaryStream.end);
        });
    }
};

exports.deleteUser = function (req, res) {
    users.findOne({
        user: req.param("id")
    }, function (err, result) {
        if (err) {
            res.send({"error": "An error has occured"});
        }

        if (passHash.verify(req.param("pass"), result.pass)) {
            cloudinary.api.delete_resources(
                [result.profileImage.id],
                function (result) {}
            );

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
    });
};

exports.getReset = function (req, res) {
    var email = req.query.e,
        passhash = req.query.p;

    if (!email || !passhash) {
        res.redirect("/");
    }

    users.find({
        $and: [{
            email: email,
            pass: passhash
        }]
    }, function (err, result) {
        if (err) {
            res.redirect("/");
        }

        res.render("reset", {
            user: result.user
        });
    });
};

exports.postReset = function (req, res) {
    findByEmail(req.param("email"), function (err, result) {
        if (err || !result) {
            res.send({"error": "Invalid e-mail"});
            return false;
        }

        email.dispatchPasswordResetLink(result, function (err, msg) {
            if (err) {
                res.send({"error": "An error has occured"});
                return false;
            }

            res.send({"status": "success"});
        });
    });
};

// Aux. methods

var generatePassword = function (pass) {
    hash = passHash.generate(pass, {
        algorithm: "sha512",
        saltLength: 16,
        iterations: 2
    });

    return hash;
};

var findByEmail = function (email, callback) {
    users.findOne({
        email: email
    }, function (err, result) {
        if (err) {
            callback(err, null);
        }

        callback(null, result);
    });
};