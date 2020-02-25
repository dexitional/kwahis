<% 
 if(!isset($_SESSION)){
    session_start();
 }
		  
   require_once"../class/class.php";
   $db = new DbHandler();

   if(isset($_POST)){

        		
		if(isset($_FILES['student'])){			
		
			    	$mime = $_FILES['student']['type'];
					$mimeSplitter = explode('/',$mime);
					$name = 'st'.date('Ymd').$_SESSION['SiteID'];
					$fileExt = $mimeSplitter[1];			
				    $pempath = "/shs/ad_assets/";
					$newpath = $name.'.'.$fileExt;
					$path = $pempath.$newpath;
					
					//if(!file_exists($pempath)){
						//  mkdir($newpath,0777);
					//}							 	
					
			    	if (!copy($_FILES['student']['tmp_name'],$newpath)){
                           $error = 'Error:	Could not save file	to server';	
                    }				
                
				
					include"excel_reader.php";
					$excel = new Spreadsheet_Excel_Reader($newpath);
					// $excel->read($newpath);
					 $x = 2;$rec = array();$i=0;
					
					while($x <= $excel->rowcount()){
						/*
						$A = $excel->val($x,'A');
						$B = $excel->val($x,'B');
						$C =  $excel->val($x,'C');
						$D = $excel->val($x,'D');
						$E = $excel->val($x,'E');*/						
						
						$lName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'A')) : $excel->val($x,'A');
						$fName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'B')) : $excel->val($x,'B');
						$sex = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'C')) : addslashes($excel->val($x,'C'));
						$dob = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'D')) : addslashes($excel->val($x,'D'));
						$age = get_magic_quotes_gpc() ? (int) stripslashes($excel->val($x,'E')) : (int) addslashes($excel->val($x,'E'));
						$classCode = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'F')) : addslashes($excel->val($x,'F'));
						$courseCode = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'G')) : addslashes($excel->val($x,'G'));
						$affiliation = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'H')) : addslashes($excel->val($x,'H'));
						$hall = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'I')) : addslashes($excel->val($x,'I'));
						$address = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'J')) : $excel->val($x,'J');
						$phone = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'K')) : $excel->val($x,'K');
						$email = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'L')) : $excel->val($x,'L');
						$nationality = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'M')) : $excel->val($x,'M');
						$hometown = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'N')) : $excel->val($x,'N');
						$guardian = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'O')) : $excel->val($x,'O');
						$guardianAddress = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'P')) : $excel->val($x,'P');
						$guardianPhone = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'Q')) : $excel->val($x,'Q');
						$guardianEmail = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'R')) : $excel->val($x,'R');
						$admitYear = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'S')) : $excel->val($x,'S');
												
						// Class Admission Date Calculation
						$ad = $db->getOneRecord("select * from class where SiteID = '{$_SESSION['SiteID']}' and id = '{$classCode}'");
						//$classDate = $admitDate = !is_null($ad)? $ad['admitDate'] : date('Y-m-d');
						$sd = !is_null($ad)? date('m-d',strtotime($ad['admitDate'])) : date('m-d');
						$classDate = date('Y-m-d',strtotime($admitYear."-".$sd));
						
						// Graduation Date
						$ac = $db->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and active = 1");
						$gradDate = $db->fetchYear($classDate,$ac['dateCreated']);
						$gradDate = $gradDate == 'Completed' ? date('Y-m-d',strtotime(($admitYear+3)."-".$sd)): NULL;
						
						// Student Index Number Calculation			 
						$yr = date('Y',strtotime($admitYear));
						$std = $db->getOneRecord("select studentCode from student where SiteID = '{$_SESSION['SiteID']}' and Year(classDate) = '{$yr}' order by studentCode desc");
						$studentCode =  is_null($std) ? (int) $yr.'0001' :((int) $std['studentCode']) + 1;
						
						// Date of Birth Conversion	
                        $dob = date('Y-m-d',strtotime($dob));
						
						// Password Generation
						$loginToken = md5(strtolower($studentCode));
						$password = md5(strtolower($_SESSION['settings']['sms_sender']));					
						// Calculate Graduation on Class or Year-Group of Student
			            //$gradDate = !is_null($ad)? $ad['gradDate'] : NULL;                        
                        $photo = '/shs/ad_assets/img/blank.jpg';											
						
						// Update gradDate AS NULL 
						 if(is_null($gradDate)){
						  // $as = $db->rawQuery("update student set gradDate = NULL where studentCode = '{$studentCode}' and SiteID = '{$_SESSION['SiteID']}'");
						   $q =  $db->rawQuery("INSERT INTO student(lName,fName,sex,dob,age,classCode,courseCode,affiliation,hall,address,phone,email,nationality,hometown,guardian,guardianAddress,guardianPhone,guardianEmail,classDate,admitDate,studentCode,loginToken,password,photo,active,SiteID) VALUES('{$lName}','{$fName}','{$sex}','{$dob}','{$age}','{$classCode}','{$courseCode}','{$affiliation}','{$hall}','{$address}','{$phone}','{$email}','{$nationality}','{$hometown}','{$guardian}','{$guardianAddress}','{$guardianPhone}','{$guardianEmail}','{$classDate}','{$classDate}','{$studentCode}','{$loginToken}','{$password}','{$photo}',1,'{$_SESSION['SiteID']}')");
						
						}else{
						   $q =  $db->rawQuery("INSERT INTO student(lName,fName,sex,dob,age,classCode,courseCode,affiliation,hall,address,phone,email,nationality,hometown,guardian,guardianAddress,guardianPhone,guardianEmail,classDate,admitDate,studentCode,loginToken,password,gradDate,photo,active,SiteID) VALUES('{$lName}','{$fName}','{$sex}','{$dob}','{$age}','{$classCode}','{$courseCode}','{$affiliation}','{$hall}','{$address}','{$phone}','{$email}','{$nationality}','{$hometown}','{$guardian}','{$guardianAddress}','{$guardianPhone}','{$guardianEmail}','{$classDate}','{$classDate}','{$studentCode}','{$loginToken}','{$password}','{$gradDate}','{$photo}',1,'{$_SESSION['SiteID']}')");
						 }
						 
						 $x++;
			        }
					
				  // Delete Excel file uploaded.
					 unlink($newpath);  
					
					   
				   if($excel->rowcount() > 0){
					  $_SESSION['upload_msg'] = $excel->rowcount().' Records inserted into database Successfully">';	
					  @header('location:/shs/listd');
					
				   }
				                
				  
		}
		
		
		
		
		if(isset($_FILES['user'])){			
		
			    	$mime = $_FILES['user']['type'];
					//$mimeSplitter = explode('/',$mime);
					$name = 'st'.date('Ymd').$_SESSION['SiteID'];
					//$fileExt = $mimeSplitter[1];			
				    $pempath = "/shs/ad_assets/";
					$newpath = $name.'.xls';
					$path = $pempath.$newpath;
					
					//if(!file_exists($pempath)){
						//  mkdir($newpath,0777);
					//}							 	
					
			    	if (!copy($_FILES['user']['tmp_name'],$newpath)){
                           $error = 'Error:	Could not save file	to server';	
                    }				
                
				
					include"excel_reader.php";
					$excel = new Spreadsheet_Excel_Reader($newpath);
					// $excel->read($newpath);
					 $x = 2;$rec = array();$i=0;
					
					while($x <= $excel->rowcount()){
						/*
						$A = $excel->val($x,'A');
						$B = $excel->val($x,'B');
						$C =  $excel->val($x,'C');
						$D = $excel->val($x,'D');
						$E = $excel->val($x,'E');*/	
						
						$usercode = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'A')) : $excel->val($x,'A');
						$lName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'B')) : $excel->val($x,'B');
						$fName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'C')) : $excel->val($x,'C');						
						$dob = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'D')) : addslashes($excel->val($x,'D'));					
						$qualification = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'E')) : addslashes($excel->val($x,'E'));						
						$address = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'F')) : $excel->val($x,'F');
						$mobile = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'G')) : $excel->val($x,'G');
						$phone = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'H')) : $excel->val($x,'H');
						$email = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'I')) : $excel->val($x,'I');
						$deptcode = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'J')) : $excel->val($x,'J');
						$hometown = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'K')) : $excel->val($x,'K');
						$privilege = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'L')) : $excel->val($x,'L');
						
						// Date of Birth Conversion	
                        $dob = date('Y-m-d',strtotime($dob));
						// Password Generation						
						$password = md5(strtolower($_SESSION['settings']['sms_sender']));	
                        $photo = '/shs/ad_assets/img/blank.jpg';						
												
						$q =  $db->rawQuery("INSERT INTO user(usercode,lName,fName,dob,qualification,address,phone1,phone2,email,deptcode,hometown,privilege,password,photo,dateCreated,active,SiteID) VALUES('{$usercode}','{$lName}','{$fName}','{$dob}','{$qualification}','{$address}','{$mobile}','{$phone}','{$email}','{$deptcode}','{$hometown}','{$privilege}','{$password}','{$photo}',NOW(),1,'{$_SESSION['SiteID']}')");
												
						$x++;
			        }
					
				  // Delete Excel file uploaded.
					 unlink($newpath);  
					
					   
				   if($excel->rowcount() > 0){
					  $_SESSION['upload_msg'] = $excel->rowcount().' Records inserted into database Successfully">';	
					  @header('location:/shs/searchuser?searchuser=');
				   }
				  
		}
		
		
		
		
		
		
			if(isset($_FILES['classubj'])){			
		
			    	$mime = $_FILES['classubj']['type'];
					$mimeSplitter = explode('/',$mime);
					$name = 'rs'.date('Ymd').$_SESSION['SiteID'];
					$fileExt = $mimeSplitter[1];			
				    $pempath = "/shs/ad_assets/";
					$newpath = $name.'.'.$fileExt;
					$path = $pempath.$newpath;
					
					//if(!file_exists($pempath)){
						//  mkdir($newpath,0777);
					//}							 	
					//var_dump($_FILES['classubj']['tmp_name']);exit;
			    	if (!copy($_FILES['classubj']['tmp_name'],$newpath)){
                           $error = 'Error:	Could not save file	to server';	
                    }				
                
				
					include"excel_reader.php";
					$excel = new Spreadsheet_Excel_Reader($newpath);
					// $excel->read($newpath);
					 $x = 2;$rec = array();$i=0;
					
					while($x <= $excel->rowcount()){
						/*
						$A = $excel->val($x,'A');
						$B = $excel->val($x,'B');
						$C =  $excel->val($x,'C');
						$D = $excel->val($x,'D');
						$E = $excel->val($x,'E');*/	
						
						$studentCode = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'A')) : $excel->val($x,'A');
						$lName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'B')) : $excel->val($x,'B');
						$fName = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'C')) : $excel->val($x,'C');						
						$classScore = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'D')) : addslashes($excel->val($x,'D'));					
						$examScore = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'E')) : addslashes($excel->val($x,'E'));	
                        $id = get_magic_quotes_gpc() ?  stripslashes($excel->val($x,'I')) : addslashes($excel->val($x,'I'));							
						
						// Date of Birth Conversion	
                        $totalScore = $classScore+$examScore;
						$classCode = $_POST['classCode'];
                        $subjectCode = $_POST['subjectCode'];							
																	
						//$q =  $db->rawQuery("UPDATE temp set classScore = '{$classScore}',examScore = '{$examScore}',totalScore = '{$totalScore}' where id = '{$id}' or (academ = '{$_SESSION['settings']['academ']}' and subjectCode = '{$subjectCode}' and studentCode = '{$studentCode}')");
						$q =  $db->rawQuery("UPDATE temp set classScore = '{$classScore}',examScore = '{$examScore}',totalScore = '{$totalScore}' where SiteID = '{$_SESSION['SiteID']}' and id = '{$id}'");
					                 				
						$x++;
			        }
					
				  // Delete Excel file uploaded.
					 unlink($newpath);  
					
					   
				   if($excel->rowcount() > 0){
					  $_SESSION['upload_msg'] = $excel->rowcount().' Results updated Successfully">';	
					  @header('location:/shs/assessment/'.$classCode.'/'.$_SESSION['settings']['academ'].'/'.$subjectCode);
					
				   }				  
		}
							
							
   }
%>
                             
