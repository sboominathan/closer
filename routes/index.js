var express = require('express');
var router = express.Router();

var db = require("../db-setup");
var rankingAlgy = require("../matches_handler");



/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.session && req.session.user){

    var currUser = req.session.user;
    var username = currUser.user;
    db.users.find({user: username}).toArray(function(err, data){

      if (data.length > 0){

        res.redirect("/home/" + username);
      }

    })

  }
  else{
  res.render('index', { title: 'Closer' });
}
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
          req.session.user = peeps[0]

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
                if (firstMatches.length==0){
                res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
            	}

                for(var i = 0; i < firstMatches.length; i++) {
                  console.log("match " + firstMatches[i]);
                  db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
                    match_objects.push(data[0]);
                    
                    //Check if match_objects contains all user objects referred to in first matches.
                    if( match_objects.length === firstMatches.length ) {
                      //Redirect to matches page

                      res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
                    };
                  });

                };
              });
            });
       		}
       		else{
       			res.render("signup", {title: "Closer", username: username});
       		}
      	});
      }
      else {
        res.render("index", {title: "Closer", username: username, message: "Sorry, your username/password combination is incorrect!"});
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
     res.render("index", {title: "Closer", username: username, message2: "Sorry, that username is already taken!" }); //render index page with notification that the username has already been taken
      }
     else if (password == passwordcheck) { 

      	//Add to users database
        db.users.insert({user: username, password: password, email: email, filledOut:false}, function(err){
          
          //Pull user from database
          db.users.find({user:username}).toArray(function(err,peeps){
            //Set currUser
            var currUser = peeps[0];
            
            //Add to matches database
            db.matches.insert({user: username, yes: [], no: [], pos: 0}, function(err) {
              res.render("signup", {title: "Closer", username: username});
            });
          });
      	});
       
      	  
      }

      else{

        res.render("index", {title: "Closer", username: username, message2: "Your passwords don't match!" }); 

      }
    
     });

});

////////////////////////////////


router.post("/userinfo/:username", function(req,res,next){
  //retrieve user object
  var username = req.params.username;
  db.users.find({user:username}).toArray(function(err, data) {
    var currUser = data[0];
    req.session.user = currUser;

    
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
          discoverable: true,
          notifications: []

        }
      } , function(err){

        res.render("welcome", {title: "Closer", username: username});
      }
        
  	);
  	//Render Userpage
    
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
  req.session.reset();
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
        courses: req.body.option,
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

        if (firstMatches.length==0){
                res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
              }

        for(var i = 0; i < firstMatches.length; i++) {
          console.log("match " + firstMatches[i]);
          db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
            match_objects.push(data[0]);
            
            //Check if match_objects contains all user objects referred to in first matches.
            if( match_objects.length === firstMatches.length ) {
              //Redirect to matches page
              res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
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
      if (pos+5<matchArray.length){
       pos +=5 ;
     }

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
            res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});

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
      if (pos!=0){
        pos -= 5;
      }

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
            //Render matches
            res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});

          };
        });
      };
    });
  });
});


// Send user to userpage when they click to see their profile - FIXED CURRUSER PROBLEM
router.get("/userview/:username", function(req, res, next) {

	var username = req.params.username;
	db.users.find({user:username}).toArray(function(err, data){
		var user = data[0];
		var courses = user.courses;
		if (typeof courses == "string"){
			courses = [courses];
		}
		res.render("userpage", {title: "Closer", user: user, courses: courses});
	});
	
  //var username = currUser.user;
  

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

        if (firstMatches.length==0){
                res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
              }

        //retrieve match objects given array of match names
        for(var i = 0; i < firstMatches.length; i++) {
          console.log("match " + firstMatches[i]);
          db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
            match_objects.push(data[0]);
            
            //Check if match_objects contains all user objects referred to in first matches.
            if( match_objects.length === firstMatches.length ) {
              res.render("matches", {users: match_objects, username: username, groups: groups, user: currUser});

            };
          });
        };
      });   
    });
    
  });

});
///////////////////////////////////////////////////////////

//SENDS INVITE TO USER TO JOIN NEW GROUP

router.post("/create/:username", function(req,res,next){

	var invitedUser = req.params.username;
	var invitingUser=  req.body.invitername;
	var groupName = req.body.groupname;
	var subject = req.body.subject;
	db.users.find({user:invitedUser}).toArray(function(err, data){
		var currNotifs = data[0].notifications
		currNotifs.push({"user": invitingUser, "groupName": groupName, "subject": subject });
		db.users.update({user:invitedUser},{$set:{notifications: currNotifs}});
		res.redirect("/home/"+invitingUser);
		

	})


});

/////////////////////////////////////////////

//SENDS INVITE TO USER TO JOIN EXISTING GROUP
router.post("/createold/:username", function(req,res,next){


	var invitedUser = req.params.username;
	var invitingUser=  req.body.invitername;
	var groupName = req.body.groupname;
	var subject = req.body.subject;

});


//LISTS NOTIFICATIONS FOR A GIVEN USER


