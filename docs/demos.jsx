'use strict';

import React from 'react';
import Slider from '../src/slider';

import CustomSlides from '../examples/CustomSlides'

export default class App extends React.Component {
  render() {
    return (
      <div className='content'>
        <CustomSlides />
      </div>
    );
  }
}
