 <%

class DbHandler {

    private $conn;

    function __construct() {
        require_once 'dbConnect.php';
        // opening db connection
           $db = new dbConnect();
           $this->conn = $db->conn;
    }
     
	
	# Initialisation of Clients Dashboards
	public function checkClient($id){
	  
	   $p = fopen($_SERVER['DOCUMENT_ROOT'].'/shs/private.lic','r') or die('Unable to open private key license!');
	   $ps = fgets($p);$px = explode(':',$ps);
	   // Connection variables
	   $host = $px[1];
	   $user = $px[2];
	   $pass = $px[3];
	   $db = $px[4];
	   $private = $px[0];
	   
	   $status = null;
	   
	   mysqli_report(MYSQLI_REPORT_STRICT | MYSQLI_REPORT_ALL);
	  // Connect to API for autentication
	  // Check if connection is online else check for offline dump key
		 //$con = new mysqli($host,$user,$pass,$db); 
		 try{
				 $con = new mysqli($host,$user,$pass,$db);			 
				 $sl = $con->query("select * from client_api where short_name = '{$private}'");
				 if($sl->num_rows > 0){
					 
					 $rs = $sl->fetch_row();
					 $status[0] = $rs['pin'];
					 $status[1]['db'] = $rs['api_db'];
					 $status[1]['user'] = $rs['api_user'];
					 $status[1]['host'] = $rs['api_host'];
					 $status[1]['pass'] = $rs['api_pass'];
					 
				 }else{
					 // Impersonation or fake client | Client doesnt exist
					 $status = null;
				 }
				 
			
		 }catch (mysqli_sql_exception $e){
			 
			//$error = $e->getMessage();
			//echo $error;
			     if(file_exists($_SERVER['DOCUMENT_ROOT'].'/shs/server_dump.lic')){
					   $p = fopen($_SERVER['DOCUMENT_ROOT'].'/shs/server_dump.lic','r') or die('Unable to open private key license!');
					   $ps = fgets($p); $px = explode(':',$ps);
					   // Connection variables
					   $status[1]['host'] = $px[1];
					   $status[1]['user'] = $px[2];
					   $status[1]['pass'] = $px[3];
					   $status[1]['db'] = $px[4];
					   $status[0] = $px[0];
					   
					   //var_dump($status);exit;
				 }else{
					  // No API File so cant initialise
					  $status = null;			 
				 }		
		 }
	/*	
        if (!$con->connect_error){
             $sl = $con->query("select * from client_api where short_name = '{$private}'");
			 if($sl->num_rows > 0){
				 
				 $rs = $sl->fetch_row();
				 $status[0] = $rs['pin'];
				 $status[1]['db'] = $rs['api_db'];
				 $status[1]['user'] = $rs['api_user'];
				 $status[1]['host'] = $rs['api_host'];
				 $status[1]['pass'] = $rs['api_pass'];
				 
			 }else{
				 // Impersonation or fake client | Client doesnt exist
				 $status = null;
			 }
			 
			 
         }elseif(file_exists($_SERVER['DOCUMENT_ROOT'].'/shs/server_dump.lic')){
			   $p = fopen($_SERVER['DOCUMENT_ROOT'].'/shs/server_dump.lic','r') or die('Unable to open private key license!');
			   $ps = fgets($p); $px = explode(':',$ps);
			   // Connection variables
			   $status[1]['host'] = $px[1];
			   $status[1]['user'] = $px[2];
			   $status[1]['pass'] = $px[3];
			   $status[1]['db'] = $px[4];
			   $status[0] = $px[0];
			   
			   var_dump($status);exit;
		 }else{
			  // No API File so cant initialise
			  $status = null;			 
		 }
	*/	 
		 return $status;
		
	}
	
	
	# Get User with username and password 
	public function getUser($username,$password) { 		    
	        $r = $this->conn->query("select * from user where SiteID = '{$_SESSION['SiteID']}' and active = 1 and userCode = '{$username}' and password = '{$password}'") or die($this->conn->error.__LINE__);        
		   	if($r->num_rows > 0){         	
				 return $result = $r->fetch_assoc();		
			}
			else{ 
			     return null;
			}		   			
    }
	
	
	public function getOneRecord($query) {
        $r = $this->conn->query($query.' LIMIT 1') or die($this->conn->error.__LINE__);
        return $result = $r->fetch_assoc();    
    }
	
	public function getAllRecord($query) {
        $r = $this->conn->query($query) or die($this->conn->error.__LINE__);
        $data = array();
		if($r->num_rows > 0){         	
		   while($rs = $r->fetch_array()){
			   $data[] = $rs;
		   }
		   return $data;		
		}
		else{ 
		   return null;
		}		   	  
    }
	
	
    public function delRecord($query) {
        return $r = $this->conn->query($query) or die($this->conn->error.__LINE__);          
    }
	
	public function rawQuery($query) {
        return $r = $this->conn->query($query) or die($this->conn->error.__LINE__);          
    }
	
	public function updateTable($obj,$table_name) {
		
		$c = (array) $obj;
		$num = count($c);
		$i = 1;
		$keys = array_keys($c);
		$columns = '';
		$values = '';
				$query = "UPDATE ".$table_name." SET ";
		foreach($keys as $desired_key){ // Check the obj received. If blank insert blank into the array.          
		   
		   if(($num-1) == $i){
				$query .= $columns.$desired_key.'=';
				$query .=  $values."'".$c[$desired_key]."'";
				//$query .= '';
			}else if($num == $i){
				$query .= '';
			}else{
				$query .= $columns.$desired_key.'=';
				$query .=  $values."'".$c[$desired_key]."',";
			}
			$i++;
		}		
				$query .= " WHERE ".$keys[$num-1]."=".$c[$keys[$num-1]];
				
		   $r = $this->conn->query($query) or die($this->conn->error.__LINE__);            
		 if ($r) {
			$new_row_id = $this->conn->affected_rows;
			return $new_row_id;
		  } else {
			 return NULL;
		  }		
				
	}

	
	
	 public function insertIntoTable($obj,$table_name) {
		
		$c = (array) $obj;
		echo $num = count($c);
		$i = 1;
		$keys = array_keys($c);
		$columns = '';
		$values = '';
				$query = "INSERT INTO ".$table_name."(";
		foreach($keys as $desired_key){ // Check the obj received. If blank insert blank into the array.          
		   
		   if($num != $i){
				$columns .= $desired_key.',';
				$values .=  "'".$c[$desired_key]."',";
			}else if($num == $i){
				$columns .= $desired_key.')';
				$values .=  "'".$c[$desired_key]."')";
			}
			$i++;
		}		
				$query .= $columns." VALUES(".$values;
			//echo $query;	
		 $r = $this->conn->query($query) or die($this->conn->error.__LINE__);            
		 if ($r) {
			$new_row_id = $this->conn->affected_rows;
			return $new_row_id;
		  } else {
			 return NULL;
		  }								
	}
	
	
	
	
	

