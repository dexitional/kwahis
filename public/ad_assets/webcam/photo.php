<% 
if(!isset($_SESSION)){
	session_start();
}

if(isset($_GET['id'])){$_SESSION['upload_id'] = $_GET['id']; $_SESSION['upload_dir'] = $_GET['loc'];}
%>

<!DOCTYPE html>
<html>
<head>
	<title>SNAPSHOT</title>
	<script src="../js/vendors/jquery/jquery-1.11.3.min.js"></script>
	<style>
		#camera_wrapper, #show_saved_img{float:left; width: 650px;}
	</style>
 
	<script type="text/javascript" src="webcam.js"></script>
	<script>
		$(function(){
			//give the php file path
			webcam.set_api_url( 'saveimage.php' );
			webcam.set_swf_url( 'webcam.swf' );
			webcam.set_quality( 100 ); // Image quality (1 - 100)
			webcam.set_shutter_sound( true ); // play shutter click sound
            
			var camera = $('#camera');
			camera.html(webcam.get_html(260, 260));
			//camera.html(webcam.get_html(200, 167));
 
			$('#capture_btn').click(function(){
				//take snap
				webcam.snap();
			});
 
			//after taking snap call show image
			webcam.set_hook( 'onComplete', function(img){
				 // $('#show_saved_img').html('<img src="' + img + '">');
				  window.opener.setData(img);
				 
				//reset camera for next shot
				  webcam.reset();
				// Close Camera Window
				  window.close();
			});
 
		});
	</script>
</head>
<body>	
	<!-- camera screen -->
	<div id="camera_wrapper">
	<div id="camera"></div>
	<br />
	<button id="capture_btn">Capture</button>
	</div>
	<!-- show captured image -->
	<div id="show_saved_img" ></div>
</body>
</html>