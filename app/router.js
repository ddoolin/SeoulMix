var UM = require("./server/modules/user-manager"),
    EM = require("./server/modules/event-manager"),
    cloudinary = require("cloudinary"),
    constants = require("./server/modules/constants");

module.exports = function (app) {

    "use strict";

    // API

    // app.all('/api/*', requireAuthentication);

    // Users

    app.get("/api/users", UM.getUsers);
    app.get("/api/users/:id", UM.getUser);
    app.post("/api/users", UM.addUser);
    app.put("/api/users/:id", UM.updateUser);
    app.put("/api/users/:id/upload", UM.updateProfileImage);
    app.del("/api/users/:id/upload", UM.updateProfileImage);
    app.del("/api/users/:id", UM.deleteUser);

    // Events

    app.get("/api/events", EM.getEvents);
    app.get("/api/events/:id", EM.getEvent);
    app.get("/api/events/user/:id", EM.getUserEvents);
    app.post("/api/events", EM.addEvent);
    // TODO
    app.put("/api/events/:id", EM.updateEvent);


    // Private

    // Users

    app.get("/", UM.getFront);
    app.post("/login", UM.manualLogin);
    app.get("/users/:id", UM.getUserPage);
    app.get("/users/reset", UM.getReset);
    app.post("/users/reset", UM.postReset);
    app.get("/home", UM.getHome);
    app.post("/logout", UM.logout);

    // Events

    app.get("/events/:id", EM.getEventPage);
};