	# Students CRUD	
    public function addStudent($data) {     
		    $data['gradDate'] = null;
	        $r = $this->conn->query("INSERT INTO student(studentCode,classCode,courseCode,fName,lName,sex,dob,age,address,phone,email,hometown,nationality,photo,guardian,guardianPhone,guardianAddress,affiliation,hall,admitDate,active,SiteID) VALUES('{$data['studentCode']}','{$data['courseCode']}','{$data['classCode']}','{$data['fName']}','{$data['lName']}','{$data['sex']}','{$data['dob']}','{$data['age']}','{$data['address']}','{$data['phone']}','{$data['email']}','{$data['hometown']}','{$data['nationality']}','{$data['photo']}','{$data['guardian']}','{$data['guardianPhone']}','{$data['guardianAddress']}','{$data['affiliation']}','{$data['hall']}','{$data['admitDate']}','{$data['active']}','{$_SESSION['SiteID']}')") or die($this->conn->error.__LINE__);        
		   	 if ($r) {
				return $this->conn->insert_id;				
			  } else {
				return NULL;
			  }	
    } 
	
	# Students CRUD	
    public function updateStudent($data) {     
		    
	        $r = $this->conn->query("UPDATE student SET studentCode = '{$data['studentCode']}',classCode = '{$data['classCode']}',courseCode = '{$data['courseCode']}',fName='{$data['fName']}',lName='{$data['lName']}',sex='{$data['sex']}',dob='{$data['dob']}',age='{$data['age']}',address='{$data['address']}',phone='{$data['phone']}',email='{$data['email']}',hometown='{$data['hometown']}',nationality='{$data['nationality']}',photo='{$data['photo']}',guardian='{$data['guardian']}',guardianPhone='{$data['guardianPhone']}',guardianAddress='{$data['guardianAddress']}',affiliation='{$data['affiliation']}',hall='{$data['hall']}',admitDate='{$data['admitDate']}',active='{$data['active']}' WHERE SiteID = '{$_SESSION['SiteID']}' and id = '{$data['id']}'") or die($this->conn->error.__LINE__);        
		   	 if ($r) {
				return $this->conn->affected_rows;				
			  } else {
				return NULL;
			  }	
    }
	
	# Current Class Year
    public function getYear($data) {     
           // Calculations for 3-years system		   
		    $start = 1; $year = null;
			
			$classDate = date_create($data);
			$academDate = date_create($_SESSION['settings']['startDate']);
			
			//$diff = abs(strtotime($_SESSION['settings']['startDate']) - strtotime($data));
			//$vs = floor($diff / (365*60*60*24));
			
			$diff = date_diff($academDate,$classDate);			
			$vs = $diff->format('%y');			
			
			if($vs < 1){
				$year = $start;
			}elseif($vs >= 1 && $vs < 2){
				$year = $start+1;
			}elseif($vs >= 2 && $vs < 3){
				$year = $start+2;
			}elseif($vs >= 3 && $vs < 4){
				$year = $start+3;
			}else{
				$year = 4;
			}			
			return ($year <= 3) ? $year : 'Completed';			
    }
	
	# Class Year From ClassDate & AcademDate
    public function fetchYear($classDate,$academDate) {     
           // Calculations for 3-years system		   
		    $start = 1; $year = null;
			
			$classDate = date_create($classDate);
			$academDate = date_create($academDate);
			
			$diff = date_diff($academDate,$classDate);			
			$vs = $diff->format('%y');			
			
			if($vs < 1){
				$year = $start;
			}elseif($vs >= 1 && $vs < 2){
				$year = $start+1;
			}elseif($vs >= 2 && $vs < 3){
				$year = $start+2;
			}elseif($vs >= 3 && $vs < 4){
				$year = $start+3;
			}else{
				$year = 4;
			}			
			return ($year <= 3) ? $year : 'Completed';		
    }
	
	
	# Get Form Status from ClassCode
    public function getForm($class) {     
        $r = $this->getOneRecord("select date_format(admitDate,'%Y') as year from class where SiteID = '{$_SESSION['SiteID']}' and id = '{$class}'");
        return $this->getYear(date('Y-m-d',strtotime($r['year'].'-09-01')));   		 
		   
    }
	
	
	# Get Form Status from ClassCode
    public function getSubjTerm() {     
        $all = null;
		$r = $this->getAllRecord("select * from class where SiteID = '{$_SESSION['SiteID']}' and gradDate IS NULL");
        		
		if(!is_null($r)){
			$k = 1;
			foreach($r as $cl){
				$subj = null;
				$cr = $this->getOneRecord("select subjArray from course where courseCode = '{$cl['courseCode']}' and SiteID = '{$_SESSION['SiteID']}'");
				$subj .= trim($cr['subjArray']);
				
				if(!is_null($cl['courseCode2'])){
					$cr2 = $this->getOneRecord("select subjArray from course where courseCode = '{$cl['courseCode2']}' and SiteID = '{$_SESSION['SiteID']}'");
					$subj .= ','.trim($cr2['subjArray']);
				}
				
				if(!is_null($cl['courseCode3'])){
					$cr3 = $this->getOneRecord("select subjArray from course where courseCode = '{$cl['courseCode3']}' and SiteID = '{$_SESSION['SiteID']}'");
					$subj .= ','.trim($cr3['subjArray']);
				}
				
				// Clean-up Subject Array
				$subj_clean = array();
				$sj = explode(",",trim($subj));
				foreach($sj as $sx){
					!empty($sx) ? $subj_clean[$sx] = $cl['id'].':'.$sx :'';
				}
				// Set New Subject Array
				$subj = implode(",",$subj_clean);
				// Append to All variable
				$all .= $subj.(count($r) == $k ? '':',');
				$k++;
			}
        }
		
        return $all;		   
    }
	
	
	
	
	
	
	# Current Class Rating
    public function getRating($total,$scheme) {     
           $r = $this->conn->query("select * from scheme where SiteID = '{$_SESSION['SiteID']}' and id = ".$scheme) or die($this->conn->error.__LINE__);
           $result = $r->fetch_assoc();
		   
		   $score = explode(',',$result['score']);$grade = explode(',',$result['grade']); $remark = explode(',',$result['remark']);
           for($i = 0; $i <= count($score); $i++){
	              $ms = explode(":",$score[$i]);
	 
			      if(isset($ms) && !is_null($ms)){
					
				   $gt = (int)$ms[0]; $lt = (int)$ms[1];
				   $sd = array();
				   //var_dump($score);exit;
				   if(($gt >= $total) && ($total >= $lt)){
						$sd[] = $grade[$i];
						$sd[]= $remark[$i];
					    return $sd;				  
				   }
				}
		   }		   
    }
	
