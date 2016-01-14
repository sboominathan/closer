var express = require('express');
var router = express.Router();
var db = require("../db-setup.js");
var currUser = null;
var matchArray = [];
var posInMatch = 0

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Closer' });
});


//PRESSING LOGIN ON FRONT PAGE

router.post('/login', function(req, res, next) {
  
  var username = req.body.username;
  var password = req.body.password;
  posInMatch = 0;
  
  db.users.find({user: username, password: password}).toArray(function (err, peeps) {
    if (peeps.length > 0) {
      
      
      //set currUser to user based on search in user array

      db.users.find({user:username}).toArray(function(err,peeps){

       		currUser = peeps[0];
       		if (currUser.filledOut){
       			db.users.find().toArray(function(err, data){
       				matchArray = data;
					var firstMatches = data.slice(posInMatch,5);
					var username = currUser.user
					var groups = currUser.groups

					res.render("matches", {users: firstMatches, username: username, groups: groups});
				})
       		}
       		else{
       			res.render("signup", {title: "Closer"});
       		}
      	});
      
      }
     else {
      	
        res.send("Sorry, that's an incorrect username/password combination!");

      }
    
     });

});
////////////////////////////////


//PRESSING SIGN UP ON FRONT PAGE
router.post("/signup", function(req, res, next){

	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	var passwordcheck = req.body.passwordcheck;


	
  db.users.find({user: username}).toArray(function (err, peeps) {
    
  	//username already in use
    if (peeps.length > 0) { 
      // the user needs to be updated
      res.redirect("/"); //render index page with notification that the username has already been taken
      }
     else if (password == passwordcheck) { 

      	db.users.insert({user: username, password: password, email: email, filledOut:false}, function(err){
      		
      		res.render("signup", {title: "Closer"});
      	});
       db.users.find({user:username}).toArray(function(err,peeps){

       		currUser = peeps[0];

      	})
      	  
      }
    
     });

});

////////////////////////////////

router.post("/userinfo", function(req,res,next){

	var first = req.body.firstname;
	var last = req.body.lastname;
	var college = req.body.college;
	var year = req.body.year;
	var gender = req.body.gender;
	var courses = req.body.option;
	var bio = req.body.bio;
	

	db.users.update(
    { user: currUser.user },
    {
      $set: {
        first: first,
        last: last,
        college: college,
        year: year,
        gender: gender,
        courses: courses,
        bio:bio,
        filledOut: true,
        groups: [],
        discoverable: false

      }
      
    }

	);

	})
	
  res.render("userpage", {title: "Closer", user: currUser});

});

//SHORTCUT FOR SIGNUP (TESTING)

router.get('/signup', function(req, res, next) {
	//search for username entered and set current user to this value
  res.render('signup', { title: 'Closer' });
   
});

//ABOUT PAGE
router.get("/about", function(req,res,next){

	
	res.render("about", {title: "Closer"});

});

//CONTACT PAGE

router.get("/contact", function(req,res,next){

	res.render("contact", {title: "Closer"}); 

});

//REROUTES TO FRONT PAGE, RESETS CURRENT USER TO NULL
//ACCESSED BY LOGOUT BUTTON ON NAVBAR ON EVERY PAGE

router.get("/logout", function(req,res,next){
	console.log("hihi")
	var currUser = null;
	res.redirect("/");
	posInMatch = 0;
	matchArray = [];
	
});

//UPDATE INFO -- FORM ON USERPAGE


router.get("/next", function(req,res,next){

	posInMatch +=5;
	firstMatches = matchArray.slice(posInMatch,posInMatch+5)
	var username = currUser.user;
	res.render("matches",{users: firstMatches, username :username, groups: currUser.groups} );

});

router.get("/previous", function(req,res,next){

	posInMatch -=5;
	firstMatches = matchArray.slice(posInMatch,posInMatch+5)
	var username = currUser.user;
	res.render("matches",{users: firstMatches, username :username, groups: currUser.groups} );

});

router.get("/search", function(req,res,next){

	var username = currUser.user;
	res.render("search", {title: "Closer", username: username,

		});

		
});

// Send user to userpage when they click to see their profile
router.get("/userview/:username", function(req, res, next) {
  var username = currUser.user;
  res.render("userpage", {title: "Closer", user: currUser });
});



// Send user to matches page when they are on user page and click "Home"
router.get("/home/:username", function(req, res, next) {
  var firstMatches = matchArray.slice(posInMatch,5);
  var username = currUser.user;

  //Fix matches
  res.render("matches", { users: firstMatches, username :username });
});

module.exports = router;
