$(document).ready(function(){


$(".log-in-button").click(

	function(){
		$(".log-in-form").css("display", "block");
		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none")

	}
)

$(".sign-up-button").click(

	function(){
		$(".sign-up-form").css("display", "block");
		$(".log-in-button").css("display", "none");
		$(".sign-up-button").css("display", "none")

	}
)

$(".no-account").click(
	function(){
		$(".log-in-form").css("display", "none");
		$(".sign-up-form").css("display", "block");
	}

	)

$(".yes-account").click(
	function(){
		$(".log-in-form").css("display", "block");
		$(".sign-up-form").css("display", "none");
	}

	)

$(".btn-cancel-action").click(
	function(e){
		e.preventDefault();
		$(".log-in-form").css("display", "none");
		$(".sign-up-form").css("display", "none");
		$(".log-in-button").css("display", "block");
		$(".sign-up-button").css("display", "block")

	}

	)

$("#login").on("keydown", "input", function(e){

	if (e.keyCode == 13){
		$("#login").submit();
	}
});

$("#signup").on("keydown", "input", function(e){

	if (e.keyCode == 13){
		$("#signup").submit();
	}
});

})