import React from 'react'
import Benchspec from './Benchspec'

export default {

  // Run benchspec
  run(benchspec){
    return new Promise((resolve, reject) => {
      Benchspec(benchspec, resolve)
    });
  },

}
