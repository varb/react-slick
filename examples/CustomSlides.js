import React, { Component } from 'react'
import Slider from '../src/slider'

class CustomSlide extends Component {
  render() {
    const {index, ...props} = this.props
    return (
      <div {...props}>
        <h3>{index}</h3>
        <div>{index}</div>
        <div>{index}</div>
      </div>
    )
  }
}

export default class SimpleSlider extends Component {
  render() {
    const settings = {
      dots: true,
      infinite: false,
      speed: 300,
      responsive: [
        {
          breakpoint: 768,
          settings: { slidesInGrid: 2 }
          // settings: { countItemsInSlide: 2 }
        }, {
          breakpoint: 1024,
          settings: { slidesInGrid: 4 }
          // settings: { slidesToShow: 6, slidesToScroll: 6 }
        }, {
          breakpoint: 100000,
          settings: 'unslick'
        }
      ]
    };

    return (
      <div>
        <h2>Custom Slides</h2>
        <Slider {...settings}>
          <CustomSlide index={1} />
          <CustomSlide index={2} />
          <CustomSlide index={3} />
          <CustomSlide index={4} />
          <CustomSlide index={5} />
          <CustomSlide index={6} />
          <CustomSlide index={7} />
          <CustomSlide index={8} />
          <CustomSlide index={9} />
        </Slider>
      </div>
    );
  }
}
