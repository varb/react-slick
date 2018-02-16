'use strict';

import React from 'react';
import assign from 'object-assign';
import classnames from 'classnames';


// given specifications/props for a slide, fetch all the classes that need to be applied to the slide
var getSlideClasses = (spec) => {
  // if spec has currentSlideIndex, we can also apply slickCurrent class according to that (https://github.com/kenwheeler/slick/blob/master/slick/slick.js#L2300-L2302)
  var slickActive, slickCenter, slickCloned;
  var centerOffset, index;

  if (spec.rtl) { // if we're going right to left, index is reversed
    index = spec.slideCount - 1 - spec.index;
  } else { // index of the slide
    index = spec.index;
  }
  slickCloned = (index < 0) || (index >= spec.slideCount);
  if (spec.centerMode) {
    centerOffset = Math.floor(spec.slidesToShow / 2);
    slickCenter = (index - spec.currentSlide) % spec.slideCount === 0; // concern: not sure if this should be correct (https://github.com/kenwheeler/slick/blob/master/slick/slick.js#L2328-L2346)
    if ((index > spec.currentSlide - centerOffset - 1) && (index <= spec.currentSlide + centerOffset)) {
      slickActive = true;
    }
  } else {
    // concern: following can be incorrect in case where currentSlide is lastSlide in frame and rest of the slides to show have index smaller than currentSlideIndex
    slickActive = (spec.currentSlide <= index) && (index < spec.currentSlide + spec.slidesToShow);
  }
  let slickCurrent = index === spec.currentSlide
  return classnames({
    'slick-slide': true,
    'slick-active': slickActive,
    'slick-center': slickCenter,
    'slick-cloned': slickCloned,
    'slick-current': slickCurrent // dubious in case of RTL
  });
};

var getSlideStyle = function (spec) {
  var style = {};

  if (spec.variableWidth === undefined || spec.variableWidth === false) {
    style.width = spec.slideWidth;
  }

  // console.log(style, spec.slideWidth);

  if (spec.fade) {
    style.position = 'relative';
    if (spec.vertical) {
      style.top = -spec.index * spec.slideHeight;
    } else {
      style.left = -spec.index * spec.slideWidth;
    }
    style.opacity = (spec.currentSlide === spec.index) ? 1 : 0;
    style.visibility = (spec.currentSlide === spec.index) ? 'visible' : 'hidden';
    style.transition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase + ', ' + 'visibility ' + spec.speed + 'ms ' + spec.cssEase;
    style.WebkitTransition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase + ', ' + 'visibility ' + spec.speed + 'ms ' + spec.cssEase;
  }

  return style;
};

const getKey = (child, fallbackKey) => child.key || fallbackKey

export class Track extends React.Component {
  renderSlides() {
    const spec = this.props
    var key;
    var slides = [];
    var preCloneSlides = [];
    var postCloneSlides = [];
    var childrenCount = React.Children.count(spec.children);

    const countLists = Math.ceil(childrenCount / spec.slidesInGrid)

    let lists = []

    for (let i = 0; i < countLists; i++) {
      lists[i] = []

      let carts = []

      for (let j = 0; j < spec.slidesInGrid; j++) {
        const curNum = i * spec.slidesInGrid + j;

        carts.push(spec.children[curNum])

        if (curNum == spec.children.length - 1)
          break
      }

      lists[i] = <div className="press__list" key={i}>{carts}</div>
    }

    React.Children.forEach(lists, (elem, index) => {
      let child;
      var childOnClickOptions = {
        message: 'children',
        index: index,
        slidesToScroll: spec.slidesToScroll,
        currentSlide: spec.currentSlide
      };

      // in case of lazyLoad, whether or not we want to fetch the slide
      if (!spec.lazyLoad || (spec.lazyLoad && spec.lazyLoadedList.indexOf(index) >= 0)) {
        child = elem;
      } else {
        child = (<div></div>);
      }
      var childStyle = getSlideStyle(assign({}, spec, {index: index}));
      const slideClass = child.props.className || ''

      const onClick = function(e) {
        child.props && child.props.onClick && child.props.onClick(e)
        if (spec.focusOnSelect) {
          spec.focusOnSelect(childOnClickOptions)
        }
      }

      // push a cloned element of the desired slide
      slides.push(React.cloneElement(child, {
        key: 'original' + getKey(child, index),
        'data-index': index,
        className: classnames(getSlideClasses(assign({index: index}, spec)), slideClass),
        tabIndex: '-1',
        style: assign({outline: 'none'}, child.props.style || {}, childStyle),
        onClick
      }));

    });

    return slides
  }

  render() {
    return (
      <div className='slick-track' style={this.props.trackStyle}>
        { this.renderSlides() }
      </div>
    );
  }
}
