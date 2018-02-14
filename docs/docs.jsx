'use strict';

import React from 'react'
import Demos from './demos'

export default class Docs extends React.Component {
  render() {
    return (
      <div className=''>
        <div className='title-bar primary'>
            <span className='title'>React Slick123</span>
        </div>
        <div className=''>
          <div className=''>
            <Demos />
          </div>
        </div>
      </div>
    );
  }
}
