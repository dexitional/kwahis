$(function(){
	
	// Fetch Student for Add Result Using Class ID
	$(".student_cover").hide();
	$(".addres_class").on('change',function(){
		var ds = $(this).val();
		$(".student_cover").hide();
			$.ajax({
				url:'/sims/get_snip_st/'+ds,
				dataType: 'html',
				success: function(res){
					var newData = JSON.parse(res);
					$(".addres_student").html(newData);
					$(".student_cover").slideDown();
				}				
			});
	});
	
	
	
	// Send Class details for population in Modal
	//$(".cl").hide();
	// Edit or Insert Score in Score Board
	$(".cl .cl_bt_update").on('click',function(){
		
		var parent = $(this).parent().parent();
		var academ = parent.find(".cl_academ").val();
		var meta = parent.find(".meta").val();
		var class_id = parent.find(".cl_id").html();
		var form_status = parent.find(".cl_form").html();
		
		//var ds = parent.html();		
			$.ajax({
				method : 'POST',
				url:'/sims/get_snip_cl/',
				dataType: 'html',
				data : 'meta='+meta+'&academ='+academ+'&class_id='+class_id+'&form='+form_status+'&action=update',
				success: function(res){
					var newData = JSON.parse(res);
					alert(newData);
					$("#tlcl"+class_id).html(newData);					
				}				
			});
	});
	
	
	// View Score Board
	$(".cl .cl_bt_view").on('click',function(){
		
		var parent = $(this).parent().parent();
		var academ = parent.find(".cl_academ").val();
		var meta = parent.find(".meta").val();
		var class_id = parent.find(".cl_id").html();
		var form_status = parent.find(".cl_form").html();
		alert("ok");
		//var ds = parent.html();		
			$.ajax({
				method : 'POST',
				url:'/sims/get_snip_cl/',
				dataType: 'html',
				data : 'meta='+meta+'&academ='+academ+'&class_id='+class_id+'&form='+form_status+'&action=view',
				success: function(res){
					var newData = JSON.parse(res);
					alert(newData);
					$("#tlclview"+class_id).html(newData);					
				}				
			});
	});
	
	
	
	
	
	
});