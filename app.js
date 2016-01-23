var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = process.env.PORT || 1337;
var session = require("client-sessions");
console.log(port);
//var io = require("socket.io").listen( port);
var db = require("./db-setup.js");


/*var nsp = io.of("/mynamespace");

nsp.on('connection', function(socket){
  socket.on('chat message', function(msg){
    nsp.emit("chat message", msg);
  });
});*/


var url = require('url');

/*var rooms = {}

function createChannel(name) {
  rooms[name] = io.of(name);
}*/

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.set('port', process.env.PORT || 1337);
server = require('http').createServer(app)
io = require('socket.io').listen(server, { log: false });
server.listen(app.get("port"));
//console.log(port);

//io.set('transports', ['xhr-polling']);
//io.set('polling duration', 10);


// global entry point for new connections
io.on('connection', function (socket) {
  // extract namespace from connected url query param 'ns'
  var ns = url.parse(socket.handshake.url, true).query.ns;
  console.log('connected ns: '+ns)

      var index = ns.indexOf("com");
      console.log(port);
      var namespace = ns.substring(index+3,ns.length);
      console.log(namespace);
      var groupname = namespace.substring(1,namespace.length);
      console.log(groupname);

      var nsp = io.of(namespace);

      nsp.once('connection', function(socket){
        console.log("hello");
        socket.on('chat message', function(msg){

          db.groups.find({groupName: groupname}).toArray(function(err, data){

            var group = data[0];
            console.log(data[0]);
            var chatHistory = group.chat;
            console.log(chatHistory);
            chatHistory.push(msg);
            console.log(chatHistory);
            db.groups.update({groupName: groupname}, {$set:{chat: chatHistory}});

          })
          nsp.emit("chat message", msg);
        });
      });
    
  
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs'}));

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        getIndex: function (index) { return index.toString(); }    
   }
});

app.engine(".hbs", hbs.engine);

app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));


app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
