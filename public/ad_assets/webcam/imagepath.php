<%
 
 
 if(!isset($_SESSION)){
	session_start();
 }
  
 require_once '../../class/class.php';         
 $db = new DbHandler(); 
 
 if(isset($_GET['loc']) && $_GET['loc'] == 'usr'){
	$sl = $db->getOneRecord("select * from user where userCode = '{$_GET['id']}' and SiteID = '{$_SESSION['SiteID']}'");
	
	header("content-type:image/jpeg");
	echo $sl['pic']; 
	 
 }elseif(isset($_GET['loc']) && $_GET['loc'] == 'std'){
	$sl = $db->getOneRecord("select * from student where studentCode = '{$_GET['id']}' and SiteID = '{$_SESSION['SiteID']}'");
	header("content-type:image/jpeg");
	echo $sl['pic'];  
	 //echo '<img src="data:image;base64,'.$sl['pic'].'"/>';  
	 //var_dump($sl['pic']);
 }

 
 
 
%>
