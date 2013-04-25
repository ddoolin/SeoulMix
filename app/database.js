var MongoDB = require("mongodb").Db,
    Server = require("mongodb").Server,

    dbPort = 27017,
    dbHost = "localhost",
    dbName = "seoulmix";

// DB Connection
db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});

db.open(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to database :: " + dbName);
    }
});