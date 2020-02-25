  <% require 'header.php';%>
            <div class="page-inner">
                <% require 'breadcrump.php';%>
				
                <div id="main-wrapper">
                    <div class="row">
					     <div class="panel panel-white">
                                    <div class="panel-heading clearfix hidden-print">
                                        <h3 class="panel-title">Student Resources</h3>
                                    </div>
                                    <div class="panel-body">
                                        <div role="tabpanel">
                                            <!-- Nav tabs -->
                                            <ul class="nav nav-tabs hidden-print" role="tablist">                                        
                                                <li role="presentation" class=""><a href="#tabc" aria-controls="home" role="tab" data-toggle="tab" aria-expanded="false">CLASS TIMETABLE</a></li>				
                                                <li role="presentation" class=""><a href="#tabe" aria-controls="home" role="tab" data-toggle="tab" aria-expanded="false">EXAM TIMETABLE</a></li>                                               
												<li role="presentation" class=""><a href="#tabar" aria-controls="home" role="tab" data-toggle="tab" aria-expanded="false">AWARD RECORDS</a></li>
                                                <li role="presentation" class=""><a href="#tabdr" aria-controls="home" role="tab" data-toggle="tab" aria-expanded="false">DISCIPLINARY RECORDS</a></li>
												
                                            </ul>
                                            <!-- Tab panes -->
                                            <div class="tab-content">										

                                                <!-- # Class Timetable -->												
                                                <div role="tabpanel" class="tab-pane fade" id="tabc">                                                       
                                                       <div class="row">
													         <div class="col-md-12">															 
															         <div class="panel panel-white">
																				<div class="panel-heading clearfix">
																					<h4 class="panel-title">Exam Timetables</h4>
																				</div>
																				<div class="panel-body">
																				   <div class="table-responsive">
																				      <table id="st_award_table" class="display table dataTable" cellspacing="0" width="100%" role="grid" aria-describedby="example_info" style="width: 100%;">
																						<thead>
																						    <tr><th rowspan="1" colspan="1">Title Class-timetable</th><th rowspan="1" colspan="1">Year</th><th rowspan="1" colspan="1">Term</th><th rowspan="1" colspan="1">Form</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</thead>
																						<tfoot>
																							<tr><th rowspan="1" colspan="1">Title Class-timetable</th><th rowspan="1" colspan="1">Year</th><th rowspan="1" colspan="1">Term</th><th rowspan="1" colspan="1">Form</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</tfoot>
																						<tbody>
																						    <% if(isset($bill)){
																										// Pass Student_id as arg
																										   $bdata = $bill->getCTime($_SESSION['student']['class_id'],$_SESSION['academ']['academ']);																
																									    
																										if(!is_null($bdata)){	
																										 foreach($bdata as $value){
																								  %>
																						
																								<tr role="row" class="odd">
																										<td class="sorting_1"><%= $value['form_status'].$value['short_name'].' '.$value['title'];%></td>
																										<td><%= $value['year'];%></td>
																										<td><%= $value['term'];%></td>
																										<td>Form <%= $value['form_status'];%></td>
																										<td>
																										    <button type="button" class="btn btn-default btn-addon m-b-0" data-toggle="modal" data-target=".tc<%= $value['id'];%>"><i class="fa fa-plus"></i> View Timetable</button>
																											<div class="modal fade tc<%= $value['id'];%>" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="display: none;">
																														<div class="modal-dialog modal-lg">
																															<div class="modal-content">
																																<div class="modal-header">
																																	<button type="button" class="close hidden-print" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
																																	<h4 class="modal-title hidden-print" id="myModalLabel">Exam Timetable</h4>
																																</div>
																																<div class="modal-body" id="tc<%= $value['id'];%>">
																																	      <table style="width:100%;margin:5px;padding:5px;border:3px solid green;">
																																				      <tr>
																																					       <td colspan="2" align="right">																																						      
																																							     <img src="<%= $_SESSION['setting']['school_logo'];%>" style="display:block;height:80px;float:left;margin-right:10px;"/>																																							    																																						  
																																						   </td>																																						   
																																					       <td  align="left"><h3><%= $value['form_status'].$value['short_name'];%> - Class Timetable</h3></td></tr>
																																					   <tr>
																																					       <td colspan="3">
																																						      <div class="table-responsive">
																																								   <%= $value['html_content'];%>
																																							 </div>
																																						   </td>																																						   
																																					  </tr>
																																					  
																																				 </table>
																																		  </div> 
																																		 
																																</div>
																																<div class="modal-footer hidden-print">
																																	<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
																																	<button type="button" class="btn btn-success" onclick="window.print();"><i class="fa fa-print"></i> Print</button>
																																</div>
																															</div>
																														</div>
																													</div>
																										</td>																										
																									</tr>
																								 <% }}else{echo '<tr><td colspan="5" align="center"><em>No Timetable populated..</em></td></tr>';}}%>	
																							</tbody>
																					   </table>  
																					</div>
																				</div>
																			</div>
															 </div>
											           </div>
												</div>
                      

										  


                                          <!-- # Exam Timetable -->												
                                                <div role="tabpanel" class="tab-pane fade" id="tabe">                                                       
                                                       <div class="row">
													         <div class="col-md-12">															 
															         <div class="panel panel-white">
																				<div class="panel-heading clearfix">
																					<h4 class="panel-title">Exam Timetables</h4>
																				</div>
																				<div class="panel-body">
																				   <div class="table-responsive">
																				      <table id="st_award_table" class="display table dataTable" cellspacing="0" width="100%" role="grid" aria-describedby="example_info" style="width: 100%;">
																						<thead>
																						    <tr><th rowspan="1" colspan="1">Title Exam-timetable</th><th rowspan="1" colspan="1">Year</th><th rowspan="1" colspan="1">Term</th><th rowspan="1" colspan="1">Form</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</thead>
																						<tfoot>
																							<tr><th rowspan="1" colspan="1">Title Exam-timetable</th><th rowspan="1" colspan="1">Year</th><th rowspan="1" colspan="1">Term</th><th rowspan="1" colspan="1">Form</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</tfoot>
																						<tbody>
																						    <% if(isset($bill)){
																										// Pass Student_id as arg
																										   $bdata = $bill->getETime($_SESSION['student']['form_status']);																
																										
																									  if(!is_null($bdata)){	
																										foreach($bdata as $value){
																								  %>
																						
																								<tr role="row" class="odd">
																										<td class="sorting_1"><%= $value['title'];%></td>
																										<td><%= $value['year'];%></td>
																										<td><%= $value['term'];%></td>
																										<td>Form <%= $value['form_status'];%></td>
																										<td>
																										    <button type="button" class="btn btn-default btn-addon m-b-0" data-toggle="modal" data-target=".te<%= $value['id'];%>"><i class="fa fa-plus"></i> View Timetable</button>
																											<div class="modal fade te<%= $value['id'];%>" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="display: none;">
																														<div class="modal-dialog modal-lg">
																															<div class="modal-content">
																																<div class="modal-header">
																																	<button type="button" class="close hidden-print" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
																																	<h4 class="modal-title hidden-print" id="myModalLabel">Exam Timetable</h4>
																																</div>
																																<div class="modal-body" id="te<%= $value['id'];%>">
																																	      <table style="width:100%;margin:5px;padding:5px;border:5px dashed green;">
																																				      <tr>
																																					       <td colspan="3" align="center">
																																						       <h1><%= $_SESSION['setting']['school_name'];%></h1><br>
																																							     <img src="<%= $_SESSION['setting']['school_logo'];%>" style="display:block;height:100px;"/><br>
																																							     <%= $_SESSION['setting']['school_address'];%>	<br>																																							  
																																						   </td>																																						   
																																					  </tr>
																																					   <tr><td colspan="3" align="center"><h3>Form <%= $value['form_status'];%> Term <%= $value['term'];%> - Exam Timetable</h3></td></tr>
																																					   <tr>
																																					       <td colspan="3">
																																						      <div class="table-responsive">
																																								   <%= $value['html_content'];%>
																																							  </div>
																																						   </td>																																						   
																																					  </tr>
																																					  
																																				 </table>
																																		  </div> 
																																		 
																																</div>
																																<div class="modal-footer hidden-print">
																																	<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
																																	<button type="button" class="btn btn-success" onclick="window.print();"><i class="fa fa-print"></i> Print</button>
																																</div>
																															</div>
																														</div>
																													</div>
																										</td>																										
																									</tr>
																								 <% }}else{echo '<tr><td colspan="5" align="center"><em>No Timetable populated..</em></td></tr>';}}%>	
																							</tbody>
																					   </table>  
																					</div>
																				</div>
																			</div>
															 </div>
											           </div>
												</div>



												
											
											<!-- # Award Records -->												
                                                <div role="tabpanel" class="tab-pane fade" id="tabar">                                                       
                                                       <div class="row">
													         <div class="col-md-12">															 
															         <div class="panel panel-white">
																				<div class="panel-heading clearfix">
																					<h4 class="panel-title">Student's Award(s)</h4>
																				</div>
																				<div class="panel-body">
																				   <div class="table-responsive">
																				      <table id="st_award_table" class="display table dataTable" cellspacing="0" width="100%" role="grid" aria-describedby="example_info" style="width: 100%;">
																						<thead>
																						    <tr><th rowspan="1" colspan="1">Title of Award</th><th rowspan="1" colspan="1">Date Issued</th><th rowspan="1" colspan="1">Academic Year won</th><th rowspan="1" colspan="1">Level won</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</thead>
																						<tfoot>
																							<tr><th rowspan="1" colspan="1">Title of Award</th><th rowspan="1" colspan="1">Date Issued</th><th rowspan="1" colspan="1">Academic Year won</th><th rowspan="1" colspan="1">Level won</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</tfoot>
																						<tbody>
																						    <% if(isset($bill)){
																										// Pass Student_id as arg
																										   $bdata = $bill->getAward($_SESSION['student']['id']);																
																										foreach($bdata as $value){
																								  %>
																						
																								<tr role="row" class="odd">
																										<td class="sorting_1"><%= $value['title'];%></td>
																										<td><%= $value['issue_date'];%></td>
																										<td><%= $value['year'];%></td>
																										<td>Form <%= $value['form_status'];%></td>
																										<td>
																										    <button type="button" class="btn btn-default btn-addon m-b-0" data-toggle="modal" data-target=".ar<%= $value['id'];%>"><i class="fa fa-plus"></i> View Citation</button>
																											<div class="modal fade ar<%= $value['id'];%>" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="display: none;">
																														<div class="modal-dialog modal-lg">
																															<div class="modal-content">
																																<div class="modal-header">
																																	<button type="button" class="close hidden-print" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
																																	<h4 class="modal-title hidden-print" id="myModalLabel">Award & Citation</h4>
																																</div>
																																<div class="modal-body" id="ar<%= $value['id'];%>">
																																	      <div>
																																		         <table style="width:100%;margin:5px;padding:5px;border:5px dashed green;">
																																				      <tr>
																																					       <td colspan="3" align="center">
																																						       <h1><%= $_SESSION['setting']['school_name'];%></h1><br>
																																							     <img src="<%= $_SESSION['setting']['school_logo'];%>" style="display:block;height:100px;"/><br>
																																							     <%= $_SESSION['setting']['school_address'];%>	<br>																																							  
																																						   </td>																																						   
																																					  </tr>
																																					   <tr>
																																					       <td colspan="3" align="center"><h2>CITATION</h2></td>																																						   
																																					  </tr>
																																					   <tr>
																																					       <td colspan="3" align="center">
																																						       <div>
																																							      This Citation is awarded to <strong><%= $_SESSION['student']['first_name'].' '.$_SESSION['student']['middle_name'].' '.$_SESSION['student']['last_name'];%></strong><br>
																																							      for being the <strong><%= $value['title'];%></strong></br>
																																								  throughout the <%= $value['year'];%> Academic Year.<br>
																																							   </div>
																																						   </td>
																																					  </tr>
																																					   <tr>
																																					       <td>&nbsp;</td>
																																						   <td>
																																						       <address>
																																							       Signed : <br/>
																																								   <img src="<%= $_SESSION['setting']['head_stamp'];%>" style="height:80px;"/><br>
																																								   <em><strong>( HEAD OF SCHOOL MANAGEMENT ).</strong></em>		
																																							   </address>										 																												   
																																						   </td>																																						  
																																						   <td>&nbsp;</td>
																																					  </tr>
																																				 </table>
																																		  </div>
																																</div>
																																<div class="modal-footer hidden-print">
																																	<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
																																	<button type="button" class="btn btn-success" onclick="window.print();"><i class="fa fa-print"></i> Print</button>
																																</div>
																															</div>
																														</div>
																													</div>
																										</td>																										
																									</tr>
																								<% }}%>
																							</tbody>
																					   </table>  
																					</div>
																				</div>
																			</div>
															 </div>
											           </div>
												</div>

											
											
											<!-- #Disciplinary records -->											
                                                <div role="tabpanel" class="tab-pane fade" id="tabdr">                                                       
                                                       <div class="row">
													         <div class="col-md-12">															 
															         <div class="panel panel-white">
																				<div class="panel-heading clearfix">
																					<h4 class="panel-title">Student's Sanctions & Warnings</h4>
																				</div>
																				<div class="panel-body">
																				   <div class="table-responsive"><table id="st_sanction_table" class="display table dataTable" cellspacing="0" width="100%" role="grid" aria-describedby="example_info" style="width: 100%;">
																						<thead>
																						    <tr><th rowspan="1" colspan="1">Title of Sanction</th><th rowspan="1" colspan="1">Date of Sanction</th><th rowspan="1" colspan="1">Academic Year </th><th rowspan="1" colspan="1">Level Sanctioned</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</thead>
																						<tfoot>
																							<tr><th rowspan="1" colspan="1">Title of Sanction</th><th rowspan="1" colspan="1">Date of Sanction</th><th rowspan="1" colspan="1">Academic Year</th><th rowspan="1" colspan="1">Level Sanctioned</th><th rowspan="1" colspan="1">&nbsp;</th></tr>
																						</tfoot>
																						<tbody>																	
																								 <% if(isset($bill)){
																										// Pass Student_id as arg
																										   $bdata = $bill->getSanction($_SESSION['student']['id']);																
																										foreach($bdata as $value){
																								  %>
																								
																								<tr role="row" class="odd">
																										<td class="sorting_1"><%= $value['title'];%></td>
																										<td><%= $value['issue_date'];%></td>
																										<td><%= $value['year'];%></td>
																										<td>Form <%= $value['form_status'];%></td>
																										<td>
																										    <button type="button" class="btn btn-default btn-addon m-b-0" data-toggle="modal" data-target=".dr<%= $value['id'];%>"><i class="fa fa-plus"></i> View Letter</button>
																											<div class="modal fade dr<%= $value['id'];%>" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="display: none;">
																														<div class="modal-dialog modal-lg">
																															<div class="modal-content">
																																<div class="modal-header">
																																	<button type="button" class="close hidden-print" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
																																	<h4 class="modal-title hidden-print" id="myModalLabel"><%= $value['title'];%></h4>
																																</div>
																																<div class="modal-body" id="dr<%= $value['id'];%>">
																																	      <div>
																																		         <table style="width:100%;margin:5px;padding:5px;border:1px solid #999;">
																																				      <tr>																																					       
																																						   <td align="center" colspan="3">
																																						         <h1><%= $_SESSION['setting']['school_name'];%></h1><br>
																																							     <img src="<%= $_SESSION['setting']['school_logo'];%>" style="display:block;height:100px;"/><br>
																																							     <%= $_SESSION['setting']['school_address'];%>	<br>
																																						   </td>
																																						   
																																					  </tr>
																																					  <tr>
																																					       <td align="left">																																							  
																																							  <h4> Dear &nbsp;<em><%= $_SESSION['student']['first_name'].' '.$_SESSION['student']['middle_name'].' '.$_SESSION['student']['last_name'];%></em>,</h4>																																							  
																																						   </td>
																																						   <td align="center">&nbsp;</td>
																																						   <td align="left"><h4><em>Date Issued</em> : <%= $value['issue_date'];%></h4></td>
																																					  </tr>																																					  
																																					   <tr>
																																					       <td colspan="3" align="center"><h2 style="text-decoration:underline;"><%= strtoupper($value['title']);%></h2></td>																																						   
																																					  </tr>
																																					   <tr>
																																					       <td colspan="3">
																																						       <div><%= $value['html_content'];%></div>
																																						   </td>
																																					  </tr>
																																					   <tr>
																																						   <td>
																																						       <address>
																																							       SIGNED : <br/>
																																								   <img src="<%= $_SESSION['setting']['head_stamp'];%>" style="height:80px;"/><br>
																																								   <em><strong>( HEAD OF SCHOOL MANAGEMENT ).</strong></em>																																									
																																							   </address>										 																												   
																																						   </td>
																																						   <td></td>
																																						   <td></td>
																																					  </tr>
																																				 </table>
																																		  </div>
																																</div>
																																<div class="modal-footer hidden-print">
																																	<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
																																	<button type="button" class="btn btn-success" onclick="window.print();"><i class="fa fa-print"></i> Print</button>
																																</div>
																															</div>
																														</div>
																													</div>
																										</td>																										
																									</tr>
																									<% }}%>
																							</tbody>
																					   </table>
																				   </div>
																				</div>
																			</div>
															 </div>
											           </div>
												</div>						
												
												
											</div><!-- #tab content -->
											
											
											
											
											
											
                                        </div><!-- End of Tabs -->
                                    </div>
                                </div>
                    </div><!-- Row -->
                </div><!-- Main Wrapper -->
               <% require 'footer.php';%>
			   