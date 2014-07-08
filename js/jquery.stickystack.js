/*
*  jQuery Boilerplate - v3.3.1
*  A jump-start for jQuery plugins development.
*  http://jqueryboilerplate.com
*
*  Made by Zeno Rocha
*  Under MIT License
*/
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "stickyStack",
				defaults = {
					lastChildScrollDelay: 5e3,
					baseZIndex: 100,
					gap: 10,
					stackSelector: ".js-sticky-stack",
					stackItemSelector: ".js-sticky-stack-item",
					styleId: "stick-stack-styles",
					footerSelector: ".snippet-footer",
					debug: true,
					css: ".affix{position:fixed;}.affix-top{position:static;}.affix-bottom{position:absolute;}.sticky-stack-disabled .affix,.sticky-stack-disabled .affix-bottom,.sticky-stack-disabled .affix-top{position:static;}",
					classNames: {
						persistant: "js-sticky-stack-item-fixed",
						container: "js-sticky-stack-item-container",
						disabled: "sticky-stack-disabled",
						item: "js-sticky-stack-item"
					}
				};

		// The actual plugin constructor
		function Plugin ( element, options ) {
				this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this.options = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		Plugin.prototype = {
				init: function () {
						// Place initialization logic here
						// You already have access to the DOM element and
						// the options via the instance, e.g. this.element
						// and this.options
						// you can add more functions like the one below and
						// call them like so: this.yourOtherFunction(this.element, this.options).
						console.log("xD", this.isSupported() );
						if (this.isSupported()){
							this.options.styleId = this.options.styleId+"-"+ +new Date();
							this.initSticky();
						} else if (this.options.debug){
							console.log(pluginName, '')
						}
				},
				getSetParent: function($el,i){
					// get the sticky parent and create in not already in dom
					var stickyStack = this,
						$parent = $el.parent( "."+ stickyStack.options.classNames.container ),
						id;
					if ($parent.length < 1){
						console.log('no parent found')
						$parent = $el.wrap("<div class='"+ stickyStack.options.classNames.container  +"'></div>").parent();
					}
					id = ( $parent.attr("id") || "sticky-stack-parent-"+i )
					$parent
						.attr("id", id )
						.addClass(id);
					$el.data("sticky-stack-parent", $parent );
					console.log('parent attached', $parent)
					return $parent;
				},
				convertToStickyButton: function(el){
					var stickyStack = this,
						$el = $(el);
					if ($el.prop("tagName").toLowerCase() === "a"){
						$el.find("br").remove();
						$el = $el
								.removeClass(stickyStack.options.classNames.item +" "+ stickyStack.options.classNames.persistant )
								.wrap("<div class='sticky-stack-button-wapper "+ stickyStack.options.classNames.item +" "+ stickyStack.options.classNames.persistant  +"' />")
								.parent( "."+ stickyStack.options.classNames.item );
					}
					return $el;
				},
				setStyles: function(css){
					var stickyStack = this;
					if ( $("#"+stickyStack.options.styleId) ){
						$("#"+stickyStack.options.styleId).remove();
					}
					if (css){
						$('<style>'+css+'</style>').appendTo("head").attr('id',stickyStack.options.styleId);
					}
				},
				getElementPaddingTop: function($el){
					var p = parseInt( $el.css("padding-top") , 10) || 0,
					    b = parseInt( $el.css("border-top-width") , 10) || 0,
						m = parseInt( $el.css("padding-top") , 10) || 0;
					return p + b + m;
				},
				getNextOffsetBottom: function(ii, $el, $$elements, docHeight, persistant){
					var stickyStack = this,
						nextEl;
					if (ii < $$elements.length && !persistant){
						$next = $( $$elements.get(ii) );
						return docHeight - ( $next.offset().top - stickyStack.getElementPaddingTop( $next ) );
					} else {
						return docHeight - $(stickyStack.options.footerSelector).offset().top ;
					}
				},
				setHTML: function( $$elements ){
					var stickyStack = this;

					$$elements.each(function(i, el){
						var $el = stickyStack.convertToStickyButton(el),
							$parent = stickyStack.getSetParent($el,i),
							persistant = $el.hasClass( stickyStack.options.classNames.persistant ),
							id = $el.attr("id") || "sticky-stack-"+i;
						console.log('adding html', $el)
						$el.attr("id", id)
							.data("sticky-stack-parent",  $parent )
							.data("sticky-stack-persistant",  persistant )
					});
				},
				initSticky: function () {

					var stickyStack = this,
						$stack = $(this.element),
						$$elements = $stack.find( stickyStack.options.stackItemSelector ),
						css = stickyStack.options.css,
						offset = 0,
						gap = 0,
						docHeight = $(document).height(),
						stackClass = "sticky-stack-index-"+ $stack.index();

					// save refs to the elements and last element for the scroll timer
					$stack
						.addClass(stackClass)
						.data('sticky-stack-elements', $$elements)
						.data('sticky-stack-final-element', $( $$elements.last() ) )

					stickyStack.setHTML( $$elements );

					$$elements.each(function(i, el){
						// set boostrap affix and width on elements and height on parent elements to preserve their space
						var $el = $(el).closest( stickyStack.options.stackItemSelector ),
							ii = (i+1),
							id = $el.attr("id"),
							$parent = $el.data("sticky-stack-parent"),
							persistant = $el.data("sticky-stack-persistant"),
							stackTop = offset,
							offsetTop = $el.offset().top - stackTop,
							offsetBottom = stickyStack.getNextOffsetBottom(ii, $el, $$elements, docHeight, persistant );

						$el
							.addClass(id)
							.data("sticky-stack-top", stackTop )
							.data("sticky-stack-offset-height", $el.outerHeight(true) + gap )
							.affix({
								offset: {
									top: offsetTop,
									bottom: offsetBottom
								}
							});

						css = css + "."+stackClass+" ."+ id +"{top:"+ stackTop +"px;width:"+
							$parent.width( ) +"px;z-index:"+
							(stickyStack.options.baseZIndex + ii + ( persistant ? $$elements.length+1 : 0) ) +"}"+
							"\n\n."+stackClass+" ."+ $parent.attr('id')+"{min-height:"+$el.outerHeight(true)+"px;}";

						if ( persistant ){
							// add height of persistant element to offset in this stack
							offset = offset+$el.outerHeight(true);
						}
						$el.on(
							'affix.bs.affix affix-top.bs.affix affix-bottom.bs.affix'
							, function(e){
								if(stickyStack.options.disabled){
									e.preventDefault();
								}
							}
						);
					});
					if (stickyStack.options.debug){
						console.log( css )
					}
					stickyStack.setStyles(css);
				},
				isSupported: function(){
					// put tests here....
					// scrolltop needed for chrome
					return $(window).scrollTop() === 0 && !!$.fn.affix && !this.options.disabled ;
				}
		};

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