	# Excel Export
	public function excel($query,$file) {   
                   //require "config.php";
					$Connect = mysqli_connect($_SESSION['DB_HOST'],$_SESSION['DB_USERNAME'],$_SESSION['DB_PASSWORD'],$_SESSION['DB_NAME']) ;
					$result = mysqli_query($Connect,$query) or die(mysql_error());    
					$fields = mysqli_fetch_fields($result);			
			
			
			# New Excel Script - @ Kobby Kay
			  /* 
			   // Column Names
			        $head_column = '';
					
					
					#for ($i = 0; $i < mysqli_num_fields($Connect); $i++){
					#     $head_column .= trim(mysqli_field_fields($Connect,$i)) . "\t";
					#}
					
					
					foreach($fields as $field){
						 $head_column .= $field->name."\t";
					}
					
			   // Data Population
			       $setData = '';
				   while($row = mysqli_fetch_row($result)){
						$rowData = '';
						foreach($row as $value){
							$value = '"'.$value.'"'."\t";
							$rowData .= $value;
						}
                       $setData .= trim($rowData)."\n";						
			        }
					
					//header("Content-type: application/octet-stream");    
					header("Content-type: application/xls");    
					//header("Content-type: application/vnd.ms-excel; name='excel'");    
					header("Content-Disposition: attachment; filename=".$file.".xls");  
					header("Pragma: no-cache"); 
					header("Expires: 0");
					
					echo ucwords(trim($head_column))."\n".$setData."\n";
               */

		       /*
					// load library
					require '../shs/ad_assets/php-excel/php-excel.class.php';

					// create a simple 2-dimensional array
					$data = array(
						1 => array ('Name', 'Surname'),
						     array('Schwarz', 'Oliver'),
						     array('Test', 'Peter')
					);

					// generate file (constructor parameters are optional)
					$xls = new Excel_XML('UTF-8', false, 'My Test Sheet');
					$xls->addArray($data);
					$xls->generateXML('my-test');
					
				*/	
					
					
					
					
					require '../shs/ad_assets/php-excel/Excel_Xml.php';

					$data = array();					
					
					foreach($fields as $field){						
						 $data[0][] = ucwords($field->name);
					}
							      
				   while($row = mysqli_fetch_row($result)){
						$rowData = array();
						foreach($row as $value){							
							$rowData[] = $value;
						}
                       $data[] = $rowData;						
			       }
					
					/*for ($i = 1; $i < 200; $i++) {
						$data[] = array($i, 'My test');
					}*/				

					$phpexcel = new Excel_Xml;
					$phpexcel->addWorksheet($file, $data);					
					$phpexcel->sendWorkbook($file.'.xml');

					
					
	}
	
		
	# Resolve IC Results
	
    public function resolveResult($studentCode,$subjectCode) {     
           // Calculations for 3-years system		   
		   //$c30 = rand(15,25); $e70 = rand(30,65); $t100 = $c30+$e70;
		   $c30 = 0; $e70 = 0; $t100 = $c30+$e70;
		   $r = $this->conn->query("update temp set classScore = '{$c30}',examScore = '{$e70}',totalScore = '{$t100}',studentCode ='{$studentCode}', academCode = '{$_SESSION['settings']['academ']}' ,subjectCode = '{$subjectCode}' where SiteID = '{$_SESSION['SiteID']}' and studentCode = '{$studentCode}' and subjectCode = '{$subjectCode}'");
		   if ($r) {
			  return $this->conn->affected_rows;				
		   } else {
			  return NULL;
		   }	   
   }
	
	
	# Check If Student Bill Sent/Posted
	
    public function checkBillSend($code) {     
          
		   $r = $this->conn->query("select rd.id from fees rd where rd.SiteID = '{$_SESSION['SiteID']}' and rd.BillCode = '{$code}' and rd.active = 1");
		   $data = array();
			if($r->num_rows > 0){         	
			  return true;		
			}
			else{ 
			   return false;
			}	   
   }
   
   
   # Check If Next Term Bill Sent/Posted
	
    public function checkNextBill($code) {     
          
		   $r = $this->conn->query("select bl.* from bill bl,fees rd where rd.SiteID = '{$_SESSION['SiteID']}' and bl.id = rd.BillCode and bl.academCode = '{$code}' and bl.active = 1 and rd.active = 1");
		   if($r->num_rows > 0){         	
			  return true;		
			}
			else{ 
			   return false;
			}	   
   }
	
	
      # Update Average
	
    public function saveAvg($studentCode,$academ) {     
          
		   $r = $this->conn->query("select (SUM(totalScore)/count(*)) as avg from result where SiteID = '{$_SESSION['SiteID']}' and active = 1 and studentCode = '{$studentCode}' and academCode = '{$academ}' group by academCode,studentCode");
		   if($r->num_rows > 0){         	
			  $num = $r->fetch_array();
              @$avg = round($num['avg'],2);
			 
			 // Update Performance table_name
			     $this->conn->query("update performance set classAverage = '{$avg}' where SiteID = '{$_SESSION['SiteID']}' and studentCode = '{$studentCode}' and academCode = '{$academ}'");
			}
			else{ 
			   return null;
			}	   
   }
   
   
   # Update Ranks
	
    public function updateRank($academ) {     
           
		   $rs = $this->conn->query("select distinct(classCode) from performance where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$academ}'");
		   if($rs->num_rows > 0){ 
		       while($num = $rs->fetch_assoc()){ 			   
					  $r = $this->conn->query("select * from performance where SiteID = '{$_SESSION['SiteID']}' and classCode = '{$num['classCode']}' and academCode = '{$academ}' order by classAverage DESC");
					  if($r->num_rows > 0){ 
						 $i = 1;		   
						  while($nums = $r->fetch_assoc()){             
					       // Update Performance table_name
						      $this->conn->query("update performance set classRank = '{$i}' where SiteID = '{$_SESSION['SiteID']}' and id = '{$nums['id']}'");
						      $i++;
					      }
					  }
			   }			 
		    }else{ 
			   return null;
			}	   
   }
   
    # Update Promotion
	
