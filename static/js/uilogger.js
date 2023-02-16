/*
Copyright 2020- IBM Inc. All rights reserved

SPDX-License-Identifier: Apache2.0
*/

/**
 * This jQuery plugin captures standard, jquery, and custom user interface (UI) events.
 * The purpose on logging UI events is to evaluate in details how users use the UI.
 * The event logger is inspired by the sotware components defined in:
 * Santana, V.F.; Baranauskas, M.C.C. (2009) Keeping Track of How Users Use Client Devices: An Asynchronous Client-Side Event Logger Model. In ICEIS 2009.
 *
 * This version was developed aiming at jQuery 3.5. 
 * Please make sure to test plugin's compatibility to jQuery version you are using.
 * 
 * Default usage:
 * $(window).uilogger( { userId : '[userId]', server : '[server URL]' } ) ;
 * 
 * Custom events usage (e.g., using a play event): 
 * $(window).uilogger( { userId : '[userId]', server : '[server URL]', include : 'play.uilogger' } ) ;
 * 
 * Then the play event can be triggered by running the following code: 
 * $( this ).trigger( 'play.uilogger' ) ; 
 *
 * Capturing interaction only with UI elements with ID attribute:
 * $(window).uilogger( { userId : '[userId]', server : '[server URL]', onlyID: true } ) ;
 * 
 * @author Vagner Figueredo de Santana -- IBM Research
 * @version 1.0.1
 */

