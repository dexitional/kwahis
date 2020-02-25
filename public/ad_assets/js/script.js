/**
 * The script is encapsulated in an self-executing anonymous function,
 * to avoid conflicts with other libraries
 */
(function($) {
	/**
	 * Declare 'use strict' to the more restrictive code and a bit safer,
	 * sparing future problems
	 */
	"use strict";

	/***********************************************************************/
	/*****************************  $Content  ******************************/
	/**
	* + Content
	* + Animate Items
	* + Slider Revolution
	* + Calendar
	* + Owl Carousel
	* + Easy PaiChart
	* + Timetable Tooltip
	* + Gmap
	* + Tooltips
	* + Qty
	* + Tooltips
	* + Sky-carousel
	* + Collapse Icon
	* + Twitter
	* + Isotope
	* + Slider Range
	* + Sport Graphics
	* + Video Background
	*/

	/*********************  $Animate Items on Start  **********************/
	$('.animated').appear(function() {
		var elem = $(this);
		var animation = elem.data('animation');
		if ( !elem.hasClass('visible') ) {
			var animationDelay = elem.data('animation-delay');

			if ( animationDelay ) {
				setTimeout(function(){
					elem.addClass( animation + " visible" );
				}, animationDelay);

			} else {
				elem.addClass( animation + " visible" );

			}
		}
	});

	/***********************  $Slider Revolution  **************************/
	jQuery('.tp-banner2').show().revolution(
          {
            delay:11000,
            startwidth:1170,
            startheight:450,
            hideThumbs:1,

            thumbWidth:100,
            thumbHeight:50,
            thumbAmount:5,

            navigationType:"bullet",
            navigationArrows:"solo",
            navigationStyle:"preview4",

            touchenabled:"on",
            onHoverStop:"on",

            swipe_velocity: 0.7,
            swipe_min_touches: 1,
            swipe_max_touches: 1,
            drag_block_vertical: false,

            parallax:"mouse",
            parallaxBgFreeze:"on",
            parallaxLevels:[7,4,3,2,5,4,3,2,1,0],

            keyboardNavigation:"off",

            navigationHAlign:"center",
            navigationVAlign:"bottom",
            navigationHOffset:0,
            navigationVOffset:20,

            soloArrowLeftHalign:"left",
            soloArrowLeftValign:"center",
            soloArrowLeftHOffset:20,
            soloArrowLeftVOffset:0,

            soloArrowRightHalign:"right",
            soloArrowRightValign:"center",
            soloArrowRightHOffset:20,
            soloArrowRightVOffset:0,

            shadow:0,
            fullWidth:"on",
            fullScreen:"off",

            spinner:"spinner4",

            stopLoop:"off",
            stopAfterLoops:-1,
            stopAtSlide:-1,

            shuffle:"off",

            autoHeight:"off",
            forceFullWidth:"off",

            hideThumbsOnMobile:"off",
            hideNavDelayOnMobile:1500,
            hideBulletsOnMobile:"off",
            hideArrowsOnMobile:"off",
            hideThumbsUnderResolution:0,

          });

	/*********************  $Calendar  **********************/
	$(document).ready(function() {
	    $("#datepicker").datepicker();
	    $("#datepicker2").datepicker();
  	});

	/*********************  $Owl Carousel - Partners  **********************/
	$("#owl-patners").owlCarousel({
		items : 5,
		slideSpeed: 300,
        paginationSpeed: 400,

		autoPlay: false,
		stopOnHover: true,
		navigation: true,
		pagination: false,
		navigationText: ["",""]
	});

	$("#owl-patners-two").owlCarousel({
		items : 5,
		slideSpeed: 300,
        paginationSpeed: 400,

		autoPlay: false,
		stopOnHover: true,
		navigation: false,
		pagination: true,
		navigationText: ["",""]
	});

	/***************************  $Easy PaiChart  *******************************/
	if ($('.chart').length) {
		$('.chart').easyPieChart({
			animate: 2000,
			barColor: "#ebebeb",
			trackColor: "#3da5e2",
			scaleColor: "#ebebeb",
			lineWidth: 6,
			lineCap: "square",
		});
	}
	if ($('.chart-2').length) {
		$('.chart-2').easyPieChart({
			animate: 2000,
			barColor: "#ebebeb",
			trackColor: "#ffbf35",
			scaleColor: "#ebebeb",
			lineWidth: 6,
			lineCap: "square",
		});
	}
	if ($('.chart-3').length) {
		$('.chart-3').easyPieChart({
			animate: 2000,
			barColor: "#ebebeb",
			trackColor: "#39b54a",
			scaleColor: "#ebebeb",
			lineWidth: 6,
			lineCap: "square",
		});
	}
	if ($('.chart-4').length) {
		$('.chart-4').easyPieChart({
			animate: 2000,
			barColor: "#ebebeb",
			trackColor: "#ff5335",
			scaleColor: "#ebebeb",
			lineWidth: 6,
			lineCap: "square",
		});
	}

	/*************************  $Timetable Tooltip  ************************/
	$('.dash-links a').tooltip({placement: 'bottom'});
	
	/*************************  Navigation Tooltips  @Kobby Kay ************************/
	$('.timetable a').tooltip({placement: 'top'})

	/********************************  $Gmap  ********************************/
	var map;
	if ($('#map').length) {
		map = new GMaps({ div: '#map', lat: 48.858093, lng: 2.294694, scrollwheel: false, });
		map.addMarker({ lat: 48.858093, lng: 2.294694  });
	}

	/*****************************  $Tootips  ******************************/
	function changeTooltipColorTo(color) {
		$('.tooltip-inner').css('background-color', color);
		$('.tooltip').css('background-color', color);
		$('.tooltip.top .tooltip-arrow').css('border-top-color', color);
		$('.tooltip.right .tooltip-arrow').css('border-right-color', color);
		$('.tooltip.left .tooltip-arrow').css('border-left-color', color);
		$('.tooltip.bottom .tooltip-arrow').css('border-bottom-color', color);
		
	}

	$('.social-links a').tooltip({placement: 'top'})
	

	/*********************  $Qty  **********************/
	 jQuery(".minus_btn").on('click',function() {
        var inputEl = jQuery(this).parent().children().next();
        var qty = inputEl.val();
        if (jQuery(this).parent().hasClass("minus_btn"))
            qty++;
        else
            qty--;
        if (qty < 0)
            qty = 0;
        inputEl.val(qty);
    })
    jQuery(".plus_btn").on('click', function() {
        var inputEl = jQuery(this).parent().children().next();
        var qty = inputEl.val();
        if (jQuery(this).hasClass("plus_btn"))
            qty++;
        else
            qty--;
        if (qty < 0)
            qty = 0;
        inputEl.val(qty);
    })

	/*********************  $Sky-carousel  **********************/
	$('.sky-carousel').carousel({
		itemWidth : 232,
		itemHeight : 240,
		distance : 30,
		selectedItemDistance : 50,
		selectedItemZoomFactor : 1,
		unselectedItemZoomFactor : 0.35,
		unselectedItemAlpha : 1,
		motionStartDistance : 170,
		topMargin : 0,
		enableMouseWheel: false,
		gradientStartPoint : 0.35,
		gradientOverlayColor : "#f5f5f5",
		gradientOverlaySize : 0,
		reflectionDistance : 1,
		reflectionAlpha : 0.35,
		reflectionVisible : false,
		reflectionSize : 0,
		navigationButtonsVisible : false,
		selectByClick : true
	});

	/***************************  $Collapse Icon  **************************/
	function changeIcon(e, icons){
		var $emt = $(e.target).parents('.panel'),
			$ico = $emt.find('h4 a i'),
			evt = e.type,
			isIn = ($emt.find('.panel-collapse').hasClass('in')),
			icoClosed = icons[0],	//icon when panel is close
			icoOpen   = icons[1],	//icon when panel is open
			icoHover  = icons[2];			//icon when panel is hover

		$ico.removeClass();

		if (evt == 'show'){ 				$ico.addClass(icoOpen);
		} else if (evt == 'hide'){ 			$ico.addClass(icoClosed);
		} else if (evt == 'mouseenter'){ 	$ico.addClass(icoHover);
		} else if (evt == 'mouseleave'){
			( isIn )? $ico.addClass(icoOpen) : $ico.addClass(icoClosed);
		}
	}

	function bindChangeIcon(collapse, heading, icons){
		collapse.on('hide.bs.collapse', function (e){ changeIcon(e, icons); });
		collapse.on('show.bs.collapse', function (e){ changeIcon(e, icons); });
		heading.on('mouseenter', function (e){ changeIcon(e, icons); });
		heading.on('mouseleave', function (e){ changeIcon(e, icons); });
	}

	var $collapse1 = $('#accordion'),
		$heading1 = $collapse1.find('.panel-heading'),
		icons1 = ['fa fa-angle-down', 'fa fa-angle-down', 'fa fa-angle-up'];

	bindChangeIcon($collapse1, $heading1, icons1);

	var $collapse2 = $('#accordion-work2'),
		$heading2 = $collapse2.find('.panel-heading'),
		icons2 = ['fa fa-minus-square', 'fa fa-plus-square', 'fa fa-plus-square'];

	bindChangeIcon($collapse2, $heading2, icons2);

	/*********************  $Twitter  **********************/
    $(".sidebar-twitter").tweet({
        join_text: "<br>@" + "CoralixThemes" + " - ",
        avatar_size: 60,
        username: 'CoralixThemes',
        modpath: 'js/vendors/twitter/',
        count: 3,
        loading_text: "loading twitter feed..."
    });

	/*************************** $Slider Range  *****************************/
	function initSliderRange(element, pre, app, min, max, step, val, tooltip) {
		element.slider({
				range: true,
				min: min,
				max: max,
				value : val,
				step: step,
				tooltip: tooltip,
			})
			.on('slide', function(ev){
				$(this).parent().parent().find('.input_range.min').val(ev.value[0])
				$(this).parent().parent().find('.span_range.min').html(pre + ev.value[0] + app)

				$(this).parent().parent().find('.input_range.max').val(ev.value[1])
				$(this).parent().parent().find('.span_range.max').html(pre + ev.value[1] + app)
			});
	}


	if ($('#slider-price').length) {
		initSliderRange(
			$('#slider-price .slider'),	//element
			'$ ',						//Preppend
			'',							//Append
			100,						//Min
			90000,						//Max
			1000,						//Step
			[24100,60100],				//Value
			'hide'						//Tooltip
		)
	}

	/*************************  $Background Video  *************************/
	$('#video-bg').click(function(e){
		e.preventDefault();

		var $container = $(this).parent().parent();
		var $over = $container.find('.over');
		var overInitLeft = $over.css('left');
		var $stop = $container.find('.stop');
		var $video = $container.find('.yt-video iframe');
		var video_src = $video.attr('src');

		if ( video_src.indexOf('?') == '-1'){
			var separator = '?';
		}else{
			var separator = '&amp;';
		}

		$video.attr('src',video_src+separator+'autoplay=1')

		$over.animate({
			left: '-150%',
		}, 500);

		$stop.click(function(e){
			e.preventDefault();
			$video.attr('src',video_src);

			$over.animate({
				left: overInitLeft,
			}, 500);

			setTimeout(function(){
				$stop.animate({
					opacity: 0
				}, 1000, function(){
					$stop.hide();
				})
			}, 1000)
		})


		$stop.show(0, function(){
			setTimeout(function(){
				$stop.animate({
					opacity: 1
				}, 1000)
			}, 3000)
		})

	});

    /*********************  $Isotope  **********************/
	$(window).load(function(){
	if ($('.gallery-grid').length) {
		// cache container
		var $container = $('.gallery-grid');

		// initialize isotope
		$container.isotope({ });

		// filter items when filter link is clicked
		$('.filters a').click(function(){
			$('.filters a').removeClass('active');
			$(this).addClass('active');

			var selector = $(this).attr('data-filter');
			$container.isotope({ filter: selector });
			return false;
		});
	}
	});
	/**************************  $Send Forms  ******************************/
	$("#newsletter, #contact, #request").submit(function() {
		var elem = $(this);
		var urlTarget = $(this).attr("action");
		$.ajax({
			type : "POST",
			url : urlTarget,
			dataType : "html",
			data : $(this).serialize(),
			beforeSend : function() {
				elem.prepend("<div class='loading alert'>" + "<a class='close' data-dismiss='alert'>×</a>" + "Loading" + "</div>");
				//elem.find(".loading").show();
			},
			success : function(response) {
				elem.prepend(response);
				//elem.find(".response").html(response);
				elem.find(".loading").hide();
				elem.find("input[type='text'],input[type='email'],textarea").val("");
			}
		});
		return false;
	});

})(jQuery);