router.get("/notifications/:username", function(req,res,next){

	var username = req.params.username;
	db.users.find({user: username}).toArray(function(err,data){

		var notifs = data[0].notifications;
		var user = data[0]
		res.render("notifications", {username: username, notifs: notifs, user: user})

	})

})

//////////////////////////////////////////



//INVITED USER ACCEPTS REQUEST TO JOIN NEW OR OLD GROUP

router.post("/newgroup/:username", function(req,res,next){

	var username = req.params.username; //user responding to notification
	var  invitingUser=  req.body.invitername; //user who sent the invite
	var groupName = req.body.groupname; //name of group being created
	var subject = req.body.subject
	db.users.find({user: username}).toArray(function(err,data){

		var groups = data[0].groups; //updating groups field of user responding after acceptance
		groups.push({"groupName": groupName, "subject": subject});
		db.users.update({user: username}, {$set:{groups: groups}});

		db.groups.find({"groupName": groupName}).toArray(function(err,data){

			if (data.length==0){

				db.groups.insert({"groupName": groupName, "userList": [invitingUser, username], "chat": []});
			}

			else{

				userlist = data[0].userList;
				userlist.push(username);
				db.groups.update({"groupName": groupName}, {$set :{"userList": userlist }});

			}
			
		})
		

		db.users.find({user: invitingUser}).toArray(function(err,peeps){

			var inviteGroups = peeps[0].groups;
			inviteGroups.push({"groupName": groupName, "subject": subject});
			db.users.update({user: invitingUser}, {$set:{groups: inviteGroups}});

		})


		var notifs = data[0].notifications;
		for (var i = 0; i< notifs.length;i++){
			if (notifs[i].user === invitingUser){

				notifs.splice(i,1);
			}

		}

		if (notifs == null){notifs = []};
		db.users.update({user:username},{$set:{notifications: notifs}});
		var notifs = data[0].notifications;

		res.render("notifications", {username: username, notifs: notifs, user: data[0] })

	})

});

//////////////////////////////////////////////////////

//INVITED USER DECLINES REQUEST TO JOIN NEW OR OLD GROUP

router.post("/removegroup/:username", function(req,res,next){

	var username = req.params.username;
	var invitingUser=  req.body.invitername; 

	db.users.find({user: username}).toArray(function(err, data){

		var notifs = data[0].notifications;
		if (notifs == null){notifs = [];}
		for (var i = 0; i< notifs.length;i++){
			if (notifs[i].user === invitingUser){

				notifs.splice(i,1);
			}

		}

		if (notifs == null){notifs = []};
		db.users.update({user:username},{$set:{notifications: notifs}});
		var notifs = data[0].notifications;

		res.render("notifications", {username: username, notifs: notifs, user: data[0] })

	})

	

});

////////////////////

// LIST OF ALL GROUPS FOR USER CURRENTLY LOGGED IN

router.get("/groupList/:username", function(req,res,next){

	var username = req.params.username

	db.users.find({user: username}).toArray(function(err, data){

		var userGroups = data[0].groups;
		console.log(userGroups);
	
		

		res.render("groupList", {username: username, groupList: userGroups, user: data[0]})

	})

})

////////////////////


router.get("/groups/:username/:groupName", function(req,res,next){

	var username = req.params.username;
	var groupName = req.params.groupName;

	db.users.find({user: username}).toArray(function(err, data){

		var user = data[0];
		db.groups.find({groupName: groupName}).toArray(function(err, peeps){

			var chatHistory = peeps[0].chat;
      var groupMembers = peeps[0].userList;
			res.render("groups", {groupName: groupName, username: username, user: data[0], chatHistory: chatHistory, groupMembers: groupMembers});

		})
		
	})
	

});

//USER CHOOSES 'NOT INTERESTED' FOR A CERTAIN MATCH IN THEIR LIST

router.get("/removeUser/:username/:removingUser", function(req,res,next){

  var username = req.params.username;
  var removingUser = req.params.removingUser;

  console.log("yo");

  db.users.find({user: username}).toArray(function(err, peeps){

    var currUser = peeps[0];


    db.matches.find({user: username}).toArray(function(err, data){
      console.log("hi");
      var matchArray = data[0].yes;
      var noMatchArray = data[0].no;
      var pos = data[0].pos;
      console.log(matchArray);
      var index = matchArray.indexOf(removingUser);
     matchArray.splice(index, 1);
      console.log(matchArray);
     noMatchArray.push(removingUser);
      console.log(noMatchArray);
      db.matches.update({user: username}, 
        {$set: {yes: matchArray, no: noMatchArray}});

      firstMatches = matchArray.slice(pos,pos+5);

          //retrieve match objects given array of match names
          var match_objects = [];

          if (firstMatches.length==0){
                  res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
                }

          for(var i = 0; i < firstMatches.length; i++) {
            console.log("match " + firstMatches[i]);
            db.users.find({user: firstMatches[i]}).toArray(function(err, data) {
              match_objects.push(data[0]);
              
              //Check if match_objects contains all user objects referred to in first matches.
              if( match_objects.length === firstMatches.length ) {
                //Redirect to matches page
                res.render("matches", {users: match_objects, username: username, groups: currUser.groups, user: currUser});
              };
            });
          };



    })
  })

})



module.exports = router;
