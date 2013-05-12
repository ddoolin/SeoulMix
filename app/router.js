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

    app.get("/api/events", EM.getEvents);
    app.get("/api/events/:id", EM.getEvent);
    app.get("/api/events/user/:id", EM.getUserEvents);
    app.post("/api/events", EM.addEvent);
    // TODO
    app.put("/api/events/:id", EM.updateEvent);


    // Private

    // Users

    app.get("/", AM.getFront);
    app.post("/login", AM.manualLogin)
    app.get("/users/reset", AM.getReset);
    app.post("/users/reset", AM.postReset);
    app.get("/home", AM.getHome);
    app.post("/logout", AM.logout);
};