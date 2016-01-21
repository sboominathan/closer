var db = require("./db-setup");
var finished = false;
//algorithm takes username, updates db.matches, in a somewhat ranked way.
var rankingAlgy = function (username, callback) {
	var user_Ob;
	db.users.find({user: username}).toArray(function(err, data) {
		user_Ob = data[0];
		
		var users;
		db.users.find().toArray( function(err, data) {

			users = data;
			

			var user_rejects;
			db.matches.find({user: username}).toArray(function(err, data) {
				user_rejects = data[0].no;
				console.log(user_rejects);
				console.log("rejects are above")

				var bin_gfour = [];
				var bin_four = [];
				var bin_three = [];
				var bin_two = [];
				var bin_one = [];
				var overall = [];
				

				//loop through users
				var main_classes = user_Ob.courses;
				console.log(main_classes);
				for(var i = 0; i < users.length; i ++) {
					var common_classes = 0;
					//Checks if user is discoverable
					if(users[i].discoverable && users[i].user != username) {
						//Checks if college is the same == Main Filter
						//!!!!Add && not in rejects pile

						console.log((user_rejects.indexOf(users[i].user)>-1));
						if( (users[i].college == user_Ob.college) && !(user_rejects.indexOf(users[i].user)>-1) ) {
							console.log("match has been found")
							var us_classes = users[i].courses;
							
							for(var j = 0; j< main_classes.length; j++) {
								for(var k = 0; k < us_classes.length; k++) {
									//Checks if two classes are the same

									if(us_classes[k] === main_classes[j]) {
										//increment common classes
										common_classes ++;

									}
								}
							}
							console.log("Reached Filter Part of Algorithm");
							//Filters users into bins by # of common classes
							//>4
							
							if(common_classes > 4) {
								bin_gfour.push(users[i].user);
							}
							
							//Everything less or equal to 4
							switch(common_classes) {
								case 4:
									bin_four.push(users[i].user);
									break;
								case 3:
									bin_three.push(users[i].user);
									break;
								case 2:
									bin_two.push(users[i].user);
									break;
								case 1:
									bin_one.push(users[i].user);
									break;
								default:
									break;
							};
						}
					}
				};
				//Link the bins up back to back
				
				overall = bin_gfour.concat(bin_four);
				overall = overall.concat(bin_three);
				overall = overall.concat(bin_two);
				overall = overall.concat(bin_one);

				console.log(overall);
				//update db with user = username, yes = overall = array of USERNAMES
				db.matches.update(
					{user: username},
					{$set: {yes: overall}}
				, function () {
					callback();
				});
			});
		});
	});
};

module.exports = rankingAlgy;