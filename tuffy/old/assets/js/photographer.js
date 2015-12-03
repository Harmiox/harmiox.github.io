$(document).ready(function() {
	
	Shadowbox.init({
	    // skip the automatic setup again, we do this later manually
	    skipSetup: true
	});
	
	Shadowbox.setup("a.thumbnail");
	
	// get the first collection
	var $thumbnails = $('#thumbnails');
	
	// clone thumbnails to get a second collection
	var $data = $thumbnails.clone();
	
	// attempt to call Quicksand on every click
	$('.filter-nav li a').live('click', function(e) {
	
		var thisid = $(this).attr('data-id');
		
		if (thisid == 'all') {
		  var $filteredData = $data.find('li');
		} else {
		  var $filteredData = $data.find('li[data-type=' + thisid + ']');
		}
		
		// finally, call quicksand
		$thumbnails.quicksand($filteredData, {
		  duration: 800,
		  easing: 'easeInOutQuad'
		}, function() {
			Shadowbox.setup("a.thumbnail");
		});
		
		$('.filter-nav li').removeClass('active');
		$(this).parent().addClass('active');
		
		return false;
	
	});
	
});