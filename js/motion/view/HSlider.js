define( function( require ) {
  "use strict";

  var Image = require( 'SCENERY/nodes/Image' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var linear = require( 'DOT/Util' ).linear;
  var imageLoader = require( 'imageLoader' );
  var Property = require( 'AXON/Property' );

  function HSlider( min, max, width, property, speedValueProperty, options ) {
    this.enabledProperty = new Property( true );
    var slider = this;
    this.options = _.extend( {zeroOnRelease: false}, options || {} );

    speedValueProperty.link( function( speedValue ) {
      if ( speedValue !== 'WITHIN_ALLOWED_RANGE' ) {
        dragHandler.endDrag();//drop the mouse
      }
    } );
    this.min = min;
    this.max = max;
    this.sliderWidth = width;
    this.trackHeight = 6;

    this.options.renderer = 'svg';
    Node.call( this, this.options );

    this.ticksLayer = new Node();
    this.addChild( this.ticksLayer );

    //The track
    var track = new Rectangle( 0, 0, width, this.trackHeight, {stroke: 'black', lineWidth: 1, fill: 'white'} );
    this.addChild( track );
    this.enabledProperty.link( function( enabled ) {
      track.stroke = enabled ? 'black' : 'gray';
      track.fill = enabled ? 'white' : 'gray'
    } );

    //Lookup the new item and append to the scenery
    var knob = new Image( imageLoader.getImage( 'handle_blue_top_grip_flat_gradient_3.svg' ), {cursor: 'pointer'} );
    knob.y = -knob.height / 2;
    var dragHandler = new SimpleDragHandler( {
        allowTouchSnag: true,
        translate: function( options ) {
          var x = Math.min( Math.max( options.position.x, -knob.width / 2 ), width - knob.width / 2 ) + knob.width / 2;
          property.value = linear( 0, width, min, max, x );
        },
        end: function() {
          if ( slider.options.zeroOnRelease ) {
            property.value = 0;
          }
        }}
    );
    knob.addInputListener( dragHandler );
    this.addChild( knob );

    this.enabledProperty.link( function( enabled ) {
      knob.image = enabled ? imageLoader.getImage( 'handle_blue_top_grip_flat_gradient_3.svg' ) : imageLoader.getImage( 'handle-gray.svg' );
      knob.cursor = enabled ? 'pointer' : 'default';
      if ( enabled ) {
        knob.addInputListener( dragHandler );
      }
      else {
        knob.removeInputListener( dragHandler );
      }
    } );

    property.link( function( value ) { knob.x = linear( min, max, 0, width, value ) - knob.width / 2; } );
  }

  inherit( Node, HSlider, {
    addNormalTicks: function() {
      var slider = this;
      //TODO: turn these into parameters
      var numDivisions = 8; //e.g. divide the ruler into 1/8ths
      var numTicks = numDivisions + 1; //ticks on the end
      var isMajor = function( tickIndex ) { return tickIndex % 2 === 0; };
      var hasLabel = function( tickIndex ) { return tickIndex % 4 === 0; };

      for ( var i = 0; i < numTicks; i++ ) {
        (function( i ) {

          var x1 = linear( slider.min, slider.max, 0, slider.sliderWidth, i / (numTicks - 1) * (slider.max - slider.min) + slider.min );
          var tick = new Path( {shape: Shape.lineSegment( new Vector2( x1, 0 ), new Vector2( x1, isMajor( i ) ? 30 : 15 ) ), stroke: 'black', lineWidth: 1} );
          slider.enabledProperty.link( function( enabled ) {tick.stroke = enabled ? 'black' : 'gray';} );
          slider.ticksLayer.addChild( tick );
          if ( hasLabel( i ) ) {
            var label = new Text( linear( 0, 1, slider.min, slider.max, i / (numTicks - 1) ).toFixed( 0 ), {centerX: tick.centerX, top: tick.bottom + 5, fontSize: '18px'} );
            slider.enabledProperty.link( function( enabled ) {label.fill = enabled ? 'black' : 'gray';} );
            slider.ticksLayer.addChild( label );
          }
        })( i );
      }
      return this;
    },

    //Add the tick for the specified value, so that the node will be centered on the location specified and just at the edge of the track.
    addTick: function( value, tickAndLabelNode ) {
      tickAndLabelNode.centerX = linear( 0, 1, 0, this.sliderWidth, value );
      tickAndLabelNode.top = this.trackHeight + 1;
      this.ticksLayer.addChild( tickAndLabelNode );
      return this;
    },

    set enabled( enabled ) {
      this.enabledProperty.set( enabled );
    }
  } );

  return HSlider;
} );