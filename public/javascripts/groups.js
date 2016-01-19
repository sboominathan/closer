
$(document).ready(function(){
	
	/*var namespace = $("#groupName").text();
	var url = "http://localhost:4000/" + namespace;
	*/

	var connect = function (ns) {
    return io.connect(ns, {
       query: 'ns='+ns,
       resource: "socket.io"
    });
	}

	var groupName = $("#groupName").text()
	var socket = connect('https://limitless-mesa-4044.herokuapp.com/' + groupName);
	

	$('form').submit(function(){
		if ($("#m").val()!== ""){
			var message = $("#username").text()+ ": " + $('#m').val()
		    socket.emit('chat message', message);
		    
		    $('#m').val('');
		   }
		  return false;

	  });
	  socket.on('chat message', function(msg){
	    $('#messages').append($('<li>').text(msg));
	 });
});

