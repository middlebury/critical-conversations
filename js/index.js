// $( document ).ready(function() {

	// $( ".menu-close" ).hide();
	// 	// $( ".menu" ).hide();
	// 	$( ".menu-open" ).click(function() {
	// 		$( ".menu" ).slideToggle( 250, function() {
	// 		$( ".menu-open" ).hide();
	// 		$( ".menu-close" ).show();
	// 		});
	// 	});

	// $( ".menu-close" ).click(function() {
	// 	$( ".menu" ).slideToggle( 250, function() {
	// 		$( ".menu-close" ).hide();
	// 		$( ".menu-open" ).show();
	// 		$(".menu-open").css("display","");
	// 	});
	// });

// });
//on click of menu hamburger
$(".menu-open").click(function(){
  //expands menu
  $(".nav-primary").toggleClass("active-menu");

})