    public function updatePromo($academ) {     
           $sc = $this->conn->query("select * from scheme where SiteID = '{$_SESSION['SiteID']}' and id = '{$_SESSION['settings']['scheme']}'");
		   $scheme = $sc->fetch_array();
		   $grade = explode(',',$scheme['grade']);$score = explode(',',$scheme['score']);
		   $scheme = !empty($scheme['cutoff'])? explode(',',$scheme['cutoff']) : '4:E8,40';# Default Criteria for repetition
		   $cut = explode(':',$scheme[0]); $avm = $scheme[1];
		    
			if(!is_null($scheme)){
			   for( $i=0;$i < count($grade);$i++ ){
				   if(strtoupper(trim($cut[1])) == strtoupper($grade[$i])){ $upper = explode(':',$score[$i]);}
			   }
			   
			   // Write Queries to update student promotion status
			      $term = substr($academ,5,1);
			      if($term == 3){
					   $rs = $this->conn->query("select distinct(studentCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$academ}'");
		               if($rs->num_rows > 0){ 
		                  while($num = $rs->fetch_array()){
							   //var_dump($upper[0]);exit;
							   $r = $this->conn->query("select rt.*,sj.subjName from result rt,subject sj where rt.SiteID = '{$_SESSION['SiteID']}' and rt.subjectCode = sj.subjCode and rt.totalScore <= '{$upper[0]}' and rt.active = 1 and rt.studentCode = '{$num['studentCode']}' and rt.academCode = '{$academ}'");
		                       if($r->num_rows > 0){
                                      $msg = "Trailed these list of subjects : ";								   
							      while($ks = $r->fetch_array()){
									  $msg .= $ks['subjName'].", ";
								  }
								  if($r->num_rows >= trim($cut[0])){
									  $this->conn->query("update performance set promoteTo = '2',promoteNote = '{$msg}' where SiteID = '{$_SESSION['SiteID']}' and studentCode = '{$num['studentCode']}' and academCode = '{$academ}'");
								  }else{
								      $this->conn->query("update performance set promoteTo = '1',promoteNote = '{$msg}' where SiteID = '{$_SESSION['SiteID']}' and studentCode = '{$num['studentCode']}' and academCode = '{$academ}'");
							      }								  
						       }						  
						  }
                       }
				  }			   
			}else{ 
			   return null;
			}	   
   }
   
