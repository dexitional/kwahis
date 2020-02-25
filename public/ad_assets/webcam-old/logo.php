<% 
 if(!isset($_SESSION)){
          session_start();
 }
 
 require_once '../../class/class.php';         
 $db = new DbHandler();
 
	
//var_dump($_POST);exit;
   if(isset($_POST)){

        # School Logo Upload Script	
		if(isset($_FILES['logo'])){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['logo']['type']){
					$mimeSplitter = explode('/',$mime);
					$name = 'logo';
					$fileExt = $mimeSplitter[1];
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/';
                    $folder2 = '/shs/media/'.$_SESSION['SiteID'].'/';					
					$original = $folder1.$name.'.'.$fileExt;
                    $dpath = $folder2.$name.'.'.$fileExt;					
					break;
				 }else{ $error[]="Error: Please upload image files only!";}
			}
				
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['logo']['tmp_name'],$original);					
					/*if	(!copy($_FILES['logo']['tmp_name'],$original))	{
                         $error	=	'Error:	Could not save file	to server';	
                    } */  
					//rename($original,$original);
					
					// Store Path in Session Variable
					  unset($_SESSION['settings']['logo']);
				      $_SESSION['settings']['logo'] = $dpath;
					  echo '<img src="'.$dpath.'?'.rand().'" alt="" class="sc-image logo">';
					
        }	
		
		# Signature Upload Script
		if(isset($_FILES['sign'])){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['sign']['type']){
					$mimeSplitter = explode('/',$mime);
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$name = 'sign';
					$fileExt = $mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/';
                    $folder2 = '/shs/media/'.$_SESSION['SiteID'].'/';			
					$original = $folder1.$name.'.'.$fileExt;
                    $dpath = $folder2.$name.'.'.$fileExt;					
					break;
				 }
			}
				
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['sign']['tmp_name'],$original);					
					/*if	(!copy($_FILES['logo']['tmp_name'],$original))	{
                         $error	=	'Error:	Could not save file	to server';	
                    } */  
					//rename($original,$original);
					
					// Store Path in Session Variable
				      unset($_SESSION['settings']['sign']);
					  $_SESSION['settings']['sign'] = $dpath;
					  echo '<img src="'.$dpath.'?'.rand().'" alt="" class="sc-image sign">';					
        }
		
		
		
		# Teaser Upload Script
		if(isset($_FILES['teaser'])){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['teaser']['type']){
					$mimeSplitter = explode('/',$mime);
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$name = 'teaser';
					$fileExt = $mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/';
                    $folder2 = '/shs/media/'.$_SESSION['SiteID'].'/';					
					$original = $folder1.$name.'.'.$fileExt;
                    $dpath = $folder2.$name.'.'.$fileExt;					
					break;
				 }
			}
				
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['teaser']['tmp_name'],$original);					
					/*if	(!copy($_FILES['logo']['tmp_name'],$original))	{
                         $error	=	'Error:	Could not save file	to server';	
                    } */  
					//rename($original,$original);
					
					// Store Path in Session Variable
				      unset($_SESSION['settings']['teaser']);
					  $_SESSION['settings']['teaser'] = $dpath;
					  echo '<img src="'.$dpath.'?'.rand().'" alt="" class="sc-image teaser">';					
        }
		
		
		
		# Teaser Upload Script
		if(isset($_FILES['card'])){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['card']['type']){
					$mimeSplitter = explode('/',$mime);
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$name = 'card';
					$fileExt = $mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/';
                    $folder2 = '/shs/media/'.$_SESSION['SiteID'].'/';					
					$original = $folder1.$name.'.'.$fileExt;
                    $dpath = $folder2.$name.'.'.$fileExt;					
					break;
				 }
			}
				
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['card']['tmp_name'],$original);					
					/*if	(!copy($_FILES['logo']['tmp_name'],$original))	{
                         $error	=	'Error:	Could not save file	to server';	
                    } */  
					//rename($original,$original);
					
					// Store Path in Session Variable
				      unset($_SESSION['settings']['card']);
					  $_SESSION['settings']['card'] = $dpath;
					  echo '<img src="'.$dpath.'?'.rand().'" alt="" class="sc-image card">';					
        }
		
		
		
		
		
		
		# Students Photo Upload Script
		if(isset($_FILES['std']) && $_POST['loc'] == 'students'){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['std']['type']){
					$mimeSplitter = explode('/',$mime);
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$_SESSION['upload_id'] = $name = $_POST['id'];
					$_SESSION['upload_dir'] = $_POST['loc'];
					$fileExt = $mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/'.$_POST['loc'].'/';                    				
					$original = $folder1.$name.'.'.$fileExt;                   				
					break;
				 }
			}
				 // Insert into BLOB pic field 
                    $image = file_get_contents($_FILES['std']['tmp_name']);
					$image = base64_encode($image);
					//var_dump($image);exit;
					$db->rawQuery("update student set pic = '{$image}' where studentCode = '{$_SESSION['upload_id']}' and SiteID = '{$_SESSION['SiteID']}'");					
									
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['std']['tmp_name'],$original);	

                			
				 //Redirect after saving to students page
				   @header('location:/shs/savephotouser/'.$_POST['id']);					 
        }
		
		
		
		# Users and Tutors Photo Upload Script
		if(isset($_FILES['std']) && $_POST['loc'] == 'users'){
			$allowedMIMEs = array('image/jpeg','image/gif','image/png');
			foreach($allowedMIMEs as $mime)	{
				if	($mime	==	$_FILES['std']['type']){
					$mimeSplitter = explode('/',$mime);
					$mimeSplitter[1] = $mimeSplitter[1] == 'jpeg' ? 'jpg':$mimeSplitter[1];
					$_SESSION['upload_id'] = $name = $_POST['id'];
					$_SESSION['upload_dir'] = $_POST['loc'];
					$fileExt = $mimeSplitter[1];
					$folder1 = $_SERVER['DOCUMENT_ROOT'].'/shs/media/'.$_SESSION['SiteID'].'/'.$_POST['loc'].'/';                    				
					$original = $folder1.$name.'.'.$fileExt;                   				
					break;
				 }
			}
				
				    // Insert into BLOB pic field 
                    $image = file_get_contents($_FILES['std']['tmp_name']);
					$image = base64_encode($image);
                    $db->rawQuery("update user set pic = '{$image}' where userCode = '{$_SESSION['upload_id']}' and SiteID = '{$_SESSION['SiteID']}'");					
					
					 
				
					if(!file_exists($folder1)){
						@mkdir($folder1,0777);						 
					}					
                   		 	
				 // Moving the temporary file to the originals folder:
                     @unlink($original);
                     move_uploaded_file($_FILES['std']['tmp_name'],$original);

               
								
				 //Redirect after saving to students page
				   @header('location:/shs/savephotouser/'.$_POST['id']);					 
        }
	               
   }                            
                     
%>
                        

