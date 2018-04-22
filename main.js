// import lotion from 'lotion'
// import { GCI } from './constants'
// import express from 'express'
//
// const app = express()
// require('express-uws')(app);
//
// (async () => {
//   const client = await lotion.connect(GCI)
//
//   app.get('/', (req, res) => res.send('Hello world.'))
//   app.ws('/socket', (ws, _) => {
//     console.log('[pipe] Client has connected to node.')
//     ws.on('message', msg => {
//       // For this hackathon, let's assume it's JSON format :).
//
//       try {
//         const event = JSON.parse(msg)
//         console.log(event);
//       } catch (error) {
//         console.log('No.', error)
//       }
//     })
//   })
//
//   app.listen(8000, () => console.log('Analytics server for [pipe] is listening on port 8000.'))
// })()

import np from 'numjs'
import _ from 'lodash'

const NUM_NODES = 128
const TRUSTED_NODES = [2, 4, 8, 32]

const T = np.random([NUM_NODES, NUM_NODES]).multiply(100).add(100)
for (let x = 0; x < NUM_NODES; x++)
  T.set(x, x, 0)

const T_norm = T.clone()
for (let x = 0; x < NUM_NODES; x++) {
  for (let y = 0; y < NUM_NODES; y++) {
    const value = Math.min(T.get(x, y), T.get(y, x)) / (Math.min(T.slice([x, x + 1]).sum(), T.slice([y, y + 1]).sum()))
    T_norm.set(x, y, value)
  }
}

const trusted_T = np.zeros([NUM_NODES])
_.each(TRUSTED_NODES, index => trusted_T.set(index, 1.0 / TRUSTED_NODES.length))

const e = np.zeros([NUM_NODES])

for (let x = 0; x < NUM_NODES; x++) {
  e.set(x, T.slice([x, x+1]).sum() / T.sum())
}

console.log(T.dot(e))
console.log(T)

// let T_new = T.clone()
//
//
// while (Math.sqrt(T_new.dot(T_norm.T).subtract(T_new).pow(2).sum()) > 1e-5) {
//   T_new = T_new.dot(T_norm.T);
//
//   console.log(Math.sqrt(T_new.dot(T_norm.T).subtract(T_new).pow(2).sum()))
// }
//
// console.log(T.multiply(T_new))

// console.log(T.dot(T_new.T))