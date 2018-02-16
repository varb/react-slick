'use strict';
import ReactDOM from 'react-dom';
import assign from 'object-assign';

// checks if spec is the superset of keys in keysArray, i.e., spec contains all the keys from keysArray
var checkSpecKeys = function (spec, keysArray) {
  return keysArray.reduce((value, key) => {
    return value && spec.hasOwnProperty(key);
  }, true) ? null : console.error('Keys Missing', spec);
};

export var getTrackCSS = function(spec) {
  checkSpecKeys(spec, [
    'left', 'variableWidth', 'slideCount', 'slidesToShow', 'slideWidth'
  ]);

  var trackWidth, trackHeight;
  trackWidth = spec.slideCount * spec.slideWidth;

  var style = {
    opacity: 1,
    WebkitTransform: !spec.vertical ? 'translate3d(' + spec.left + 'px, 0px, 0px)' : 'translate3d(0px, ' + spec.left + 'px, 0px)',
    transform: !spec.vertical ? 'translate3d(' + spec.left + 'px, 0px, 0px)' : 'translate3d(0px, ' + spec.left + 'px, 0px)',
    transition: '',
    WebkitTransition: '',
    msTransform: !spec.vertical ? 'translateX(' + spec.left + 'px)' : 'translateY(' + spec.left + 'px)',
  };
  if (spec.fade) {
    style = {
      opacity: 1
    }
  }

  if (trackWidth) {
    assign(style, { width: trackWidth });
  }

  if (trackHeight) {
    assign(style, { height: trackHeight });
  }

  // Fallback for IE8
  if (window && !window.addEventListener && window.attachEvent) {
    if (!spec.vertical) {
      style.marginLeft = spec.left + 'px';
    } else {
      style.marginTop = spec.left + 'px';
    }
  }

  return style;
};

export var getTrackAnimateCSS = function (spec) {
  checkSpecKeys(spec, [
    'left', 'variableWidth', 'slideCount', 'slidesToShow', 'slideWidth', 'speed', 'cssEase'
  ]);

  var style = getTrackCSS(spec);
  // useCSS is true by default so it can be undefined
  style.WebkitTransition = '-webkit-transform ' + spec.speed + 'ms ' + spec.cssEase;
  style.transition = 'transform ' + spec.speed + 'ms ' + spec.cssEase;
  return style;
};

// gets total length of track that's on the left side of current slide
export var getTrackLeft = function (spec) {

  checkSpecKeys(spec, ['slideIndex', 'slideCount', 'slideWidth'])

  const {slideIndex, slideCount, slideWidth} = spec

  if (slideCount === 1)
    return 0

  let targetLeft = (slideIndex * slideWidth) * -1

  return targetLeft
}

export function getPreClones(spec){
  return spec.slidesToShow + (spec.centerMode ? 1: 0)
}

export function getPostClones(spec){
  return spec.slideCount
}

export function getTotalSlides(spec){
  if (spec.slideCount === 1) {
    return 1
  }
  return getPreClones(spec) + spec.slideCount + getPostClones(spec)
}
