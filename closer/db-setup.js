var mongo = require('mongodb').MongoClient;

var dbConnectionUrl = 'mongodb://localhost:27017/closerdb';

var collections = {};

mongo.connect(dbConnectionUrl, function (err, db) {
  if (err) {
    console.log('Can not connect to MongoDB. Did you run it?');
    console.log(err.message);
    return;
  }

  collections.users = db.collection('users');
  collections.matches = db.collection('matches');
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

