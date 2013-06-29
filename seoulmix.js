var express = require("express"),
    path = require("path"),
    cloudinary = require("cloudinary"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    smixsocket;

app.configure(function() {
	app.set("port", 8081);
	app.set("views", __dirname + "/app/server/views");
	app.set("view engine", "jade");
	app.use(express.logger("dev"));
	app.use(express.bodyParser({
        uploadDir: "./uploads",
        keepExtensions: true
    }));
	app.use(express.cookieParser());
	app.use(express.session({
        secret: "d4SPw4mz2",
        cookie: {
            expires: false
        }
    }));
	app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname + '/app/public')));
  cloudinary.config(process.env["CLOUDINARY_URL"]);
});

app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});

require('./app/router')(app);

server.listen((process.env["PORT"] || app.get('port')), function() {
	console.log("HTTP server listening on port " + (process.env["PORT"] || app.get('port')));
});

io.sockets.on("connection", function (socket) {
  console.log("Socket.io connected");
  smixsocket = socket;
});

module.exports.getSocket = function () {
  return smixsocket;
}