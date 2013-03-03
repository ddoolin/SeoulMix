var AM = require("./modules/account-manager");
var ED = require("./modules/email-dispatcher");

module.exports = function (app) {

    "use strict";

    // GET

    // Front page
    app.get("/", function (req, res) {
        if (req.session.user === undefined) {
            res.render("front");
        } else {

            var username = req.session.user.user,
                password = req.session.user.pass,
                ipAddress;

            if (req.header("x-forwarded-for")) {
                ipAddress = req.header("x-forwarded-for").split("/")[0];
            } else {
                ipAddress = req.connection.remoteAddress;
            }

            AM.autoLogin(username, password, ipAddress, function (err, result) {
                if (result != null) {
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
            if (result != null) {
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

        if (req.header("x-forwarded-for")) {
            ipAddress = req.header("x-forwarded-for").split("/")[0];
        } else {
            ipAddress = req.connection.remoteAddress;
        }

        AM.manualLogin(username, password, ipAddress, function (err, result) {
            if (result != null) {
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
            if (result != null) {
                res.send("OK", 200);
                ED.dispatchPasswordResetLink(result, function (err, msg) {
                    if (msg != null) {
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
            if (result != null) {
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
            if (result != null) {
                res.send("OK", 200);
            } else {
                console.log(err);
                if (err != "email-used" && err != "username-taken") {
                    res.send("unable-to-create", 400);
                } else {
                    res.send(err, 400);
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

        // Check to see if the e-mail is in use...
        AM.getAccountsByEmail(req.param("update-email"), function (err, result) {

            // If the email isn't used OR the e-mail is mine (unchanged)
            if (!result || result.email === req.session.user.email) {

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
                    if (result != null) {
                        req.session.user = result;
                        res.send("OK", 200);
                    } else {
                        res.send("unable-to-update", 400);
                    }
                });
            } else {
                res.send("email-used", 400);
            }
        });
    });

    app.post("/delete", function (req, res) {

        // Get the ID from the session and the pass from the form
        var userId = req.session.user._id,
            pass = req.param("delete-password");

        // Call deleteAccount, passing ID and pass
        AM.deleteAccount(userId, pass, function (err, result) {

            // If no error exists, destory the session and send ok. 
            if (result != null) {
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