    # Promote a Class Group   
    public function classPromo($academ,$newacadem) {
		   $ms = $this->conn->query("select * from academ where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$academ}'");
		   $ls = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$newacadem}'");
		   if($ms->num_rows > 0){ 
			  $sres = $ms->fetch_array();	
		   

				   // If Classes Not Promoted in current term and Term is 3
				   if($sres['classPromo'] == 0 && $_SESSION['settings']['academTerm'] == 3){
					   
						$rs = $this->conn->query("select * from class where SiteID = '{$_SESSION['SiteID']}' and gradDate IS NULL");
						if($rs->num_rows > 0){ 
						   while($num = $rs->fetch_array()){
							  
							  // Explode Class Name for Number				   
							  // $className = explode(' ',$num['className'],2);
							  // $newForm =  $className[0]++;

                               $className = explode(' ',$num['className'],2);
                               $newForm = $this->fetchYear($num['admitDate'],$ls['dateCreated']);							  
							   
							   // Update Class	
								if(is_integer($newForm) && $newForm <= 3){
									$newName = $newForm.' '.$className[1];
									$this->conn->query("update class set className = '{$newName}',classForm = '{$newForm}' where SiteID = '{$_SESSION['SiteID']}' and id = '{$num['id']}'");
								}else{
									 $newForm = date('Y');
									 $newName = date('Y').' '.$className[1];
									 $grad = date('Y-m-d');
									 $this->conn->query("update class set className = '{$newName}',classForm = '{$newForm}',gradDate = '{$grad}' where SiteID = '{$_SESSION['SiteID']}' and id = '{$num['id']}'");
								}             		   				   
						   }
						   
						   // Update Academ classPromo column
							  $this->conn->query("update academ set classPromo = '1' where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$academ}'");						
						}
				   }				   
			}				
	}
	
	
	# Promote a Individual Students based on promoteTo status   
    public function memberPromo($academ) {
		
		$term = substr($academ,5,1);  
		if($_SESSION['settings']['resultReview'] == 2 && $term == 3){
			
		   $ms = $this->conn->query("select pf.*,st.*,cl.className from performance pf,student st,class cl where st.classCode = cl.id and pf.studentCode = st.sudentCode and pf.SiteID = '{$_SESSION['SiteID']}' and pf.academCode = '{$academ}'");
		   if($ms->num_rows > 0){
              		   
			  while($sres = $ms->fetch_array()){
				  
				  if($sres['promoteTo'] == 2){
					 // Re-peating students  					   
					   $class = explode(' ',$sres['className'],2);
                       $new_cl = $class[0]--;					   					   
					   $new_class = $new_cl.' '.$class[1];
					   
					   // Update Student New Class
					   $ds = $this->conn->query("select * from class where className LIKE '{$new_class}' and SiteID = '{$_SESSION['SiteID']}' and gradDate IS NULL");
		               
					   if($ds->num_rows > 0){
						  $dsres = $ms->fetch_array();
					      $this->rawQuery("update student set classCode = '{$dsres['id']}' where studentCode = '{$sres['studentCode']}' and SiteID = '{$_SESSION['SiteID']}'");
					   }
					   
				  }else{
					   // Promoting Students
					   $class = explode(' ',$sres['className'],2);
                       $new_cl = $class[0]++;					   					   
					   $new_class = $new_cl.' '.$class[1];
					   
					   // Update Student New Class
					   $ds = $this->conn->query("select * from class where className LIKE '{$new_class}' and SiteID = '{$_SESSION['SiteID']}' and gradDate IS NULL");
		               $dsres = $ms->fetch_array();
					   if($ds->num_rows > 0){
					      $this->rawQuery("update student set classCode = '{$dsres['id']}' where studentCode = '{$sres['studentCode']}' and SiteID = '{$_SESSION['SiteID']}'");
					   }
				  }				  
			  }		   	   
			}
		}			
	}
	
	
	# Temp & Performance Check & Update - script
	public function checkTemp(){
		   
		$std = $this->getAllRecord("select * from student where gradDate IS NULL and SiteID = '{$_SESSION['SiteID']}' and active = 1"); 
        foreach($std as $st){
			   //var_dump($st);exit;
			// Check whether Result is staged or published yet	   
			   
			   
			   $stg = $this->getAllRecord("select * from temp where SiteID = '{$_SESSION['SiteID']}' and classCode = '{$st['classCode']}' and academCode = '{$_SESSION['settings']['academ']}'");
			   $stm = $this->getAllRecord("select * from result where SiteID = '{$_SESSION['SiteID']}' and classCode = '{$st['classCode']}' and academCode = '{$_SESSION['settings']['academ']}'");
			   $sg = $this->getOneRecord("select * from temp where SiteID = '{$_SESSION['SiteID']}' and classCode = '{$st['classCode']}' and academCode = '{$_SESSION['settings']['academ']}' and studentCode = '{$st['studentCode']}'");
			   $sm = $this->getOneRecord("select * from result where SiteID = '{$_SESSION['SiteID']}' and classCode = '{$st['classCode']}' and academCode = '{$_SESSION['settings']['academ']}' and studentCode = '{$st['studentCode']}'");
			   
			   // || (!is_null($stm) && is_null($sm)
			   if((!is_null($stg) && is_null($stm)) || (is_null($stg) && is_null($stm))){			   
				  // If Results is staged
				  $cr = $this->getOneRecord("select * from course where courseCode = '{$st['courseCode']}' and SiteID = '{$_SESSION['SiteID']}' and active = 1");
				  $subjects = explode(',',trim($cr['subjArray']));
				  
				  foreach($subjects as $sj){
					 $tr = $this->getOneRecord("select * from `temp` where subjectCode = '{$sj}' and SiteID = '{$_SESSION['SiteID']}' and academCode = '{$_SESSION['settings']['academ']}' and studentCode = '{$st['studentCode']}' and active = 1");
					 if(is_null($tr)){
						  # Insert New Subject's Assessment
						  $this->rawQuery("insert into `temp`(`classCode`,`subjectCode`,`academCode`,`scheme`,`SiteID`,`studentCode`,`classScore`,`examScore`,`totalScore`,`active`) values('{$st['classCode']}','{$sj}','{$_SESSION['settings']['academ']}','{$_SESSION['settings']['scheme']}','{$_SESSION['SiteID']}','{$st['studentCode']}',-1,-1,-1,1)");
					 }else{
						  # Update old Subject's Assessment
						  $this->rawQuery("update `temp` set `classCode` = '{$st['classCode']}' where id = '{$tr['id']}'");
					 }				  					
				  }
                   
                    $all = explode(',',$this->getSubjTerm());
				    $clean = array();
					   foreach($all as $ts){
						   $ss = explode(':',$ts);
						   $clean[$ss[1]] = $ss[1];
					   }				   
				    $new = $clean;
					$sj = explode(',',trim($cr['subjArray']));
					foreach($clean as $sm){
						
					   for($i = 0; $i < count($sj);$i++){						
						
							if($sm == $sj[$i]){
								unset($new[$sm]);
							}
						}						
					}	
						
                    foreach($new as $dl){
						# Clean Old Subject that no longer apply
				        $this->rawQuery("delete from `temp` where `subjectCode` = '{$dl}' and `SiteID` = '{$_SESSION['SiteID']}' and `academCode` = '{$_SESSION['settings']['academ']}' and `studentCode` = '{$st['studentCode']}'");
			 		}	 
			  }
			 
			 /*
			  elseif((is_null($stg) && is_null($stm))){
				  // If Results is not staged,
				  $cr = $this->getOneRecord("select * from course where courseCode = '{$st['courseCode']}' and SiteID = '{$_SESSION['SiteID']}' and active = 1");
				  $subjects = explode(',',trim($cr['subjArray']));
				  
				  foreach($subjects as $sj){
					 $tr = $this->getOneRecord("select * from `temp` where subjectCode = '{$sj}' and SiteID = '{$_SESSION['SiteID']}' and academCode = '{$_SESSION['settings']['academ']}' and studentCode = '{$st['studentCode']}' and active = 1");
					 
					 if(is_null($tr)){
						  # Insert New Subject's Assessment
						  $sl = $this->conn->query("insert into `temp`(`classCode`,`subjectCode`,`academCode`,`scheme`,`SiteID`,`studentCode`,`classScore`,`examScore`,`totalScore`,`active`) values('{$st['classCode']}','{$sj}','{$_SESSION['settings']['academ']}','{$_SESSION['settings']['scheme']}','{$_SESSION['SiteID']}','{$st['studentCode']}',-1,-1,-1,1)");
					     
					 }else{
						  # Update old Subject's Assessment
						  $this->rawQuery("update `temp` set `classCode` = '{$st['classCode']}' where id = '{$tr['id']}'");
					 }				  					
				  }
                  
				    $all = explode(',',$this->getSubjTerm());
				    $clean = array();
					   foreach($all as $ts){
						   $ss = explode(':',$ts);
						   $clean[$ss[1]] = $ss[1];
					   }				   
				    $new = $clean;
					$sj = explode(',',trim($cr['subjArray']));
					foreach($clean as $sm){
						
					   for($i = 0; $i < count($sj);$i++){						
						
							if($sm == $sj[$i]){
								unset($new[$sm]);
							}
						}						
					}	
						
                    foreach($new as $dl){
						# Clean Old Subject that no longer apply
				        $this->rawQuery("delete from `temp` where `subjectCode` = '{$dl}' and `SiteID` = '{$_SESSION['SiteID']}' and `academCode` = '{$_SESSION['settings']['academ']}' and `studentCode` = '{$st['studentCode']}'");
			 		}				
				 
			 }*/
                  # Check performance table
				  $pf = $this->getOneRecord("select * from performance where SiteID = '{$_SESSION['SiteID']}' and academCode = '{$_SESSION['settings']['academ']}' and studentCode = '{$st['studentCode']}'");
				  if(is_null($pf)){
					  # Insert New Subjects for Assessment
					  $this->rawQuery("insert into performance(classCode,academTerm,academCode,SiteID,studentCode) values('{$st['classCode']}','{$_SESSION['settings']['academTerm']}','{$_SESSION['settings']['academ']}','{$_SESSION['SiteID']}','{$st['studentCode']}')");
				  }			 
		}
		
		# Clean Temporal result table for any other academ except the current academ
		  $this->rawQuery("delete from temp where academCode <> '{$_SESSION['settings']['academ']}' and SiteID = '{$_SESSION['SiteID']}'");
	
	    # Implement Restricted Subjects
		  $this->chkSubjRest();
	}
	
	
	
	public function updateToken(){
		   
		$std = $this->getAllRecord("select * from student where gradDate IS NULL and SiteID = '{$_SESSION['SiteID']}' and active = 1"); 
		foreach($std as $st){
			 $newtoken = md5(time()*rand());
			 $this->rawQuery("update student set loginToken = '{$newtoken}' where id = '{$st['id']}'");					 
		}
	}
	
	
	# Restrict Subjects in Temporal Results - script
	public function chkSubjRest(){
		   
		$std = $this->getOneRecord("select * from institution where SiteID = '{$_SESSION['SiteID']}' and active = 1"); 
        if(!is_null($std['restrictSubj']) && !empty($std['restrictSubj'])){
			$subjR = explode(',',trim($std['restrictSubj']));
			
			foreach($subjR as $st){
				$ms = explode(':',trim($st));
				$stg = $this->getAllRecord("select * from class where SiteID = '{$_SESSION['SiteID']}' and classForm <> '{$ms[0]}' and gradDate IS NULL");
				if(!is_null($stg)){
					$clx = '';$j = 1;
					foreach($stg as $cl){						
						// Clean Subject for classes that donot apply
					    $this->rawQuery("delete from temp where classCode = '{$cl['id']}' and subjectCode = '{$ms[1]}' and SiteID = '{$_SESSION['SiteID']}' and academCode = '{$_SESSION['settings']['academ']}'");
					}
				 }
			}
		}
	}
	
	
	
	# ACADEM auto activation
	public function autoAcadem(){
		
		 // Get current academ end date
		 $cur = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and active = 1");
		 $next = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and id = (select min(id) from academ where id > '{$cur['id']}')");
		 
		 if(!is_null($next)){		 
			 // Check If Current Academic Term has ended and New Term is due!
			 if((strtotime($cur['endDate']) < strtotime('today')) && (strtotime('today') >= strtotime($next['dateCreated']))){
				
				// Activate Next term as Active Academ - By first disabling all Academs
				   $app->redirect($app->urlFor('enableacad',['id' => $next['id']]));
				   //$this->rawQuery("update academ  set active = 0 where SiteID = '{$_SESSION['SiteID']}'");	
				   //$this->rawQuery("update academ  set active = 1 where id = '{$next['id']}' and SiteID = '{$_SESSION['SiteID']}'");	
			 }		 
		 }
    }
	
	
	
	
	# Session Inialization   
    public function sess() {
		
		  // Query for Settings
			 //$s1 = $this->getOneRecord("select * from institution where SiteID = '{$_SESSION['SiteID']}' order by id DESC");
			 $s1 = $this->getOneRecord("select * from institution where active = 1 order by id DESC");
			 $_SESSION['SiteID'] = $s1['SiteID'];
			 
			 $s2 = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and active = 1");
			 $s = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and id = (select min(id) from academ where id > '{$s2['id']}')");
			 $s4 = $this->getOneRecord("select * from academ where SiteID = '{$_SESSION['SiteID']}' and id = (select max(id) from academ where id < '{$s2['id']}')");
			 $s3 = $this->getOneRecord("select * from scheme where SiteID = '{$_SESSION['SiteID']}' and active = 1");
			  
		  // Declare all Gobal variables & Sessions
			 session_regenerate_id();
			 $_SESSION['settings']['academ'] = $s2['academCode'];
			 $_SESSION['settings']['academNext'] = is_null($s['academCode'])? $s2['academCode'] : $s['academCode'];
			 $_SESSION['settings']['academPrev'] = is_null($s4['academCode'])? $s2['academCode'] : $s4['academCode'];
			 $_SESSION['settings']['academTerm'] = $s2['academTerm'];
			 $_SESSION['settings']['academYear'] = $s2['academYear'];
			 $_SESSION['settings']['startDate'] = $s2['dateCreated'];
			 $_SESSION['settings']['endDate'] = $s2['endDate'];
			 $_SESSION['settings']['scheme'] = $s3['id'];
			 $_SESSION['settings']['logo'] = $s1['logo'];
			 $_SESSION['settings']['sign'] = $s1['headsign'];
			 $_SESSION['settings']['teaser'] = $s1['teaser'];
			 $_SESSION['settings']['sms'] = $s1['sms_account'];
			 $_SESSION['settings']['sms_active'] = $s1['sms_active'];
			 $_SESSION['settings']['sms_sender'] = $s1['sms_sender'];
			 $_SESSION['settings']['autoAcadem'] = $s1['autoAcadem'];			 
			 $_SESSION['settings']['institution'] = $s1['title'];
			 $_SESSION['settings']['instituteAddress'] = $s1['address'];
			 $_SESSION['settings']['instituteEmail'] = $s1['email'];
			 $_SESSION['settings']['institutePhone'] = $s1['phone'];
			 $_SESSION['settings']['instituteWeb'] = $s1['website'];
			 $_SESSION['settings']['instituteProfile'] = $s1['profile'];
			 $_SESSION['settings']['instituteBank'] = $s1['bank'];
			 $_SESSION['settings']['instituteModel'] = $s1['instituteModel'];
			 $_SESSION['settings']['instituteCode'] = $s1['wassce'];
			 $_SESSION['settings']['resultCertified'] = $s2['resultCertified'];
			 $_SESSION['settings']['resultReview'] = $s2['resultReview'];
			 $_SESSION['settings']['managers'] = explode(',',$s1['managers']);
			 
			// Themes Settings
			 $_SESSION['settings']['primecolor'] = $s1['primecolor'];
			 $_SESSION['settings']['subcolor'] = $s1['subcolor'];
			 $_SESSION['settings']['card'] = $s1['card'];
			// Certification success message
			 $_SESSION['settings']['certSuccess'] = 0;	
	}
	
	
   # Logging System   
    public function logs($title,$content) {
		 // Insert into Log		  
		    @$this->conn->query("insert into log(title,content,SiteID,access) values('{$title}','{$content}','{$_SESSION['SiteID']}','{$_SESSION['user']['privilege']}')");
	}
	
	# SMS Credit update    
    public function logm($title,$content) {
		 // Insert into Log		  
		    @$this->conn->query("insert into log(title,content,SiteID) values('{$title}','{$content}','{$_SESSION['SiteID']}')");
	}
	
	# Get Message Charge in SMS	  
	 public function smsCharge($content,$char_amount_per_sms = 240){
            $smslength = strlen($content);			
            $charge = ceil($smslength / $char_amount_per_sms);
			return $charge;
	}
	
	# Check SMS Balance  
	 public function canSms($charge){
		    return ($_SESSION['settings']['sms'] - $charge) >= 0 ? true : false;			 
     }
	
	# Update SMS Balance  
	 public function updateSmsCharge($charge){
		     $_SESSION['settings']['sms'] = $_SESSION['settings']['sms'] - $charge;
             return $this->conn->query("update institution set sms_account = '{$_SESSION['settings']['sms']}' where SiteID = '{$_SESSION['SiteID']}'");
	 }
	
	
	
	
	##################  FUNCTIONS  OF STUDENT MODULE ################################################
	
