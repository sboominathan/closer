var mongo = require('mongodb').MongoClient;

var dbConnectionUrl = 'mongodb://heroku_kfs36l9m:9ofslok0r76gsfben7gtp2sk9c@ds047305.mongolab.com:47305/heroku_kfs36l9m';

var collections = {};

mongo.connect(dbConnectionUrl, function (err, db) {
  if (err) {
    console.log('Can not connect to MongoDB. Did you run it?');
    console.log(err.message);
    return;
  }

  collections.users = db.collection('users');
  collections.matches = db.collection('matches');
  collections.groups = db.collection("groups");
  collections.profpics = db.collection("profpics")
  

});


module.exports = collections;



/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userdb', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var UserSchema = new mongoose.Schema({
  username: String,
  password: String
});


module.exports = mongoose.model('User', UserSchema);*/

