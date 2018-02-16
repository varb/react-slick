'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {getTrackCSS, getTrackLeft, getTrackAnimateCSS} from './trackHelper';
import assign from 'object-assign';

var helpers = {
  // supposed to start autoplay of slides
  initialize: function (props) {
    const slickList = ReactDOM.findDOMNode(this.list);

    const childrenCount = React.Children.count(props.children)
    var slideCount = Math.ceil(childrenCount / props.slidesInGrid);
    var listWidth = this.getWidth(slickList);
    var trackWidth = this.getWidth(ReactDOM.findDOMNode(this.track));

    const slideWidth = this.getWidth(ReactDOM.findDOMNode(this)) / props.slidesToShow

    const slideHeight = this.getHeight(slickList.querySelector('[data-index="0"]'));
    const listHeight = slideHeight * props.slidesToShow;

    var currentSlide = props.rtl ? slideCount - 1 - props.initialSlide : props.initialSlide;

    this.setState({
      slideCount,
      slideWidth,
      listWidth,
      trackWidth,
      currentSlide,
      slideHeight,
      listHeight,
    }, function () {
      // this reference isn't lost due to mixin
      var targetLeft = getTrackLeft(assign({
        slideIndex: this.state.currentSlide,
        trackRef: this.track
      }, props, this.state));
      // getCSS function needs previously set state
      var trackStyle = getTrackCSS(assign({left: targetLeft}, props, this.state));

      this.setState({trackStyle: trackStyle});

      this.autoPlay(); // once we're set up, trigger the initial autoplay.
    });
  },
  update: function (props) {
    const slickList = ReactDOM.findDOMNode(this.list);
    // This method has mostly same code as initialize method.
    // Refactor it
    const childrenCount = React.Children.count(props.children)
    var slideCount = Math.ceil(childrenCount / props.slidesInGrid);
    var listWidth = this.getWidth(slickList);
    var trackWidth = this.getWidth(ReactDOM.findDOMNode(this.track));

    const slideWidth = this.getWidth(ReactDOM.findDOMNode(this)) / props.slidesToShow

    const slideHeight = this.getHeight(slickList.querySelector('[data-index="0"]'));
    const listHeight = slideHeight * props.slidesToShow;

    // pause slider if autoplay is set to false
    this.pause()

    this.setState({
      slideCount,
      slideWidth,
      listWidth,
      trackWidth,
      slideHeight,
      listHeight,
    }, function () {

      var targetLeft = getTrackLeft(assign({
        slideIndex: this.state.currentSlide,
        trackRef: this.track
      }, props, this.state));
      // getCSS function needs previously set state
      var trackStyle = getTrackCSS(assign({left: targetLeft}, props, this.state));

      this.setState({trackStyle: trackStyle});
    });
  },
  getWidth: function getWidth(elem) {
    return elem && (elem.getBoundingClientRect().width || elem.offsetWidth) || 0;
  },
  getHeight(elem) {
    return elem && (elem.getBoundingClientRect().height || elem.offsetHeight) || 0;
  },
  adaptHeight: function () {
    if (this.props.adaptiveHeight) {
      var selector = '[data-index="' + this.state.currentSlide +'"]';
      if (this.list) {
        var slickList = ReactDOM.findDOMNode(this.list);
        var elem = slickList.querySelector(selector) || {};
        slickList.style.height = (elem.offsetHeight || 0) + 'px';
      }
    }
  },
  canGoNext: function (opts){
    var canGo = true;
    if (!opts.infinite) {
      if (opts.centerMode) {
        // check if current slide is last slide
        if (opts.currentSlide >= (opts.slideCount - 1)) {
          canGo = false;
        }
      } else {
        // check if all slides are shown in slider
        if (opts.slideCount <= opts.slidesToShow ||
          opts.currentSlide >= (opts.slideCount - opts.slidesToShow)) {
          canGo = false;
        }
      }
    }
    return canGo;
  },
  slideHandler: function (index) {
    // index is target slide index

    // Functionality of animateSlide and postSlide is merged into this function
    var targetSlide, currentSlide;
    var targetLeft, currentLeft;
    var callback;

    if (this.props.waitForAnimate && this.state.animating) {
      return;
    }

    targetSlide = index;
    if (targetSlide < 0) {
      if(this.props.infinite === false) {
        currentSlide = 0;
      } else if (this.state.slideCount % this.props.slidesToScroll !== 0) {
        currentSlide = this.state.slideCount - (this.state.slideCount % this.props.slidesToScroll);
      } else {
        currentSlide = this.state.slideCount + targetSlide;
      }
    } else if (targetSlide >= this.state.slideCount) {
      if(this.props.infinite === false) {
        currentSlide = this.state.slideCount - this.props.slidesToShow;
      } else if (this.state.slideCount % this.props.slidesToScroll !== 0) {
        currentSlide = 0;
      } else {
        currentSlide = targetSlide - this.state.slideCount;
      }
    } else {
      currentSlide = targetSlide;
    }

    targetLeft = getTrackLeft(assign({
      slideIndex: targetSlide,
      trackRef: this.track
    }, this.props, this.state));

    currentLeft = getTrackLeft(assign({
      slideIndex: currentSlide,
      trackRef: this.track
    }, this.props, this.state));

    if (this.props.infinite === false) {
      if (targetLeft === currentLeft) {
        targetSlide = currentSlide;
      }
      targetLeft = currentLeft;
    }

    if (this.props.beforeChange) {
      this.props.beforeChange(this.state.currentSlide, currentSlide);
    }

    if (this.props.lazyLoad) {
      var slidesToLoad = [];
      let slideCount = this.state.slideCount
      for (var i = targetSlide; i < targetSlide + this.props.slidesToShow; i++ ) {
        if (this.state.lazyLoadedList.indexOf(i) < 0) {
          slidesToLoad.push(i)
        }
        if (i >= slideCount && this.state.lazyLoadedList.indexOf(i - slideCount) < 0) {
          slidesToLoad.push(i - slideCount)
        }
        if (i < 0 && this.state.lazyLoadedList.indexOf(i + slideCount) < 0) {
          slidesToLoad.push(i + slideCount)
        }
      }
      if (slidesToLoad.length > 0) {
        this.setState({
          lazyLoadedList: this.state.lazyLoadedList.concat(slidesToLoad)
        });
      }
    }

    // Slide Transition happens here.
    // animated transition happens to target Slide and
    // non - animated transition happens to current Slide
    // If CSS transitions are false, directly go the current slide.

    if (this.props.useCSS === false) {

      this.setState({
        currentSlide: currentSlide,
        trackStyle: getTrackCSS(assign({left: currentLeft}, this.props, this.state))
      }, function () {
        if (this.props.afterChange) {
          this.props.afterChange(currentSlide);
        }
      });

    } else {

      var nextStateChanges = {
        animating: false,
        currentSlide: currentSlide,
        trackStyle: getTrackCSS(assign({left: currentLeft}, this.props, this.state)),
        swipeLeft: null
      };
      callback = () => {
        this.setState(nextStateChanges, () => {
          if (this.props.afterChange) {
            this.props.afterChange(currentSlide);
          }
          delete this.animationEndCallback;
        });
      };

      this.setState({
        animating: true,
        currentSlide: currentSlide,
        trackStyle: getTrackAnimateCSS(assign({left: targetLeft}, this.props, this.state))
      }, function () {
        this.animationEndCallback = setTimeout(callback, this.props.speed);
      });

    }

    this.autoPlay();
  },
  swipeDirection: function (touchObject) {
    var xDist, yDist, r, swipeAngle;

    xDist = touchObject.startX - touchObject.curX;
    yDist = touchObject.startY - touchObject.curY;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round(r * 180 / Math.PI);
    if (swipeAngle < 0) {
        swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0) || (swipeAngle <= 360) && (swipeAngle >= 315)) {
        return 'left';
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
        return 'right';
    }
    if (this.props.verticalSwiping === true) {
      if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
        return 'down';
      } else {
        return 'up';
      }
    }

    return 'vertical';
  },
  play: function(){
    var nextIndex;

    if (!this.state.mounted) {
      return false
    }

    if (this.props.rtl) {
      nextIndex = this.state.currentSlide - this.props.slidesToScroll;
    } else {
      if (this.canGoNext(Object.assign({}, this.props,this.state))) {
        nextIndex = this.state.currentSlide + this.props.slidesToScroll;
      } else {
        return false;
      }
    }

    this.slideHandler(nextIndex);
  },
  autoPlay: function () {
    if (this.state.autoPlayTimer) {
      clearTimeout(this.state.autoPlayTimer);
    }
    if (this.props.autoplay) {
      this.setState({
        autoPlayTimer: setTimeout(this.play, this.props.autoplaySpeed)
      });
    }
  },
  pause: function () {
    if (this.state.autoPlayTimer) {
      clearTimeout(this.state.autoPlayTimer);
      this.setState({
        autoPlayTimer: null
      });
    }
  }
};

export default helpers;