/* Get Award for Subject */
   public function getAward($academ){
	   if(!isset($_SESSION)){session_start();}
	    
		
	   $newacadem = $this->getAcademRange($academ);
	   
	   $award = array();$people1 = array();$people2 = array();$people3 = array(); $overall = array();$group = array();
	   
	   $m = $this->conn->query("select * from class where SiteID = '{$_SESSION['SiteID']}' and  gradDate IS NULL") or die($this->conn->error.__LINE__);        
		if($m->num_rows > 0){
             $f1=null;$f2=null;$f3=null;$i=1;			
			 while($mx = $m->fetch_array()){
				 if($this->getYear($mx['admitDate']) == 1){
					 $f1 .= $mx['id'].($m->num_rows == $i ? '': ',');
				 }elseif($this->getYear($mx['admitDate']) == 2){
					 $f2 .= $mx['id'].($m->num_rows == $i ? '': ',');
				 }elseif($this->getYear($mx['admitDate']) == 3){
					 $f3 .= $mx['id'].($m->num_rows == $i ? '': ',');
				 }
				 $i++;
			 }
			 
			 // Populate Best Form 1 Subject Students
			 
			   $r = $this->conn->query("select distinct(subjectCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode >= '{$newacadem[1]}' and academCode <= '{$newacadem[0]}' and classCode IN ('{$f1}')") or die($this->conn->error.__LINE__);        
			   if($r->num_rows > 0){         	
				 while($num = $r->fetch_array()){
					 $rs = $this->conn->query("select SUM(totalScore) as totalScore,rt.academCode,rt.subjectCode,rt.studentCode,st.fName,st.lName,st.classCode,sj.subjName from result rt,student st,subject sj where rt.SiteID = '{$_SESSION['SiteID']}' and sj.subjCode = rt.subjectCode and rt.studentCode = st.studentCode and rt.academCode >= '{$newacadem[1]}' and rt.academCode <= '{$newacadem[0]}' and rt.subjectCode = '{$num['subjectCode']}' and rt.classCode IN ('{$f1}') group by rt.studentCode,rt.totalScore,rt.subjectCode,rt.academCode,st.fName,st.lName,st.classCode,sj.subjName order by rt.totalScore DESC limit 1") or die($this->conn->error.__LINE__);        
					 if($rs->num_rows > 0){
						 $ms = $rs->fetch_array();
						 if(isset($_SESSION['student']['studentCode']) && $ms['studentCode'] == $_SESSION['student']['studentCode']){ $award[] = $ms;}
						 $people1[] = $ms;
					 }  
				 }  
			   }
			 
			 // Populate Best Form 2 Subject Students
			   $r = $this->conn->query("select distinct(subjectCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode >= '{$newacadem[1]}' and academCode <= '{$newacadem[0]}' and classCode IN ('{$f2}')") or die($this->conn->error.__LINE__);        
			   if($r->num_rows > 0){         	
				 while($num = $r->fetch_array()){
					 $rs = $this->conn->query("select SUM(totalScore) as totalScore,rt.academCode,rt.subjectCode,rt.studentCode,st.fName,st.lName,st.classCode,sj.subjName from result rt,student st,subject sj where rt.SiteID = '{$_SESSION['SiteID']}' and sj.subjCode = rt.subjectCode and rt.studentCode = st.studentCode and rt.academCode >= '{$newacadem[1]}' and rt.academCode <= '{$newacadem[0]}' and rt.subjectCode = '{$num['subjectCode']}' and rt.classCode IN ('{$f2}') group by rt.studentCode,rt.totalScore,rt.subjectCode,rt.academCode,st.fName,st.lName,st.classCode,sj.subjName  order by rt.totalScore DESC limit 1") or die($this->conn->error.__LINE__);        
					 if($rs->num_rows > 0){
						 $ms = $rs->fetch_array();
						 if(isset($_SESSION['student']['studentCode']) && $ms['studentCode'] == $_SESSION['student']['studentCode']){ $award[] = $ms;}
						 $people2[] = $ms;
					 }  
				 }  
			   }
			   
			   
			 // Populate Best Form 3 Subject Students
			 
			   $r = $this->conn->query("select distinct(subjectCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode >= '{$newacadem[1]}' and academCode <= '{$newacadem[0]}' and classCode IN ('{$f3}')") or die($this->conn->error.__LINE__);        
			   if($r->num_rows > 0){         	
				 while($num = $r->fetch_array()){
					 $rs = $this->conn->query("select SUM(totalScore) as totalScore,rt.academCode,rt.subjectCode,rt.studentCode,st.fName,st.lName,st.classCode,sj.subjName from result rt,student st,subject sj where rt.SiteID = '{$_SESSION['SiteID']}' and sj.subjCode = rt.subjectCode and rt.studentCode = st.studentCode and rt.academCode >= '{$newacadem[1]}' and rt.academCode <= '{$newacadem[0]}' and rt.subjectCode = '{$num['subjectCode']}' and rt.classCode IN ('{$f3}') group by rt.studentCode,rt.totalScore,rt.subjectCode,rt.academCode,st.fName,st.lName,st.classCode,sj.subjName  order by rt.totalScore DESC limit 1") or die($this->conn->error.__LINE__);        
					 if($rs->num_rows > 0){
						 $ms = $rs->fetch_array();
						 if(isset($_SESSION['student']['studentCode']) && $ms['studentCode'] == $_SESSION['student']['studentCode']){ $award[] = $ms;}
						 $people3[] = $ms;
					 }  
				 }  
			   }
			   
		}
		
		/*
		   $r = $this->conn->query("select distinct(subjectCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode >= '{$newacadem[1]}' and academCode <= '{$newacadem[0]}'") or die($this->conn->error.__LINE__);        
		   if($r->num_rows > 0){         	
			 while($num = $r->fetch_array()){
				 $rs = $this->conn->query("select SUM(totalScore) as totalScore,rt.academCode,rt.subjectCode,rt.studentCode,st.fName,st.lName,st.classCode,sj.subjName from result rt,student st,subject sj where rt.SiteID = '{$_SESSION['SiteID']}' and sj.subjCode = rt.subjectCode and rt.studentCode = st.studentCode and rt.academCode >= '{$newacadem[1]}' and rt.academCode <= '{$newacadem[0]}' and rt.subjectCode = '{$num['subjectCode']}' group by rt.studentCode,rt.totalScore,rt.subjectCode,rt.academCode,st.fName,st.lName,st.classCode,sj.subjName  order by rt.totalScore DESC limit 1") or die($this->conn->error.__LINE__);        
				 if($rs->num_rows > 0){
					 $ms = $rs->fetch_array();
					 if($ms['studentCode'] == $_SESSION['student']['studentCode']){ $award[] = $ms;}
					 $people[] = $ms;
				 }  
			 }  
		   }
	   */
	   $r = $this->conn->query("select distinct(classCode) from result where SiteID = '{$_SESSION['SiteID']}' and academCode >= '{$newacadem[1]}' and academCode <= '{$newacadem[0]}'") or die($this->conn->error.__LINE__);        
	   if($r->num_rows > 0){         	
		 while($num = $r->fetch_array()){
			 $rs = $this->conn->query("select SUM(rt.totalScore) as total,rt.studentCode,cl.className from result rt,class cl,student st where rt.SiteID = '{$_SESSION['SiteID']}' and rt.classCode = cl.id and rt.academCode >= '{$newacadem[1]}' and rt.academCode <= '{$newacadem[0]}' and rt.classCode = '{$num['classCode']}' group by studentCode order by total DESC limit 1") or die($this->conn->error.__LINE__);        
	         if($rs->num_rows > 0){
				 $ms = $rs->fetch_array();
				 if(isset($_SESSION['student']['studentCode']) && $ms['studentCode'] == $_SESSION['student']['studentCode']){ $overall[] = $ms;}
				 $group[] = $ms;
			 }  
		 }  
       }
         return array($award,$people1,$people2,$people3,$overall,$group);	   
   }
   
   
   public function getAcademRange($academ){
	     $term = substr($academ,5,1);
	     $year = substr($academ,0,4);
		 $newacadem = array();
		 if($term == 1){
			 $newacadem[0] = ($year+1).'03';
			 $newacadem[1] = ($year).'01';
			 
		 }elseif($term == 2){
			 $newacadem[0] = ($year).'03';
			 $newacadem[1] = ($year-1).'01';
			 
		 }elseif($term == 3){
			 $newacadem[0] = ($year).'03';
			 $newacadem[1] = ($year-1).'01';
		 }
		 
		 return $newacadem;
		 
   }
	
	
