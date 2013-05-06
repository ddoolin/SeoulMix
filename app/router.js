var AM = require("./server/modules/account-manager"),
    EM = require("./server/modules/event-manager"),
    cloudinary = require("cloudinary"),
    constants = require("./server/modules/constants");

module.exports = function (app) {

    "use strict";

    // API

    // app.all('/api/*', requireAuthentication);

    // Users

    app.get("/api/users", AM.getUsers);
    app.get("/api/users/:id", AM.getUser);
    app.post("/api/users", AM.addUser);
    app.put("/api/users/:id", AM.updateUser);
    app.put("/api/users/:id/upload", AM.updateProfileImage);
    app.del("/api/users/:id/upload", AM.updateProfileImage);
    app.del("/api/users/:id", AM.deleteUser);

    // Events

    app.get("/api/events", function (req, res) {
        if (req.session.user === undefined) {
            res.render("front");
        } else {
            EM.getEvents(function (err, result) {
                if (result !== null) {
                    res.send(result, 200);
                } else {
                    res.send("unable-to-fetch", 400);
                }
            });
        }
    });

    app.post("/api/events", function (req, res) {
        if (req.session.user === undefined) {
            res.render("front");
        } else {
            var data = {
                user: req.session.user._id,
                name: req.param("event-name"),
                description: req.param("event-description")
            };

            EM.addEvent(data, function (err, result) {
                if (result !== null) {
                    res.send(result, 201);
                } else {
                    res.send("unable-to-create", 400);
                }
            });
        }
    });

    // Private

    app.get("/", AM.getFront);
    app.post("/login", AM.manualLogin)
    app.get("/users/reset", AM.getReset);
    app.post("/users/reset", AM.postReset);

    // Main page
    app.get("/home", function (req, res) {
        if (req.session.user === undefined) {
            res.redirect("/");
        } else {

            // Render the home page and send the session data with it
            res.render("home", {
                userdata: req.session.user,
                cloudinary: cloudinary
            });
        }
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
};