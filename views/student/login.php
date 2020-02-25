<% 
    if(!isset($_SESSION)){
		session_start();
	}
	
	 require_once 'class/class.php';	 
     $db = new DbHandler();
	 
  // Please donot delete this line -- Core libraies
	 //require_once 'class/core.php';
	  
	 $core = '41329275'; $siteid = '1';
	 $_SESSION['SiteID'] = $siteid;
	
	 $s1 = $db->getOneRecord("select * from institution order by id DESC");
	 $_SESSION['settings']['teaser'] = $s1['teaser'];
	 


%>

<!DOCTYPE html>
<html>    
<head>
        
        <!-- Title -->
        <title>Student | Login - Sign in</title>
        
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <meta charset="UTF-8">
        <meta name="description" content="eSHS Manager" />
        <meta name="keywords" content="admin,dashboard" />
        <meta name="author" content="K-Soft GH LTD" /> 
		
		<style>
		   @import url(https://fonts.googleapis.com/css?family=Open+Sans+Condensed:700);

					body {
					  background: #999;
					  padding: 40px;
					  font-family: "Open Sans Condensed", sans-serif;
					}

					#bg {
					  position: fixed;
					  left: 0;
					  top: 0;
					  width: 100%;
					  height: 100%;
					  background: url(<%= $_SESSION['settings']['teaser'].'?'.rand()%>) no-repeat center center fixed;
					  background-size: cover;
					  -webkit-filter: blur(4px);    
					}

					form {
					  position: relative;
					  width: 250px;
					  margin: 0 auto;
					  background: rgba(130,130,130,.5);
					  padding: 20px 22px;
					  border: 1px solid;
					  border-top-color: rgba(255,255,255,.4);
					  border-left-color: rgba(255,255,255,.4);
					  border-bottom-color: rgba(60,60,60,.4);
					  border-right-color: rgba(60,60,60,.4);
					}

					form input, form button, form .title {
					  width: 212px;
					  border: 1px solid;
					  border-bottom-color: rgba(255,255,255,.5);
					  border-right-color: rgba(60,60,60,.35);
					  border-top-color: rgba(60,60,60,.35);
					  border-left-color: rgba(80,80,80,.45);
					  background-color: rgba(0,0,0,.2);
					  background-repeat: no-repeat;
					  padding: 8px 24px 8px 10px;
					  font: bold .875em/1.25em "Open Sans Condensed", sans-serif;
					  letter-spacing: .075em;
					  color: #fff;
					  text-shadow: 0 1px 0 rgba(0,0,0,.1);
					  margin-bottom: 19px;
					}

					form input:focus { background-color: rgba(0,0,0,.4); }

					form input.email {
					  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAMCAYAAAC9QufkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0YwNDIzMTQ3QzIzMTFFMjg3Q0VFQzhDNTgxMTRCRTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0YwNDIzMTU3QzIzMTFFMjg3Q0VFQzhDNTgxMTRCRTQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRjA0MjMxMjdDMjMxMUUyODdDRUVDOEM1ODExNEJFNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRjA0MjMxMzdDMjMxMUUyODdDRUVDOEM1ODExNEJFNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsOChsgAAADUSURBVHjaYvz///9JBgYGMwbSwSkGoOafQPwKiAOBmIEIHAXED0H6QJwPQGwAxE+AOJOAxnwgvgfEKiB9MM0gWg6IbwNxIw6NXUB8HogloHwUzSAsBAoDIJ4DxMxQMRA9H4gPADE/kloMzSCsBcR/gHgj1LAt0HBRR1P3gQktBA2AeBcQZwHxCyB+AsT3gTgFKq6FohrJZnssoW6AxPaDBqoZurP9oBrtCYS2ExA/h9JgzX+gAsZExrMZVP0fmGZ1IjWiBCoL0NsXgPgGGcnzLECAAQD5y8iZ2Z69IwAAAABJRU5ErkJggg==);
					  background-position: 220px 10px;
					}

					form input.pass {
					  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTVFMDg1QzU3QzIzMTFFMjgwQThGODZFM0EwQUZFQ0YiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTVFMDg1QzY3QzIzMTFFMjgwQThGODZFM0EwQUZFQ0YiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NUUwODVDMzdDMjMxMUUyODBBOEY4NkUzQTBBRkVDRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1NUUwODVDNDdDMjMxMUUyODBBOEY4NkUzQTBBRkVDRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv2NSIIAAADYSURBVHjanJAxCsJAEEXXaBMQtvIMqTxDKjtPELC1svMoOYM2WlqIhVcQFMVgG7ATAoIggfGPjrLIrBo/vCzZ+Z+dGUNExiECI7Clhw5gAtqur8YfUQxm4AzGIAMRSIAFXbC8OyUdghwsgH173cp9Lr5XqAeOSsANcj3h/8BpbQ4Ko6uQOvtMQy6noG4+iz3XZ4iHbIEQ9L8EeUlN3t5etvSrMg6RqajAc78BQ7BTq6QrllV3tKLvpZOclyrt/TWTlTP0zVQqba/BAKyUWsmh1BPUxL70JsAABHkyyK1uocIAAAAASUVORK5CYII=);
					  background-position: 223px 8px
					}

					::-webkit-input-placeholder { color: #ccc; text-transform: uppercase; }
					::-moz-placeholder { color: #ccc; text-transform: uppercase; }
					:-ms-input-placeholder { color: #ccc; text-transform: uppercase; }

					form button[type=submit] {
					  width: 248px;
					  margin-bottom: 0;
					  color: #3f898a;
					  letter-spacing: .05em;
					  text-shadow: 0 1px 0 #133d3e;
					  text-transform: uppercase;
					  background: #225556;
					  border-top-color: #9fb5b5;
					  border-left-color: #608586;
					  border-bottom-color: #1b4849;
					  border-right-color: #1e4d4e;
					  cursor: pointer;
					}
		
		</style>
       
    </head>
    <body>
       
		            <div id="bg"></div>

					<form action="<%= $app->urlFor('st_login')%>" enctype="application/x-www-form-urlencoded" method="post">
					  <% if(isset($_SESSION['error'])) : %><label style="color:pink;font-size:15px;"><%= strtoupper($_SESSION['error']);%></label><br><br><% endif;unset($_SESSION['error']);%>
					  <label for=""><center><img src="<%= $_SESSION['settings']['logo']%>" width="100px;" style="border-radius:50px;box-shadow:0 0 8px #999;"/><h2 class="title" style="font-size:11px;font-weight:bolder;"><%= strtoupper($_SESSION['settings']['institution']);%></h2><h2 class="title" style="font-size:11px;font-weight:bolder;">STUDENT MANAGEMENT SYSTEM</h2><br><hr><b> eSHS - PORTAL </b><hr></center></label><br>
					  <input type="text" name="username" id="" placeholder="Student ID" class="email">
						
					 
					  <input type="password" name="password" id="" placeholder="password" class="pass">
						
					  <button type="submit">login to your account</button>
					  <p style="text-align:center;color:#eee;"><small>&copy;<% echo date("Y");%>, All rights reserved. <strong><a target="_blank" href="" style="text-decoration:none;color:#ccc;"><%= $_SESSION['settings']['sms_sender']%>.</a><b class="pull-right">POWERED BY <img class="" src="/nurse/ui/img/ksoft.png" style="height:50px;" alt="K-Soft GH - 0248577384" onclick="alert('Contact K-SOft GH for your Customized Software!\n\nWe Build : Android Apps, Web applications, Desktop applications, Websites, E-commerce Sites!\n\nServices: Data Migration - All Databases, Data Collection apps, Data Management & Analysis, IT Training services for the Home!\n\nPhone: 0248577384, 0245776265, 0204186079\nE-mail: info@ksoftgh.com, ksoftghltd@gmail.com\nWebsite: www.ksoftgh.com\n\nCreating with Style!')"/><b></strong></em></small></p>
                    
					</form>
					       

        
    </body>
</html>