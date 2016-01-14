var express = require('express');
var router = express.Router();
var db = require("../db-setup");
var currUser = null;
var rankingAlgy = require("../matches_handler");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Closer' });
});


//PRESSING LOGIN ON FRONT PAGE

router.post('/login', function(req, res, next) {
  
  var username = req.body.username;
  var password = req.body.password;
  
  //attempt to pull user from database
  db.users.find({user: username, password: password}).toArray(function (err, peeps) {
    if (peeps.length > 0) {
      
      
      //set currUser to user based on search in user array

      db.users.find({user:username}).toArray(function(err,peeps){

       		currUser = peeps[0];
          console.log(currUser.user);
       		//check if filled out
          if (currUser.filledOut){
            
            //run ranking algorithm, retrieve matches from db.matches
            rankingAlgy(username);
            var matchArray;
            var pos;
       			db.matches.find({user: username}).toArray(function(err, data){
       				matchArray = data[0].yes;
              pos = data[0].pos
              
  					  var firstMatches = matchArray.slice(pos,pos+5);
  					  
              var username = currUser.user;
  					  var groups = currUser.groups;
              
              //res.json(firstMatches);
  					  
              //Redirect to matches page
              res.render("matches", {users: firstMatches, username: username, groups: groups});
            });
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

      	//Add to users database
        db.users.insert({user: username, password: password, email: email, filledOut:false}, function(err){
          
          //Pull user from database
          db.users.find({user:username}).toArray(function(err,peeps){
            //Set currUser
            currUser = peeps[0];
            
            //Add to matches database
            db.matches.insert({user: username, yes: [], no: [username], pos: 0}, function(err) {
              res.render("signup", {title: "Closer"});
            });
          });
      	});
       
      	  
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
        discoverable: true

      }
      
    }

	);

	res.render("userpage", {title: "Closer", user: currUser});
  

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
  var username = currUser.user;
  db.matches.update(
      {user: username},
      {$set: {pos: 0}}
	var currUser = null;

	res.redirect("/");

	
});

//UPDATE INFO -- FORM ON USERPAGE
router.post("/update/:username", function(req, res, next) {
  var username = req.params.username
  db.users.update(
    { user: username },
    {
      $set: {
        college: req.body.college,
        year: req.body.year,
        courses: req.body.courses,
        bio:req.body.bio,
        discoverable: req.body.discoverable

      }
      
    }

  );

  //run ranking algorithm, retrieve matches from db.matches
  rankingAlgy(username);
  var matchArray;
  var firstMatches;
  var pos;
  db.matches.find({user: username}).toArray(function(err, data){
    matchArray = data[0].yes;
    pos = data[0].pos;
  
    firstMatches = matchArray.slice(pos,pos+5);
    var username = currUser.user;

    //redirect to matches page
    res.render("matches", {users: firstMatches, username :username, groups: currUser.groups} );
  });
});

router.get("/next", function(req,res,next){
  var username = currUser.user;

	var matchArray;
  var firstMatches;
  var pos;
  db.matches.find({user: username}).toArray(function(err, data){
    matchArray = data[0].yes;
    pos = data[0].pos;
  
  
    //advance pos 5 spaces
    pos += 5;

    //update position in database
    db.matches.update(
      {user: username},
      {$set: {pos: pos}}
    );
    firstMatches = matchArray.slice(pos,pos+5);
    
  	//render matches with updated position
    res.render("matches",{users: firstMatches, username :username, groups: currUser.groups} );
  });
});

router.get("/previous", function(req,res,next){

	var username = currUser.user;

  var matchArray;
  var firstMatches;
  var pos;
  db.matches.find({user: username}).toArray(function(err, data){
    matchArray = data[0].yes;
    pos = data[0].pos;
  
    //return pos 5 spaces
    pos -= 5;

    //update position in database
    db.matches.update(
      {user: username},
      {$set: {pos: pos}}
    );
    firstMatches = matchArray.slice(pos,pos-5);

    //render matches with updated position
  	res.render("matches",{users: firstMatches, username :username, groups: currUser.groups} );
  });
  
});

router.get("/search", function(req,res,next){

	var username = currUser.user;
	res.render("search", {title: "Closer", username: username,

		});

		
});

// Send user to userpage when they click to see their profile
router.get("/userview/:username", function(req, res, next) {
  var username = req.params.username;
  res.render("userpage", {title: "Closer", user: currUser });
});



// Send user to matches page when they are on user page and click "Home"
router.get("/home/:username", function(req, res, next) {
  var username = req.params.username;
  while(!rankingAlgy(username)) {
    console.log("computing rank (dank)");
  }
  var matchArray;
  var pos;
  db.matches.find({user: username}).toArray(function(err, data){
    matchArray = data[0].yes;
    pos = data[0].pos
    
    var firstMatches = matchArray.slice(pos,pos+5);
    var groups = currUser.groups;
    var match_objects = [];

    for(var i = 0; i < firstMatches.length; i++) {
      console.log("match " + firstMatches[i]);
      db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
        match_objects.push(data[0]);
        if( match_objects.length === firstMatches.length ) {
          res.render("matches", {users: firstMatches, username: username, groups: groups});
          //res.json(match_objects);
        };
      });
    };
    
  });  
});

module.exports = router;