/* Get Students Data with Student_id */
	 public function getStudent($student_id,$password){     
		   
		   $data = array();	  
	       $r = $this->conn->query("SELECT st.*,cl.*,cl.admitDate as year FROM student st,class cl where st.SiteID = '{$_SESSION['SiteID']}' and cl.id = st.classCode and st.active = 1 and st.studentCode = '{$student_id}' and st.password = '{$password}'") or die($this->conn->error.__LINE__);        
		   	if($r->num_rows > 0){         	
				$result = $r->fetch_assoc();
				var_dump($result);
				return $result;
					   
			}else{ return null;}		
		   		   		
    }
	
	
	
	
	/* Get Students Data with class_id */
	 public function getStudentCl($student_id) {       
	      // Get Form_status from Results of Student for an Academ  
		   $data = array();	  
	       $r = $this->conn->query("SELECT * FROM student where SiteID = '{$_SESSION['SiteID']}' and active = 1 and classCode = ".$student_id." order by first_name asc") or die($this->conn->error.__LINE__);        
		   	if($r->num_rows > 0){         	
				while($result = $r->fetch_assoc()){
				    $data[] = $result;
				}	   
			}else{  $data = null;}		
		    return $data;		   		
    }	
	
	
		/* Get Grading with Total_100 */
    public function getPTip($rank) {       
		  if($rank == 1 || $rank == 21 || $rank == 31 || $rank == 41 || $rank == 51 || $rank == 61 || $rank == 71 || $rank == 81 || $rank == 91){
			    return '<sup>ST</sup>';
		  }else if($rank == 2 || $rank == 22 || $rank == 32 || $rank == 42 || $rank == 52 || $rank == 62 || $rank == 72 || $rank == 82 || $rank == 92){
			    return '<sup>ND</sup>';
		  }else if($rank == 3 || $rank == 23 || $rank == 33 || $rank == 43 || $rank == 53 || $rank == 63 || $rank == 73 || $rank == 83 || $rank == 93){
			    return '<sup>RD</sup>';
		  }else{ return '<sup>TH</sup>';}  			
    }
	
	
	
	/* Get Results ShortList in Terms & Year for Student */
    public function getRanks($class_id,$academ) {       
	      
		   $r = $this->conn->query("SELECT st.*,pf.* FROM student st,performance pf where st.SiteID = '{$_SESSION['SiteID']}' and st.studentCode = pf.studentCode and st.classCode = '{$class_id}' and pf.academCode = '{$academ}' and st.active = 1 order by pf.classAverage DESC") or die($this->conn->error.__LINE__);        
		   if($r->num_rows > 0){
			   
                $data = array();			   
				while($result = $r->fetch_assoc()){  
	             	
					 /* Set Rank and Average for Last Term */
					  if(($_SESSION['student']['studentCode'] == $result['studentCode']) && ($academ == $_SESSION['settings']['academPrev'])){
							// Set Last term position for Dashboard
							   $_SESSION['student']['position'] = $i+1;
							// Set Last term Average for Dashboard
							   $_SESSION['student']['avg'] = $result['classAverage'];
					  }else{
						   // Set Last term position for Dashboard
							   $_SESSION['student']['position'] = 0;
							// Set Last term Average for Dashboard
							   $_SESSION['student']['avg'] = 0.00;
						  
					  }
						$data[] = $result;							   
				}
                        return $data;
						
			}else{ return null;}		   		
    }
	
	
	/* Get Bills for Student */
    public function getBills($student_id) { 
	
	     $data = array();
	  // Fetch all Bills belonging to a Student
	    $r = $this->conn->query("select bl.* from bill bl,fees rt where rt.SiteID = '{$_SESSION['SiteID']}' and bl.id = rt.BillCode and rt.studentCode = ".$student_id) or die($this->conn->error.__LINE__);        
			if($r->num_rows > 0){         	
				while($result = $r->fetch_assoc()){
					$data[] = $result;				
				}
			}else{ $data = null; }		
		    return $data;			
    }
	
	
	/* Get Payments & Receipt for Student */
    public function getPayments($student_id) {       
	       
		   $data = array();	  
	        $r = $this->conn->query("select rt.*,bl.* from bill bl,fees rt where rt.SiteID = '{$_SESSION['SiteID']}' and bl.id = rt.BillCode and rt.payStatus > 0 and rt.studentCode = ".$student_id) or die($this->conn->error.__LINE__);        
			if($r->num_rows > 0){         	
				while($result = $r->fetch_assoc()){
					$data[] = $result;				
				}
			}else{ $data = null; }		
		    return $data;			
    }
	
	/* Get Accrued Dept for Student */
	public function getAccrued($student_id) {  
	
	       $credit = 0; $debit = 0;
	    // Get Total Dept of Student
	         $r = $this->conn->query("select rt.*,bl.* from bill bl,fees rt where rt.SiteID = '{$_SESSION['SiteID']}' and bl.id = rt.BillCode and rt.payStatus == 0 or rt.payStatus == 2 and rt.studentCode = ".$student_id) or die($this->conn->error.__LINE__);        
			if($r->num_rows > 0){         	
				while($result = $r->fetch_assoc()){
					$debt = 0;
					if($result['BillType'] == 1)
					   $credit += $result['amount'];	
                    else
                       $debit += $result['amount'];						
				}
			} 			   
		    return (float)($credit-$debit);			
    }	

	
   
} 

