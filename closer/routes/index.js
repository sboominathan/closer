var express = require('express');
var router = express.Router();
var db = require("../db-setup.js");
var currUser = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Closer' });
});


//PRESSING LOGIN ON FRONT PAGE

router.post('/login', function(req, res, next) {
  
  var username = req.body.username;
  var password = req.body.password;
  
  db.users.find({user: username, password: password}).toArray(function (err, peeps) {
    if (peeps.length > 0) {
      
      
      //set currUser to user based on search in user array

      db.users.find({user:username}).toArray(function(err,peeps){

       		currUser = peeps[0];
       		if (currUser.filledOut){
       			db.users.find().toArray(function(err, peeps){
					res.json(peeps);
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
        discoverable: false,
      }
      
    }
	);
	
  res.render("userpage", {title: "Closer", user: currUser.user, college: college, year: year, bio: bio})

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

router.get("/logout", function(req,res,next){
	console.log("hihi")
	var currUser = null;
	res.redirect("/");
	
});

//UPDATE INFO -- FORM ON USERPAGE


module.exports = router;
