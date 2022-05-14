$(document).ready(function(){

	$('#searchForm').submit(function(){
		if($('#search').val() !== '' ){
			window.location = $(this).data('path') + './search:' + $('#search').val();
		}
	});
});