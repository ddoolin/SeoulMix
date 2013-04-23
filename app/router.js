var AM = require("./server/modules/account-manager"),
    ED = require("./server/modules/email-dispatcher");

module.exports = function (app) {

    "use strict";

    // GET

    // Front page
    app.get("/", function (req, res) {
        if (req.session.user === undefined) {
            res.render("front");
        } else {

            var username = req.session.user.user,
                password = req.session.user.pass;

            AM.autoLogin(username, password, function (err, result) {
                if (result !== null) {
                    req.session.user = result;
                    res.redirect("/home");
                } else {
                    res.render("front");
                }
            });
        }
    });

    // Main page
    app.get("/home", function (req, res) {
        if (req.session.user === undefined) {
            res.redirect("/");
        } else {

            // Render the home page and send the session data with it
            res.render("home", {
                userdata: req.session.user
            });
        }
    });

    // Link served in lost password e-mail
    app.get("/reset-password", function (req, res) {
        var email = req.query.e,
            passhash = req.query.p;

        if (!email || !passhash) {
            res.redirect("/");
        }

        AM.validateResetLink(email, passhash, function (err, result) {
            if (result !== null) {
                req.session.reset = {
                    email: email,
                    passhash: passhash
                };
                res.render("reset");
            } else {
                res.redirect("/");
            }
        });
    });

    // POST

    // Login
    app.post("/", function (req, res) {

        // Collect the field values to send to login
        var username = req.param("login-username"),
            password = req.param("login-password"),
            ipAddress;

        // Get the direct IP or proxy-forwarded IP if it exists
        if (req.header("x-forwarded-for")) {
            ipAddress = req.header("x-forwarded-for").split("/")[0];
        } else {
            ipAddress = req.connection.remoteAddress;
        }

        AM.manualLogin(username, password, ipAddress, function (err, result) {
            if (result !== null) {
                req.session.user = result;

                if (req.param("remember-me") === "true") {

                    // 24 hours
                    req.session.cookie.maxAge = 86400000;
                }

                res.send("OK", 200);
            } else {
                res.send("unable-to-login", 400);
            }
        });
    });

    app.post("/lost-password", function (req, res) {

        var i;

        AM.getAccountsByEmail(req.param("lostpass-email"), function (err, result) {
            if (result !== null) {
                res.send("OK", 200);
                ED.dispatchPasswordResetLink(result, function (err, msg) {
                    if (msg !== null) {
                        res.send("OK", 200);
                    } else {
                        res.send("email-server-error", 400);
                        for (i = 0; i < err.length; i += 1) {
                            console.log("Error: ", i, err[i], msg);
                        }
                    }
                });
            } else {
                res.send("email-not-found", 400);
            }
        });
    });

    app.post("/reset-password", function (req, res) {
        var newpass = req.param("new-password"),
            email = req.session.reset.email;

        req.session.destroy();
        AM.updatePassword(email, newpass, function (err, result) {
            if (result !== null) {
                res.send("OK", 200);
            } else {
                res.send("unable-to-update", 400);
            }
        });
    });

    app.post("/signup", function (req, res) {

        var ipAddress;

        if (req.header("x-forwarded-for")) {
            ipAddress = req.header("x-forwarded-for").split("/")[0];
        } else {
            ipAddress = req.connection.remoteAddress;
        }

        AM.addNewAccount({
            user:   req.param("signup-username"),
            pass:   req.param("signup-password"),
            email:  req.param("signup-email"),
            registrationIp: ipAddress
        }, function (err, result) {
            if (result !== null) {

                // Mongo's insert returns results in an array
                // To fit, pull it out into an object
                result = result[0];
                req.session.user = result;

                res.send("OK", 200);
            } else {
                if (err === "empty-field" || err === "invalid-username"
                    || err === "invalid-password" || err === "username-taken"
                    || err === "email-used") {

                    res.send(err, 400);
                } else {
                    res.send("unable-to-create", 400);
                }
            }
        });
    });

    app.post("/home", function (req, res) {

        if (req.param("logout") === "true") {
            res.clearCookie("user");
            res.clearCookie("pass");
            req.session.destroy(function (err) {
                if (err) {
                    res.send(err, 400);
                } else {
                    res.send("OK", 200);
                }
            });
        }
    });

    app.post("/update-profile", function (req, res) {

        // Put data into an object and send it off 
        // Use session username in case the user changed it maliciously
        var data = {
            firstname: req.param("update-firstname"),
            lastname: req.param("update-lastname"),
            email: req.param("update-email"),
            user: req.session.user.user,
            pass: req.param("update-password")
        };

        AM.updateAccount(data, function (err, result) {
            if (result !== null) {
                req.session.user = result;
                res.send(result, 200);
            } else {
                if (err === "invalid-password"
                    || err === "invalid-email"
                    || err === "invalid-name") {

                    res.send(err, 400);
                 } else {
                    res.send("unable-to-update");
                }
            }
        });
    });

    app.post("/update-profilepic", function (req, res) {

        var image,
            username;

        // If remove, set pic to null and remove to true and remove from DB
        if (req.param("remove") === "true" && req.session.user.profilePic !== null) {

            username = req.session.user.user,
            image = req.session.user.profilePic;

            AM.updateProfilePic({
                image: image,
                user: username,
                remove: true
            }, function (err, result) {
                if (result !== null) {
                    res.send("OK", 200);
                } else {
                    res.send("unable-to-remove", 400);
                }
            });

            // Update for this session
            req.session.user.profilePic = null;

        } else if (req.param("remove") !== "true") {

            // Get the image
            image = req.files.images[0],
            username = req.session.user.user;

            // Update profile pic file name in the DB
            AM.updateProfilePic({
                image: image,
                user: username,
                remove: false
            }, function (err, result) {
                if (result !== null) {

                    // Update for this session
                    req.session.user.profilePic = image.name;
                    res.send("OK", 200);
                } else {
                    if (err === "image-size" || err === "image-type") {
                        res.send(err, 400);
                    } else {
                        res.send("unable-to-update", 400);
                    }
                }
            });
        }
    });

    app.post("/delete", function (req, res) {

        // Get the ID from the session and the pass from the form
        var userId = req.session.user._id,
            pass = req.param("delete-password");

        // Call deleteAccount, passing ID and pass
        AM.deleteAccount(userId, pass, function (err, result) {

            // If no error exists, destory the session and send ok. 
            if (result !== null) {
                req.session.destroy(function (err) {
                    if (err) {
                        res.send(err, 400);
                    } else {
                        res.send("OK", 200);
                    }
                });

            // Otherwise, log the error and send record not found.
            } else {
                res.send(err, 400);
            }
        });
    });

    app.get("*", function (req, res) {
        res.render("404");
    });

    app.post("*", function (req, res) {
        res.render("404");
    });
};