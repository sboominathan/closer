// $.stellar({
//     horizontalScrolling: false,
//     responsive: true
// });

$(document).ready( function() {
	// Logo Animation
	$(".letter-C").delay(500).animate({left: '310px'}, 2000);
	$(".letter-L").delay(500).animate({left: '186px'}, 2000);
	$(".letter-O").delay(500).animate({left: '62px'}, 2000);
	$(".letter-S").delay(500).animate({right: '47px', width: '90px', bottom: '16px'}, 2000);
	// $(".letter-E").animate({right: '126px', width: '60px', bottom: '32px'}, 2000);
	$(".letter-E").delay(500).animate({opacity: '0'}, 2000);
	$(".letter-R").delay(500).animate({opacity: '0'}, 2000);
	$(".title").delay(2500).animate({opacity: '1'}, 2000);
	$(".subtitle").delay(3500).animate({opacity: '1'}, 2500);
});