/*

select count(*) from access;
select count(*) from area_council;
select count(*) from community;
select count(*) from death;
select count(*) from education;
select count(*) from individual;
select count(*) from indvstatus;
select count(*) from inmigration;
select count(*) from inmigration_tmp;
select count(*) from location;
select count(*) from membership;
select count(*) from observation;
select count(*) from Observation_community;
select count(*) from Observation_location;
select count(*) from Observation_SocioEco;
select count(*) from outmigration;
select count(*) from Param_Ethnicgp;
select count(*) from Param_Marital_Status;
select count(*) from Param_RltnHead;
select count(*) from pregoutcome;
select count(*) from Presences;
select count(*) from relationship;
select count(*) from round;
select count(*) from Socialgp_head;
select count(*) from Socialgp_rltn;
select count(*) from socialgroup;
select count(*) from socioeco_a;
select count(*) from socioeco_b;
select count(*) from socioeconomy;
select count(*) from SysLanguage;
select count(*) from SysMessage_content;
select count(*) from Vaccination;
select count(*) from Validation_Error;


SELECT Validation_Error.eventid, Validation_Error.locationid, Validation_Error.unit_name, Validation_Error.variable, Validation_Error.cur_value, Validation_Error.description, Validation_Error.field_wrkr, Validation_Error.entry_date, access.usercode, access.password, access.username AS usr_name, access.access_lvl, access.comments, Validation_Error.unit_id FROM access INNER JOIN Validation_Error ON access.usercode = Validation_Error.field_wrkr

*/

%>


