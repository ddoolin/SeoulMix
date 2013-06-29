var MongoDB = require("mongodb").Db,
		Server = require("mongodb").Server,
		url = require("url"),
		dbUrl = null;

// If the envvar isn't set, assume localhost and default port
if (process.env["MONGO_URL"]) {
	dbUrl = url.parse(process.env["MONGO_URL"]);

	var dbHost = dbUrl.hostname,
			dbPort = dbUrl.port,
			// RegExp to get the DB name and split the auth
			dbName = dbUrl.path.replace(/^\//, ''),
			dbUser = dbUrl.auth.match(/[^:]*/)[0],
			dbPass = dbUrl.auth.match(/:(.+)/)[1];
} else {
	var dbHost = "localhost",
			dbPort = 27017,
			dbName = "seoulmix";
}

// DB Connection
db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});

db.open(function (err, db) {
		if (err) {
			console.log(err);
		} else {
			db.authenticate(dbUser, dbPass, {}, function (err) {
				console.log("Connected and authenicated to database :: " + dbName);
			});
		}
});
