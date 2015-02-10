$(document).ready(function(){
       $('.curtains').curtain(
	   {
           scrollSpeed: 300,           
       });    
	   var s = skrollr.init();
			var $doc = $(document);
			var $win = $(window);
			// dimensions - we want to cache them on window resize
			var windowHeight, windowWidth;
			var fullHeight, scrollHeight;
			var streetImgWidth = 1000, streetImgHeight = 630;
			calculateDimensions();
 			var currentPosition = -1, targetPosition = 0;
			var $videoContainer = $('.ssd1');
			var video = $('.ssd1 > img')[0];
			var imageSeqLoader = new ProgressiveImageSequence( "img/s1/vid-{index}.jpg"  , 40 , {
				indexSize: 2,
				initialStep: 16,
				onProgress: handleLoadProgress,
				onComplete: handleLoadComplete,
				stopAt: 1
			} );
 
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
				targetPosition = $win.scrollTop() / scrollHeight;
			/*if( $win.scrollTop() >3000){
					$videoContainer = $('.ssd2');
					video = $('.ssd2 > img')[0];				
				}else {
					$videoContainer = $('.ssd1');
					video = $('.ssd1 > img')[0];				
				}
				*/

		//		console.log();
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
				var imgindex = Math.round( currentPosition * (imageSeqLoader.length-1) );
				var img = imageSeqLoader.getNearest( imgindex );
				var $img = $(img);
				var src;
				if ( !!img ) {
					src = img.src;
					if ( src != currentSrc ) {
						video.src = src;
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
(function ( $, window, document, undefined ) {

    var pluginName = 'curtain',
        defaults = {
            scrollSpeed: 400,
            bodyHeight: 0,
            linksArray: [],
            mobile: false,
            scrollButtons: {},
            controls: null,
            curtainLinks: '.curtain-links',
            enableKeys: true,
            easing: 'swing',
            disabled: false,
            nextSlide: function() {},
            prevSlide: function() {}
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        var self = this;

        // Public attributes
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;
        this._ignoreHashChange = false;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var self = this;

            // Cache element
            this.$element = $(this.element);
            this.$li = $(this.element).find('>li');
            this.$liLength = this.$li.length;
            self.$windowHeight = $(window).height();
            self.$elDatas = {};
            self.$document = $(document);
            self.$window = $(window);


            self.webkit = (navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf("Safari") > -1);
            $.Android = (navigator.userAgent.match(/Android/i));
            $.iPhone = ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)));
            $.iPad = ((navigator.userAgent.match(/iPad/i)));
            $.iOs4 = (/OS [1-5]_[0-9_]+ like Mac OS X/i.test(navigator.userAgent));
            /*
            if($.iPhone || $.iPad || $.Android || self.options.disabled){
                this.options.mobile = true;
                this.$li.css({position:'relative'});
                this.$element.find('.fixed').css({position:'absolute'});
            }
*/

            if(this.options.mobile){
               this.scrollEl =  this.$element;
            } else if($.browser.mozilla || $.browser.msie) {
                this.scrollEl = $('html');
            } else {
                this.scrollEl = $('body');
            }

            if(self.options.controls){
                self.options.scrollButtons['up'] =  $(self.options.controls).find('[href="#up"]');
                self.options.scrollButtons['down'] =  $(self.options.controls).find('[href="#down"]');

            //    if(!$.iOs4 && ($.iPhone || $.iPad)){  hhd
                    self.$element.css({
                        position:'fixed',
                        top:0,
                        left:0,
                        right:0,
                        bottom:0,
                        '-webkit-overflow-scrolling':'touch',
                        overflow:'auto'
                    });
                    $(self.options.controls).css({position:'absolute'});
              //  }
            }

            // When all image is loaded
            var callbackImageLoaded = function(){
                self.setDimensions();
                self.$li.eq(0).addClass('current'); 

                self.setCache();
                
                if(!self.options.mobile){
                    if(self.$li.eq(1).length)
                        self.$li.eq(1).nextAll().addClass('hidden');
                }

                self.setEvents();
                self.setLinks();
                self.isHashIsOnList(location.hash.substring(1));
            };

            if(self.$element.find('img').length)
                self.imageLoaded(callbackImageLoaded);
            else
                callbackImageLoaded();

        },
        // Events
        scrollToPosition: function (direction){
            var position = null,
                self = this;
            if(self.scrollEl.is(':animated')){
                return false;
            }
            if(direction === 'up' || direction == 'down'){
                // Keyboard event
                var $next = (direction === 'up') ? self.$current.prev() : self.$current.next();

                // Step in the current panel ?
                if(self.$step){

                    if(!self.$current.find('.current-step').length){
                        self.$step.eq(0).addClass('current-step');
                    }                        
                    var $nextStep = (direction === 'up') ? self.$current.find('.current-step').prev('.step') : self.$current.find('.current-step').next('.step');

                    if($nextStep.length) {
                        position = (self.options.mobile) ? $nextStep.position().top + self.$elDatas[self.$current.index()]['data-position'] : $nextStep.position().top + self.$elDatas[self.$current.index()]['data-position'];
                    }
                }

                position = position || ((self.$elDatas[$next.index()] === undefined) ? null : self.$elDatas[$next.index()]['data-position']);

                if(position !== null){
                    self.scrollEl.animate({
                        scrollTop: position
                    }, self.options.scrollSpeed, self.options.easing);
                }

            } else if(direction === 'top'){
                self.scrollEl.animate({
                    scrollTop:0
                }, self.options.scrollSpeed, self.options.easing);
            } else if(direction === 'bottom'){
                self.scrollEl.animate({
                    scrollTop:self.options.bodyHeight
                }, self.options.scrollSpeed, self.options.easing);
            } else {
                var index = $("#"+direction).index(),
                    speed = Math.abs(self.currentIndex-index) * (this.options.scrollSpeed*4) / self.$liLength;

                self.scrollEl.animate({
                    scrollTop:self.$elDatas[index]['data-position'] || null
                }, (speed <= self.options.scrollSpeed) ? self.options.scrollSpeed : speed, this.options.easing);
            }
            
        },
        scrollEvent: function() {
            var self = this,
                docTop = self.$document.scrollTop();
				 
             if(docTop < self.currentP && self.currentIndex > 0){
                // Scroll to top
                self._ignoreHashChange = true;

                if(self.$current.prev().attr('id'))
                    self.setHash(self.$current.prev().attr('id'));
                
                self.$current
                    .removeClass('current')
                    .css( (self.webkit) ? {'-webkit-transform': 'translateY(0px) translateZ(0)'} : {marginTop: 0} )
                    .nextAll().addClass('hidden').end()
                    .prev().addClass('current').removeClass('hidden');
  
                self.setCache();
                self.options.prevSlide();

            } else if(docTop < (self.currentP + self.currentHeight)){
			var cover = self.$current.hasClass('cover');
			var plus = 0;
			if(cover){
				 plus= docTop-self.currentP;
				 if(docTop>2100){
					plus=2100;
				 }				 
			}
			console.log(docTop+"|"+self.currentP+"|"+ self.currentHeight);// hhd

                // Animate the current pannel during the scroll
                if(self.webkit)
                    self.$current.css({'-webkit-transform': 'translateY('+(-(docTop-self.currentP)+plus)+'px) translateZ(0)' });
                else
                    self.$current.css({marginTop: -(docTop-self.currentP) });

                // If there is a fixed element in the current panel
                if(self.$fixedLength){
                    var dataTop = parseInt(self.$fixed.attr('data-top'), 10);
					if(docTop + self.$windowHeight >= self.currentP + self.currentHeight){
								
					   self.$fixed.css({
                            position: 'fixed'
                        });
                    } else {
                        self.$fixed.css({
                            position: 'absolute',
                            marginTop: Math.abs(docTop-self.currentP)
                        });
						
                    }
					
					 
                }
				
                
                // If there is a step element in the current panel
                if(self.$stepLength){
                    $.each(self.$step, function(i,el){
                        if(($(el).position().top+self.currentP) <= docTop+5 && $(el).position().top + self.currentP + $(el).height() >= docTop+5){
                            if(!$(el).hasClass('current-step')){
                                self.$step.removeClass('current-step');
                                $(el).addClass('current-step');
                                return false;
                            }
                        }
                    });
                }


                if(self.parallaxBg){
                    self.$current.css({
                        'background-position-y': docTop * self.parallaxBg
                    });
                }

				
                if(self.$fade.length){
                    self.$fade.css({
                        'opacity': (docTop/ self.$fade.attr('data-fade'))
                    });
                }

                if(self.$slowScroll.length){
                    self.$slowScroll.css({
                        'margin-top' : (docTop / self.$slowScroll.attr('data-slow-scroll'))
                    });
                }

            } else {
                // Scroll bottom
                self._ignoreHashChange = true;
                if(self.$current.next().attr('id'))
                    self.setHash(self.$current.next().attr('id'));

                self.$current.removeClass('current')
                    .addClass('hidden')
                    .next('li').addClass('current').next('li').removeClass('hidden');

                self.setCache();
                self.options.nextSlide();
            }

        },
        scrollMobileEvent: function() {
            var self = this,
                docTop = self.$element.scrollTop();

            if(docTop+10 < self.currentP && self.currentIndex > 0){

                // Scroll to top
                self._ignoreHashChange = true;

                if(self.$current.prev().attr('id'))
                    self.setHash(self.$current.prev().attr('id'));

                self.$current.removeClass('current').prev().addClass('current');
                self.setCache();
                self.options.prevSlide();
            } else if(docTop+10 < (self.currentP + self.currentHeight)){

                // If there is a step element in the current panel
                if(self.$stepLength){
                    $.each(self.$step, function(i,el){
                        if(($(el).position().top+self.currentP) <= docTop && (($(el).position().top+self.currentP) + $(el).outerHeight()) >= docTop){
                            if(!$(el).hasClass('current-step')){
                                self.$step.removeClass('current-step');
                                $(el).addClass('current-step');
                            }
                        }
                    });
                }

            } else {

                // Scroll bottom
                self._ignoreHashChange = true;
                if(self.$current.next().attr('id'))
               self.setHash(self.$current.next().attr('id'));

                self.$current.removeClass('current').next().addClass('current');
                self.setCache();
                self.options.nextSlide();
            }


        },
        // Setters
        setDimensions: function(){
            var self = this,
                levelHeight = 0,
                cover = false,
                height = null;
            
            self.$windowHeight = self.$window.height();

            this.$li.each(function(index) {
                var $self = $(this);
                cover = $self.hasClass('cover');

                if(cover){
				
                    $self.css({height: self.$windowHeight, zIndex: 999-index})
                        .attr('data-height',self.$windowHeight)
                        .attr('data-position',levelHeight);

                    self.$elDatas[$self.index()] = {
                        'data-height': 3000, // hhd*  'data-height':parseInt(self.$windowHeight,10)
                        'data-position': parseInt(levelHeight, 10)
                    };

                    levelHeight += 3000;//hhd*   levelHeight += self.$windowHeight;

                } else{
                    height = ($self.outerHeight() <= self.$windowHeight) ? self.$windowHeight : $self.outerHeight();
                    $self.css({minHeight: height, zIndex: 999-index})
                        .attr('data-height',height)
                        .attr('data-position',levelHeight);
                    
                     self.$elDatas[$self.index()] = {
                        'data-height': parseInt(height, 10),
                        'data-position': parseInt(levelHeight, 10)
                    };

                    levelHeight += height;
                }

                if($self.find('.fixed').length){
                    var top = $self.find('.fixed').css('top');
                    $self.find('.fixed').attr('data-top', top);
                }
            });
            if(!this.options.mobile)
                this.setBodyHeight();
        },
        setEvents: function() {
            var self = this;

            $(window).on('resize', function(){
                self.setDimensions();
            });

            if(self.options.mobile) {
                self.$element.on('scroll', function(){
                    self.scrollMobileEvent();
                });
            } else {
                self.$window.on('scroll', function(){
                    self.scrollEvent();
                });
            }
            
            if(self.options.enableKeys) {
                self.$document.on('keydown', function(e){
                    if(e.keyCode === 38 || e.keyCode === 37) {
                        self.scrollToPosition('up');
                        e.preventDefault();
                        return false;
                    }
                    if(e.keyCode === 40 || e.keyCode === 39){
                        self.scrollToPosition('down');
                        e.preventDefault();
                        return false;
                    }
                    // Home button
                    if(e.keyCode === 36){
                        self.scrollToPosition('top');
                        e.preventDefault();
                        return false;
                    }
                    // End button
                    if(e.keyCode === 35){
                        self.scrollToPosition('bottom');
                        e.preventDefault();
                        return false;
                    }
                });
            }

            if(self.options.scrollButtons){
                if(self.options.scrollButtons.up){
                    self.options.scrollButtons.up.on('click', function(e){
                        e.preventDefault();
                        self.scrollToPosition('up');
                    });
                }
                if(self.options.scrollButtons.down){
                    self.options.scrollButtons.down.on('click', function(e){
                        e.preventDefault();
                        self.scrollToPosition('down');
                    });
                }
            }

            if(self.options.curtainLinks){
                $(self.options.curtainLinks).on('click', function(e){
                    e.preventDefault();
                    var href = $(this).attr('href');
                    
                    if(!self.isHashIsOnList(href.substring(1)) && position)
                        return false;
                    var position = self.$elDatas[$(href).index()]['data-position'] || null;

                    if(position){
                        self.scrollEl.animate({
                            scrollTop:position
                        }, self.options.scrollSpeed, self.options.easing);
                    }
                    return false;
                });
            }

            self.$window.on("hashchange", function(event){
                if(self._ignoreHashChange === false){
                    self.isHashIsOnList(location.hash.substring(1));
                }
                self._ignoreHashChange = false;
            });
        },
        setBodyHeight: function(){
            var h = 0;

            for (var key in this.$elDatas) {
               var obj = this.$elDatas[key];
               h += obj['data-height'];
            }
  
            this.options.bodyHeight = h;
            $('body').height(h);
        },
        setLinks: function(){
            var self = this;
            this.$li.each(function() {
                var id = $(this).attr('id') || 0;
                self.options.linksArray.push(id);
            });
        },
        setHash: function(hash){
            // "HARD FIX"
            el = $('[href=#'+hash+']');
            el.parent().siblings('li').removeClass('active');
            el.parent().addClass('active');

            if(history.pushState) {
                history.pushState(null, null, '#'+hash);
            }
            else {
                location.hash = hash;
            }
        },
        setCache: function(){
            var self = this;
            self.$current = self.$element.find('.current');
            self.$fixed = self.$current.find('.fixed');
            self.$fixedLength = self.$fixed.length;
            self.$step = self.$current.find('.step');
            self.$stepLength = self.$step.length;
            self.currentIndex = self.$current.index();
            self.currentP = self.$elDatas[self.currentIndex]['data-position'];
            self.currentHeight = self.$elDatas[self.currentIndex]['data-height'];
		 
            self.parallaxBg = self.$current.attr('data-parallax-background');
            self.$fade = self.$current.find('[data-fade]');
            self.$slowScroll = self.$current.find('[data-slow-scroll]');

        },
        // Utils
        isHashIsOnList: function(hash){
            var self = this;
            $.each(self.options.linksArray, function(i,val){
                if(val === hash){
                    self.scrollToPosition(hash);
                    return false;
                }
            });
        },
        readyElement: function(el,callback){
          var interval = setInterval(function(){
            if(el.length){
              callback(el.length);
              clearInterval(interval);
            }
          },60);
        },
        imageLoaded: function(callback){
            var self = this,
                elems = self.$element.find('img'),
                len   = elems.length,
                blank = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

            elems.bind('load.imgloaded',function(){
                if (--len <= 0 && this.src !== blank || $(this).not(':visible')){
                    elems.unbind('load.imgloaded');
                    callback.call(elems,this);
                }
            }).each(function(){
                if (this.complete || this.complete === undefined){
                    var src = this.src;
                    this.src = blank;
                    this.src = src;
                }
            });
        }
    };



    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };


})( jQuery, window, document );
