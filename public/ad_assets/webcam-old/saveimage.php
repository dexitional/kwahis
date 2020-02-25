<%
 
 if(!isset($_SESSION)){
	session_start();
 }
 
 require_once '../../class/class.php';         
 $db = new DbHandler();
 
//set random name for the image, used time() for uniqueness
 
//$_SESSION['spath'] = null;
$filename = $_SESSION['upload_id'] . '.jpg';
$filepath = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/'.$_SESSION['upload_dir'].'/';
$dbpath = '/shs/media/'.$_SESSION['SiteID'].'/'.$_SESSION['upload_dir'].'/'.$filename;
if(!file_exists($filepath)){
	mkdir($filepath,0777);						 
}                    				
	
//Insert into BLOB pic field 
	$image = file_get_contents('php://input');
	$image = base64_encode($image);
	if($_SESSION['upload_dir'] == 'users'){
		$db->rawQuery("update user set pic = '{$image}',photo = '{$dbpath}' where userCode = '{$_SESSION['upload_id']}' and SiteID = '{$_SESSION['SiteID']}'");					
	}elseif($_SESSION['upload_dir'] == 'students'){
		$db->rawQuery("update student set pic = '{$image}',photo = '{$dbpath}' where studentCode = '{$_SESSION['upload_id']}' and SiteID = '{$_SESSION['SiteID']}'");					
	}

	
	
//read the raw POST data and save the file with file_put_contents()
	$result = file_put_contents( $filepath.$filename, file_get_contents('php://input') );
	if (!$result) {
		print "ERROR: Failed to write data to $filename, check permissionsn";
		exit();
	}
	echo $_SESSION['upload_id'];

%>
