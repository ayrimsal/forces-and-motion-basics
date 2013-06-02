define( function( require ) {
  "use strict";
  var Vector2 = require( "DOT/Vector2" );
  var Property = require( 'PHETCOMMON/model/property/Property' );
  var PropertySet = require( 'PHETCOMMON/model/property/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );

  function Item( context, image, mass, x, y, imageScale, pusherInset /*optional*/, sittingImage, holdingImage ) {
    this.initialX = x;
    this.initialY = y;
    this.image = image;
    this.mass = mass;
    this.pusherInset = pusherInset;
    this.sittingImage = sittingImage;
    this.holdingImage = holdingImage;

    PropertySet.call( this, {x: x, y: y, pusherInset: pusherInset, dragging: false, animating: {enabled: false, x: 0, y: 0, end: null, destination: 'home'},
      //Flag for whether the item is on the skateboard
      onBoard: false,

      //How much to increase/shrink the original image.  Could all be set to 1.0 if images pre-scaled in an external program
      imageScale: imageScale || 1.0,

      //How much the object grows or shrinks when interacting with it
      interactionScale: 1.0
    } );

    this.context = context;
  }

  inherit( Item, PropertySet, {
    get position() {return {x: this.x, y: this.y};},
    set position( position ) {this.set( {x: position.x, y: position.y} )},
    armsUp: function() {
      return this.context.draggingItems().length > 0 || this.context.isItemStackedAbove( this );
    },
    animateTo: function( x, y, destination ) {
      this.animating.value = {enabled: true, x: x, y: y, destination: destination};
    },
    animateHome: function() {
      this.animateTo( this.initialX, this.initialY, 'home' );
    },
    step: function() {
      if ( this.dragging.value ) {
        this.interactionScale.value = Math.min( this.interactionScale.value + 0.06, 1.3 );
      }
      else {
        if ( this.animating.value.destination === 'home' ) {
          this.interactionScale.value = Math.max( this.interactionScale.value - 0.06, 1.0 );
        }
      }
      if ( this.animating.value.enabled ) {
        var current = new Vector2( this.x.value, this.y.value );
        var destination = new Vector2( this.animating.value.x, this.animating.value.y );
        var position = current.blend( destination, 0.1 );

        //TODO: batch these for performance
        this.x.value = position.x;
        this.y.value = position.y;
        if ( position.distance( destination ) < 1 && this.interactionScale.value === 1.3 ) {
          if ( this.animating.value.end ) {
            this.animating.value.end();
          }
          this.animating.value = {enabled: false, x: 0, y: 0, end: null};
        }
      }
    }
  } );

  return Item;
} );