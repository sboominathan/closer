var express = require('express');
var router = express.Router();
var db = require("../db-setup.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Closer' });
});

router.post('/login', function(req, res, next) {
  
  var username = req.body.username;
  var password = req.body.password;
  
  db.users.find({user: username, password: password}).toArray(function (err, peeps) {
    if (peeps.length > 0) {
      // the user needs to be updated
      res.send("Welcome "+ username);
      }
     else {
      	
        res.redirect('/');

      }
    
     });

});

router.post("/signup", function(req, res, next){

	var username = req.body.username;
	var password = req.body.password;
	var passwordcheck = req.body.passwordcheck;


	
  db.users.find({user: username}).toArray(function (err, peeps) {
    
  	//username already in use
    if (peeps.length > 0) { 
      // the user needs to be updated
      res.redirect("/"); //render index page with notification that the username has already been taken
      }
     else if (password == passwordcheck) { 

      	db.users.insert({user: username, password: password}, function(err){
      		res.render("signup", {title: "Closer"});
      	});
        
      }
    
     });

});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Closer' });
  console.log("hi");
});



module.exports = router;
