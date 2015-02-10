 window.onload = function() {
		skrollr.init({
		forceHeight: false
	});
	$('.loadbg').fadeOut(1000);  
	
	}
	
	
	$(document).ready(function(){
	
			var $doc = $(document);
			var $win = $(window);
			// dimensions - we want to cache them on window resize
			var windowHeight, windowWidth;
			var fullHeight, scrollHeight;
			var streetImgWidth = 1000, streetImgHeight = 630;
			calculateDimensions();
 			var currentPosition = -1, targetPosition = 0;
			var $videoContainer = $('.ssd1');
 			var imageSeqLoader = new ProgressiveImageSequence( "img/s1/vid-{index}.jpg"  , 77 , {
				indexSize: 2,
				initialStep: 16,
				onProgress: handleLoadProgress,
				onComplete: handleLoadComplete,
				stopAt: 1
			} );
			
			var roll;
			 function setratio(){
				
				roll = setInterval(function(){
				var today = new Date();
				var BigDay = new Date("December 25, 2012");
				var Birthday = new Date("June 16, 1989");
				var delta = (today.getTime() - BigDay.getTime() );
				var ratio = 100 * delta / (today.getTime() - Birthday.getTime());
				$('.digit2').text(ratio.toFixed(10));
				},1000);
				
				
			}
				
			
			function slotmachine() { 
				 
				var today = new Date();
				var BigDay = new Date("December 25, 2012"); 
				var delta = (today.getTime() - BigDay.getTime() ); 
				var days = Math.floor(delta / (24 * 60 * 60 * 1000));
				var $obj = $('.digit');
				//var original = $obj.text();
				var spin = function() {
					return Math.floor(Math.random() * 10);
				};
				
				var spinning = setInterval(function() {
					$obj.text(function() {
					var result = '';
					for (var i = 0; i < days.toString().length; i++) {
							result += spin().toString();
					}
					return result;
					});
				}, 50);

				var done = setTimeout(function() {
					clearInterval(spinning);
					$obj.text(days).css('opacity', '1');
					
					
				}, 1000);
			}
			// handling resize and scroll events			
			function calculateDimensions() {
				windowWidth = $win.width();
				windowHeight = $win.height();
				fullHeight = $('#ssd-1').height();
				scrollHeight = fullHeight - windowHeight;				
			}
			function handleResize() {
				calculateDimensions();
				resizeBackgroundImage();
				handleScroll();
			}
			
			function handleScroll() {		
				var current = 0, curr = 1;
				if($win.scrollTop()>4000){
					current = 7000; 
					if($win.scrollTop() < 5300){
					slotmachine();
					}
					if($win.scrollTop() > 4600){
						setratio();
					}
					if($win.scrollTop() > 7000){
					clearInterval(roll);
					}
				}
				 
				
								
				targetPosition = ( $win.scrollTop() - current  )/ scrollHeight;
				 if(targetPosition > 1 && $win.scrollTop()<6100){
					targetPosition = 1;
				 }
			}
			
			function findindex(position){
				if($win.scrollTop() < 6100){
					return Math.round( position * (imageSeqLoader.length - 37 -1));
				}
				if($win.scrollTop() > 7000){
					return Math.round( position * 14.4 + 40 );
				}
				else
					return 41;
			
			
			}
			
			// main render loop
			window.requestAnimFrame = (function(){
			  return  window.requestAnimationFrame       ||
			          window.webkitRequestAnimationFrame ||
			          window.mozRequestAnimationFrame    ||
			          window.oRequestAnimationFrame      ||
			          window.msRequestAnimationFrame     ||
			          function(/* function */ callback, /* DOMElement */ element){
			            window.setTimeout(callback, 1000 / 60);
			          };
			})();


			function animloop(){
				 if ( Math.floor(currentPosition*5000) != Math.floor(targetPosition*5000) ) {
 					currentPosition += (targetPosition - currentPosition) / 5;
					renderVideo(currentPosition);
				}
				requestAnimFrame(animloop);
			}

			// rendering

  
			function resizeBackgroundImage(){
				// get image container size
				var scale = Math.max( windowHeight/streetImgHeight , windowWidth/streetImgWidth );
				var width = scale * streetImgWidth , height = scale * streetImgHeight;
				var left = (windowWidth-width)/2, top = (windowHeight-height)/2;
				$videoContainer
						  .width(width).height(height)
						  .css('position','fixed')
						  .css('left',left+'px')
						  .css('top',top+'px');
			}

			// video handling
			var loadCounterForIE = 0; // there seems to be a problem with ie calling the callback several times
			imageSeqLoader.loadPosition(currentPosition,function(){
				loadCounterForIE++;
				if ( loadCounterForIE == 1 ) {
					renderVideo(currentPosition);
					imageSeqLoader.load();
					imageSeqLoader.load();
					imageSeqLoader.load();
					imageSeqLoader.load();
				}
			});


			var currentSrc, currentIndex;

			function renderVideo(position) {
				var imgindex = findindex(position) ;	 
				var img = imageSeqLoader.getNearest( imgindex );
				var $img = $(img);
				var src;
				if ( !!img ) {
					src = img.src;
					if ( src != currentSrc ) {
						$('.ssd1').css('background', 'url("' + src + '")');
						currentSrc = src;
					}
				}
  			}


			$('body').append('<div id="loading-bar" style="position:fixed; bottom:0; left:0; background-color: #DF0012; background-color: rgba(223,0,18,0.5); height: 1px;"></div>');
			
			function handleLoadProgress() {
				var progress = imageSeqLoader.getLoadProgress() * 100;
				$('#loading-bar').css({width:progress+'%',opacity:1});
			}

			function handleLoadComplete() {
				$('#loading-bar').css({width:'100%',opacity:0});
			}
 
			$win.resize( handleResize );
			$win.scroll( handleScroll );

			handleResize();
			
			animloop();
			
			
			
			
	});