(function( $ ) {
	var sessionStart = 0 ; // Used to reduce the timestamp value considering the difference between each event timestamp and the session start
	var settings ; // Stores plugin settings
	var currentPack = new Array() ;
	var previousLine = new Array() ;
	var mousemoves = new Array() ; // Used to trigger mousefixations
	var counter = 0 ;
	var previousEvents = new Array() ; // Used to trigger sequenced custom events (e.g., triple click)
	var composite = {
		/**
		* Init method.
		* 
		* @param {Object} options Map representing the init customizable values.
		*/
		init : function( options ){
			settings = $.extend( {
				userId : '', 
				server : '/uilogger',
				events : 'abort.uilogger beforeunload.uilogger blur.uilogger change.uilogger click.uilogger copy.uilogger dblclick.uilogger drag.uilogger dragend.uilogger dragenter.uilogger dragleave.uilogger dragover.uilogger dragstart.uilogger drop.uilogger error.uilogger focus.uilogger focusin.uilogger focusout.uilogger input.uilogger keydown.uilogger keypress.uilogger keyup.uilogger load.uilogger mousedown.uilogger mousemove.uilogger mouseover.uilogger mouseout.uilogger mouseup.uilogger resize.uilogger scroll.uilogger search.uilogger select.uilogger show.uilogger submit.uilogger toggle.uilogger touchend.uilogger touchmove.uilogger touchstart.uilogger unload.uilogger wheel.uilogger pageview.uilogger tripleclick.uilogger mousefixation.uilogger pausebeforeclick.uilogger',
				include : '',
				status : 'started',
				packSize : 1024, // This size must be set carefully. Please test response times and mean number of requests for common tasks before setting it.
				ajaxType : 'POST',
				sendInPacks : true,
				onlyID : false
			}, options ) ;
			
			if( console ){
				console.debug( 'Initializing with settings: ' + JSON.stringify( settings ) ) ;
			}

			if( composite.dao.readCookie( 'sessionStart' ) == "" ){
				sessionStart = (new Date()).getTime() ;
				composite.dao.createCookie( 'sessionStart', sessionStart, 365 ) ;
				// TODO: trigger a session start event with SID as additional info
				// This will be used in the data analysis, aloowing fast selection of SID of participants given the period of the experiment
			}

			if( composite.dao.readCookie( 'sessionId' ) == "" ){
				composite.dao.createCookie( 'sessionId' , 'SID' + Math.random(), 365 ) ; // TODO: Change this to a meaningful identifier for KB
			}

			composite.logger.start() ;
			
			// Custom event pageview
			$(window).trigger( 'pageview.uilogger' ) ;
		},
		
		/**
		 * Data Logger control methods for starting and stopping the logging procedure.
		 */
		logger : {
			/**
			 * Initializes the logging.
			 */
			start : function(){
				// Events are namespaced, e.g., $(window).bind( 'pageview.uilogger' )
				$(window).bind( settings.events, composite.logger.record ) ;
				$(window).bind( settings.include, composite.logger.record ) ;
			},		
			/**
			 * Stops the logging by unbiding namespaced events, e.g., $(window).unbind( '.uilogger' ) ;
			 */
			stop : function(){
				$(window).unbind( '.uilogger' ) ;					
				settings.status = 'stopped' ;
			},		
			/**
			 * Main record method. It is responsible for building log lines and defining the values of specific events.
			 *
			 * @param {Event} The event object.
			 */
			record : function( event ){
				// Capturing only events at UI elements with ID
				if( settings.onlyID && event.type !== 'pageview' ){ // Need to track pageviews
					if( !event.target ){
						return ; 
					}
					else if( !event.target.id ){
						return ;
					}
				}

				// Setting complementary info of specific events at event.data
				event.data = {} ;
				switch( event.type ){
					case 'pageview': 
						event.data = {
							URL : window.location.href, // Where
							referrer : document.referrer, // From
							sessionId : composite.dao.readCookie( 'sessionId' ), // Who
							sessionStart : composite.dao.readCookie( 'sessionStart' ), // When
							width :  $( window ).width(), // Needed to create mouse fixation reports
							height: $( window ).height()
						} ; 
						break ;
					case 'dblclick':
						// Used to trigger the triple click, i.e., dblclick+mousedown+mouseup+click
						if( previousEvents.length == 0 ){
							previousEvents.push( event ) ;
						}
						break ;
					case 'mousedown':
						// Used to trigger the triple click, i.e., dblclick+mousedown+mouseup+click
						if( previousEvents.length == 1 && previousEvents[0].type == 'dblclick' ){
							previousEvents.push( event ) ;
						}
						// Mouse fixations demo
						if( location.href.indexOf( 'demo=mousefixation' ) > -1 ){
							console.debug( event.pageX + ','+ event.pageY ) ;
							$( '#main' ).append( "<div class='click' style='left:" + ( event.pageX - 15 ) + "px;top:" + ( event.pageY - 15 ) + "px;'></div>" ) ;
						}						 						
						break ;
					case 'mouseup':
						// Used to trigger the triple click, i.e., dblclick+mousedown+mouseup+click
						if( previousEvents.length == 2 && previousEvents[1].type == 'mousedown' ){
							previousEvents.push( event ) ;
						}
						break ;
					case 'click':
						// Used to trigger the pausebeforeclick, i.e., dblclick+mousedown+mouseup+click
						previousEvents.push( event ) ;
						$(event.target).trigger( 'pausebeforeclick.uilogger' ) ;

						// Used to trigger the triple click, i.e., dblclick+mousedown+mouseup+click
						if( previousEvents.length == 3 && previousEvents[2].type == 'mouseup' ){
							$(event.target).trigger( 'tripleclick.uilogger' ) ;
						 };

						 break ;
					case 'pausebeforeclick':
						// console.debug( 'pausebeforeclick' ) ;
						break ;						 
					case 'tripleclick':
						var lastClick = previousEvents.pop() ;
						event.data.X = lastClick.pageX ;
						event.data.Y = lastClick.pageY ;
						event.data.wich = lastClick.wich ;
						previousEvents = [] ;
						break ;
					case 'beforeunload': 
						// Sending the pending packs.
						for( var key in $( window ).data() ){
							if( console ){
								console.debug( "Last attempt on sending " + key + " to the server." ) ;
							}
							composite.communicator.send( key, $( window ).data( key ) ) ; 
						}
						break ;						
					case 'mousemove':
						mousemoves.push( event ) ;
						// Triggering mouse fixations based on dispersion protocol
						if( mousemoves.length > 1 ){ 
							var timeWindow = 100 ; // time window (in ms) for detecting mouse fixations, based on dispersion of mouse 'saccades' (i.e., mouse movements)
							var gazeDistance = 100 ; // 'gaze' distance in pixels used for triggering mouse fixations, based on dispersion of mouse 'saccades' (i.e., mouse movements)							
						 	while( 
								 ( 
									event.timeStamp - mousemoves[0].timeStamp > timeWindow // Removing old mouse movements, i.e., greater than the defined time window
									 || Math.sqrt( Math.pow( event.data.X - mousemoves[0].data.X, 2 ) + Math.pow( event.data.Y - mousemoves[0].data.Y, 2 ) ) > gazeDistance // Removing elements outside the distance threshold
								 )
								 && mousemoves.length > 1 ){
								mousemoves.shift() ;
							}
						}
						
						if( mousemoves.length > 4 ){
							$(event.target).trigger( 'mousefixation.uilogger' ) ;
						}
						break ;
					case 'mousefixation':
						var centroidX = 0 ;
						var centroidY = 0 ;
						for( var i = 0; i < mousemoves.length; i++ ){
							centroidX += mousemoves[i].pageX ;
							centroidY += mousemoves[i].pageY ;
						}
						centroidX = Math.round( centroidX / mousemoves.length ) ;
						centroidY = Math.round( centroidY / mousemoves.length ) ;
						event.pageX = centroidX ;
						event.pageY = centroidY ;
						mousemoves = [] ; // Once that the data was  consumed for this fixation, reseting the mousemoves history.
						// mousefixation demo
						if( location.href.indexOf( '?demo=mousefixation' ) > -1 ){
							$( '#main' ).append( "<div class='mousefixation' style='left:" + ( centroidX - 50 ) + "px;top:" + ( centroidY - 50 ) + "px;'></div>" ) ;
						}
						break ;
					case 'resize': // Needed to create mouse fixation reports
						event.data.width = $( window ).width() ;
						event.data.height = $( window ).height() ;
						break ;
					// Default case to extract additional information (custom triggered events)
					default: 
						for( let key in event.info ){
							event.data[ key ] = event.info[ key ] ;
						}

					// TODO: add specific data for map manipulation
					// TODO: add specific data for human-AI interaction
					// TODO: add specific data for risk/resilience plan interaction
				}
			
				var line = [5] ;
				// Events entries contain the following info: who, where, when, what (event [, additional info])
								
				// Who: User ID 
				if( settings.userId !== '' ){
					line[0] = settings.userId.replace( ",", "\," ) ;
				}
				else{
					line[0] = composite.dao.readCookie( 'sessionId' ) ;
				}

				// Where: UI element tag#ID, path, or object (e.g., when target is the window itself)
				if( event.target ){
					if( event.target.id ){
						line[1] = event.target.nodeName.toLowerCase() + '#' + event.target.id.replace( ",", "\," ) ; 
					}
					else if( composite.logger.getXPath( event.target ) != '' ) {
						line[1] = composite.logger.getXPath( event.target ) ;
					}
					else{
						line[1] = event.target ; 
					}
				}
				
				// When: timestamp in ms
				line[2] = (new Date()).getTime() - parseInt( composite.dao.readCookie( 'sessionStart' ) ) ;
				// Converting to radix 36
				line[2] = line[2].toString( 36 ) ;
				
				// What: event and then the complementary info
				line[3] = event.type ;
				
				// Mouse events complementary info
				if( event.pageX ){ event.data.X = event.pageX; }
				if( event.pageY ){ event.data.Y = event.pageY; }
				
				// Cleaning keyboard keys used
				if( event.type !== 'keydown' && event.type !== 'keypress' && event.type !== 'keyup' ){
					if( event.which ){ event.data.which = event.which; }
				}

				// Keyboard events complementary info
				if( event.altKey ){ event.data.altKey = event.altKey; }
				if( event.ctrlKey ){ event.data.ctrlKey = event.ctrlKey; }
				if( event.shiftKey ){ event.data.shiftKey = event.shiftKey; }
						
				// Pause before click
				if( event.type == 'pausebeforeclick' ){
					if( previousEvents[ previousEvents.length - 1 ].type == 'click' && mousemoves.length > 0 ){
						event.data.pause = previousEvents[ previousEvents.length - 1 ].timeStamp - mousemoves[  mousemoves.length - 1 ].timeStamp ;
					}
				}

				// titlechanged textchanged dataqualitychanged
				if( event.type == 'titlechanged' || event.type == 'textchanged' || event.type == 'dataqualitychanged' ){
					event.data.text = event.target.value ;
				}
				
				// Here's where the additional info is pushed into the log line
				line[4] = JSON.stringify( event.data ) ;
				
				if( console ){									
					console.debug( "Logging: " + decodeURI( line ) ) ;
				}

				var lineCopy = [] ;
				for( i = 0; i < line.length; i++ ){
					lineCopy[i] = line[i] ;
				}

				if( settings.sendInPacks ){ // Sending events in packs
					// Pushing the line into the current pack
					if( previousLine.length == 0 ){
						currentPack.push( line.toString() ) ;
						previousLine = lineCopy ;
					}
					else{
						currentPack.push( composite.logger.RLE( previousLine, line ).toString() ) ;
						previousLine = lineCopy ;
					}
					
					if( currentPack.toString().length > settings.packSize ){						
						// stringify( currentPack ) ) ;
						composite.dao.create( 'pack' + counter, JSON.stringify( currentPack ) ) ;
						composite.communicator.send( 'pack' + counter, JSON.stringify( currentPack ) ) ;
						counter++ ;
						currentPack = [] ;
						previousLine = [] ; // Making packages independent from each other
					}
				}
				else{ // Sending events as they occur
					// In this case, no control is performed for resending logs. They are sent as triggered.
					composite.communicator.send( 'pack' + counter, line.toString() ) ; 
					counter++ ;
				}
			},

			/**
			 * Compresses a line of log using Run Length Encoding.
			 * @param {Array} previous Previous line logged.
			 * @param {Array} current Current line logged.
			 * @return {Array} Current line compressed.
			 */
			RLE : function( previous, current ){
				for( i = 0; i < previous.length ; i++ ){
					if( previous[i] == current[i] ){
						current[i] = "" ;
					}
				}
				return current ;
			},

			/**
			 * Retrieves the XPath path of an object allowing the identification of elements that do not have ID attribute. 
			 * More details on the XPath syntax: https://www.w3schools.com/xml/xpath_syntax.asp
			 *
			 * @param {Objecy} target Target object of an event.
			 * @return {String} The XPath to the UI element.
			 */
			getXPath : function( target ){
				var path = "" ;
				while( target.parentNode ){
					path = target.nodeName + "[" + ( $( target ).index() ) + "]" + ( path ? "/" + path : "" ) ;
					target = target.parentNode ;
				}
				return path.toLowerCase() ;
			}
		},

		/**
		 * Data access methods for creating, reading, and removing arbitrary data and cookie data.
		 */
		dao : {
			/**
			 * Stores arbitrary data into the window object.
			 * For more details, please check jQuery documentation:
			 * https://api.jquery.com/jquery.data/
			 * 
			 * @param {String} name The key that addresses the value.
			 * @param {String} value The data to be stored.
			 */
			create : function( name, value ){
				$( window ).data( name, value ) ;
			},
			/**
			 * Retrieves recorded data.
			 * 
			 * @param {String} name The key that addresses the stored value.
			 */
			read : function( name ){
				$( window ).data( name ) ;
			},
			/**
			 * Removes the stored data.
			 * 
			 * @param {String} name The key that addresses the stored value.
			 */
			remove : function( name ){
				$( window ).removeData( name ) ;
				if( console ){
					console.debug( "Confirmation received. Removing pack " + name ) ;
				}
			},
			/**
			 * Creates a cookie.
			 * 
			 * @param {String} name The name of the cookie.
			 * @param {String} value The value to be recorded.
			 * @param {int} days Days to the cookie expire, in the case of application cookie.
			 */
			createCookie : function( name, value, days ){
				var cookie = escape( $.trim( name ) ) + "=" + escape( $.trim( value ) ) ; // Session cookie is the default
				if( days ){
					var d = new Date() ;
					d.setDate( d.getDate() + days ) ;
					cookie += ";expires=" + d.toUTCString() ; // Application cookie
				}
				document.cookie = cookie ;
			}, 
			/**
			 * Read a recorded cookie.
			 * 
			 * @param {String} name The key that addresses the cookie.
			 * @return {String} If the cookie was found, the value of the cookie; an empty string in other cases.
			 */
			readCookie : function( name ){
				var cookies = document.cookie.split( new RegExp( ";", "g" ) ) ;
				for( var i = 0; i < cookies.length; i++ ){
					if( $.trim( cookies[i].split("=")[0] ) == escape( $.trim( name ) ) ){
						return unescape( $.trim( cookies[i].split("=")[1] ) ) ;
					}
				}
				return "" ;
			}			
		},

		/**
		 * Communicates with the server and keeps track of what was successfully recorded and what needs to be resent.
		 */
		communicator : {
			/**
			 * Sends the logged data to the server.
			 *
			 * @param {String} key A key to track the pack of logged data.
			 * @param {Strgin} value The logged data.
			 * @return {boolean} True if the server recorded the data successfully; false in other cases.
			 */
			send : function( key, value ){
				$.ajax({
					data: { name : key, value : encodeURI( value ) },
					url : settings.server,
					type : settings.ajaxType,
					success : function( data, textStatus, xhr ){
						// Cleaning the packs that where recorded at the server
						if( data.indexOf( 'pack' ) > -1 ){
							composite.dao.remove( xhr.responseText ) ;
						}
					},
					error : function( data, textStatus, xhr ){
						if( console ){
							console.debug( data + " " + textStatus + " " + xhr ) ;
						}					
					}					
				}) ;
				
				if( console ){
					console.debug( 'Placeholder for sending ' + key + '=' + value + ' to ' + settings.server ) ;
				}
			}
		}
	} ;

	// Attaching the plugin to the jQuery's fn namespace.
	$.fn.uilogger = function( method ) {
		// If the called method does not exist, the init is called
		if ( composite[ method ] ){
			if ( typeof composite[ method ] === 'object' ){
				return 	composite[ method ] ;
			}
			else{
				return composite[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) ) ;
			}
		}
		else if ( typeof method === 'object' || ! method ) {
			return composite.init.apply( this, arguments ) ;
		}
		else{
			$.error( 'Method ' +  method + ' does not exist on jQuery.uilogger' );
		}
	} ;

})( jQuery ) ;
