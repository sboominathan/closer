$(document).ready(function(){

	// Logo Animation

	if ($(".message").text()=="" && $(".message2").text() ==""){
		$(".letter-C").delay(500).animate({left: '308px'}, 2000);
		$(".letter-L").delay(500).animate({left: '186px'}, 2000);
		$(".letter-O").delay(500).animate({left: '62px'}, 2000);
		$(".letter-S").delay(500).animate({right: '47px', width: '90px', bottom: '16px'}, 2000);
		// $(".letter-E").animate({right: '126px', width: '60px', bottom: '32px'}, 2000);
		$(".letter-E").delay(500).animate({opacity: '0'}, 2000);
		$(".letter-R").delay(500).animate({opacity: '0'}, 2000); 


		$(".title").delay(2500).animate({opacity: '1'}, 2000);
		$(".subtitle").delay(3500).animate({opacity: '1'}, 2500);

	}

	else{
		$(".letter-C").animate({left: '310px'}, 0);
		$(".letter-L").animate({left: '186px'}, 0);
		$(".letter-O").animate({left: '62px'}, 0);
		$(".letter-S").animate({right: '47px', width: '90px', bottom: '16px'}, 0);
		$(".letter-E").animate({opacity: '0'}, 0);
		$(".letter-R").animate({opacity: '0'}, 0);
		$(".title").animate({opacity: '1'}, 0);
		$(".subtitle").animate({opacity: '1'}, 0);
	}

	// Various Button functions
	if ($(".message").text()!=""){

		$(".log-in-form").css("opacity", "1");
		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none");
		$("#secret").css("background", "black")

	}

	if ($(".message2").text()!=""){

		$(".sign-up-form").css("opacity", "1");
		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none");
		$("#secret2").css("background", "black")


	}

	$(".log-in-button").click( function() {
		
		$(".log-in-form").delay(100).animate({ opacity: 0.85}, 500);

		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none");
		$("#username-email").focus();
	});


	$(".sign-up-button").click( function() {

		$(".sign-up-form").delay(100).animate({ opacity: 0.85}, 500);
		$(".sign-up-form").css("display", "block");
		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none");
		$("#username").focus();
	});

	$(".no-account").click(	function() {
		$(".log-in-form").css("opacity", "0");
		$(".sign-up-form").delay(100).animate({ opacity: 0.85}, 500);
		$("#username").focus();
	});

	$(".yes-account").click( function() {
		$(".sign-up-form").css("opacity", "0");
		$(".log-in-form").delay(100).animate({ opacity: 0.85}, 500);
		$("#username-email").focus();
	});

	$(".btn-cancel-action").click( function(e) {
		e.preventDefault();
		
		$(".log-in-form").delay(0).animate({ opacity: 0}, 125);
		$(".sign-up-form").delay(0).animate({ opacity: 0}, 125);
		$(".log-in-button").css("display", "block");
		$(".sign-up-button").css("display", "block");
	});

	$("#login").on("keydown", "input", function(e) {
		if (e.keyCode == 13){
			$("#login").submit();
		}
	});

	$("#signup").on("keydown", "input", function(e) {
		if (e.keyCode == 13){
			$("#signup").submit();
		}
	});

	$("#username-email").mouseover(function(e){

		$("#username-email").select();

	})

});