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

				var bin_gfour = [];
				var bin_four = [];
				var bin_three = [];
				var bin_two = [];
				var bin_one = [];
				var overall = [];
				

				//loop through users
				var main_classes = user_Ob.courses;
				for(var i = 0; i < users.length; i ++) {

					//Checks if user is discoverable
					if(users[i].discoverable) {
						//Checks if college is the same == Main Filter
						//!!!!Add && not in rejects pile
						if( (users[i].college == user_Ob.college) && !(users[i].user in user_rejects) ) {
							var common_classes = 0;
							var us_classes = users[i].courses;
							for(var match_class in main_classes) {
								for(var user_class in main_classes) {
									//Checks if two classes are the same
									if(user_class == match_class) {
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