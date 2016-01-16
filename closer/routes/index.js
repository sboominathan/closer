var express = require('express');
var router = express.Router();
var db = require("../db-setup");
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

       		var currUser = peeps[0];
          console.log(currUser.user);
       		//check if filled out
          if (currUser.filledOut){
            
            //run ranking algorithm, retrieve matches from db.matches
            rankingAlgy(username, function() {

              var matchArray;
              var pos;
         			db.matches.find({user: username}).toArray(function(err, data){
         				matchArray = data[0].yes;
                pos = data[0].pos
                
    					  var firstMatches = matchArray.slice(pos,pos+5);
    					  
                var username = currUser.user;
    					  var groups = currUser.groups;
                
                //retrieve match objects given array of match names
                var match_objects = [];
                for(var i = 0; i < firstMatches.length; i++) {
                  console.log("match " + firstMatches[i]);
                  db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
                    match_objects.push(data[0]);
                    
                    //Check if match_objects contains all user objects referred to in first matches.
                    if( match_objects.length === firstMatches.length ) {
                      //Redirect to matches page
                      res.render("matches", {users: match_objects, username: username, groups: currUser.groups});
                    };
                  });
                };
              });
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
            var currUser = peeps[0];
            
            //Add to matches database
            db.matches.insert({user: username, yes: [], no: [username], pos: 0}, function(err) {
              res.render("signup", {title: "Closer", username: username});
            });
          });
      	});
       
      	  
      }
    
     });

});

////////////////////////////////

router.post("/userinfo/:username", function(req,res,next){
  //retrieve user object
  var username = req.params.username;
  db.users.find({user:username}).toArray(function(err, data) {
    var currUser = data[0];
    
    //retrieve request Info.
  	var first = req.body.firstname;
  	var last = req.body.lastname;
  	var college = req.body.college;
  	var year = req.body.year;
  	var gender = req.body.gender;
  	var courses = req.body.option;
  	var bio = req.body.bio;
  	
    //Update user object with new info.
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
  	//Render Userpage
    res.render("userpage", {title: "Closer", user: currUser});
  });
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

router.get("/logout/:username", function(req,res,next){
	//Retrieve Username from url request
  var username = req.params.username;
  console.log("Logging " + username + " out");
  db.users.find({user: username}).toArray( function(err, data) {
    //Reset Matches
    db.matches.update(
      {user: username},
      {$set: {pos: 0}}
    );
    res.redirect("/");
  });
});

//UPDATE INFO -- FORM ON USERPAGE
router.post("/update/:username", function(req, res, next) {
  var username = req.params.username;
  var disc = (req.body.discoverable === "Yes");

  db.users.update(
    { user: username },
    {
      $set: {
        college: req.body.college,
        year: req.body.year,
        courses: req.body.courses,
        bio:req.body.bio,
        discoverable: disc
      }
      
    }

  );

  //run ranking algorithm, retrieve matches from db.matches
  rankingAlgy(username, function() {

    var matchArray;
    var firstMatches;
    var pos;
    db.users.find({user: username}).toArray( function(err, data) {
      var currUser = data[0];

      db.matches.find({user: username}).toArray(function(err, data){
        matchArray = data[0].yes;
        pos = data[0].pos;
      
        firstMatches = matchArray.slice(pos,pos+5);

        //retrieve match objects given array of match names
        var match_objects = [];
        for(var i = 0; i < firstMatches.length; i++) {
          console.log("match " + firstMatches[i]);
          db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
            match_objects.push(data[0]);
            
            //Check if match_objects contains all user objects referred to in first matches.
            if( match_objects.length === firstMatches.length ) {
              //Redirect to matches page
              res.render("matches", {users: match_objects, username: username, groups: currUser.groups});
            };
          });
        };
      });
    });
  });
});

router.get("/next/:username", function(req,res,next){
  //Retrieve Username from req.
  var username = req.params.username;

  //Find user Object in DB
  db.users.find({user: username}).toArray( function(err, data) {
    var currUser = data[0];

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
      
      //retrieve match objects given array of match names
      var match_objects = [];
      for(var i = 0; i < firstMatches.length; i++) {
        console.log("match " + firstMatches[i]);
        db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
          match_objects.push(data[0]);
          
          //Check if match_objects contains all user objects referred to in first matches.
          if( match_objects.length === firstMatches.length ) {
            //Render matches page
            res.render("matches", {users: match_objects, username: username, groups: currUser.groups});
          };
        });
      };
    });
  });
});

router.get("/previous/:username", function(req,res,next){
  //retrieve Username from req.
	var username = req.params.username;

  //Find user Object in database
  db.users.find({user: username}).toArray(function(err, data) {
    var currUser = data[0];

    //Find Matches
    var matchArray;
    var firstMatches;
    var pos;
    db.matches.find({user: username}).toArray(function(err, data){
      matchArray = data[0].yes;
      pos = data[0].pos;

      //Return User 5 spaces
      pos -= 5;

      //update position in database
      db.matches.update(
        {user: username},
        {$set: {pos: pos}}
      );
      firstMatches = matchArray.slice(pos,pos-5);

      //retrieve match objects given array of match names
      var match_objects = [];
      for(var i = 0; i < firstMatches.length; i++) {
        console.log("match " + firstMatches[i]);
        db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
          match_objects.push(data[0]);
          
          //Check if match_objects contains all user objects referred to in first matches.
          if( match_objects.length === firstMatches.length ) {
            //Render matches
            res.render("matches", {users: match_objects, username: username, groups: currUser.groups});
          };
        });
      };
    });
  });
});

// Send user to userpage when they click to see their profile
router.get("/userview/:username", function(req, res, next) {
  var username = req.params.username;
  db.users.find({user: username}).toArray(function(err, data) {
    var currUser = data[0];
    res.render("userpage", {title: "Closer", user: currUser });
  });
});



// Send user to matches page when they are on user page and click "Home"
router.get("/home/:username", function(req, res, next) {
  var username = req.params.username;
  db.users.find({user: username}).toArray(function(err, data) {
    var currUser = data[0];

    rankingAlgy(username, function () {

      var matchArray;
      var pos;
      db.matches.find({user: username}).toArray(function(err, data){
        matchArray = data[0].yes;
        pos = data[0].pos
        
        var firstMatches = matchArray.slice(pos,pos+5);
        var groups = currUser.groups;
        var match_objects = [];

        //retrieve match objects given array of match names
        for(var i = 0; i < firstMatches.length; i++) {
          console.log("match " + firstMatches[i]);
          db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
            match_objects.push(data[0]);
            
            //Check if match_objects contains all user objects referred to in first matches.
            if( match_objects.length === firstMatches.length ) {
              res.render("matches", {users: match_objects, username: username, groups: groups});
            };
          });
        };
      });   
    });
    
  });
});

//Clicking either add to exiting group or add to group removes someone from "yes" array, adds them to no




//Clicking "not interested" adds someone to "No"

module.exports = router;
