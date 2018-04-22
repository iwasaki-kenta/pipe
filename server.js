// import {Server} from 'uws';
//
// console.log("[pipe] Starting up a server.");
//
// const socket = new Server({port: 3000});
//
// socket.on('connection', ws => {
//   ws.on('message', message => {
//     console.log(message);
//   });
// })
//

import lotion from 'lotion'
import _ from 'lodash'
import np from 'numjs'

const app = lotion({
  devMode: true,
  initialState: {
    bandwidth: [],
    accounts: {
      'N4zCmrGo1qm2c9nvYZq915fyNvUun1A1N': {
        balance: 1000000,
        observations: [0, 0, 0]
      },
      'Lfpj8Khus686xAVsFyze1XYckXR6u4PqX': {
        balance: 100,
        observations: [0, 0, 0]
      },
      'CKhQgGEk45axuGi8KnyAg6of4buWPvPkh': {
        balance: 500,
        observations: [0, 0, 0]
      }
    },
  }
})

const rewardMiners = state => {
  let T = np.array(_.map(state.accounts, 'observations'))

  const TRUSTED_NODES = _.map(Object.keys(state.accounts), (account, i) => i)
  const NUM_NODES = T.shape[0]

  // for (let x = 0; x < NUM_NODES; x++)
  //   T.set(x, x, 0)

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
    e.set(x, T.slice([x, x + 1]).sum() / T.sum())
  }

  const bandwidths = T.dot(e).tolist()
  _.each(bandwidths, (bandwidth, i) => {
    if (i < TRUSTED_NODES.length) {
      state.accounts[Object.keys(state.accounts)[i]].balance += bandwidth / (_.sum(_.map(state.accounts, 'balance')) * 128)
    }
  })

  state.bandwidth = bandwidths

  return state
}

app.use((state, tx, _) => {
  const sender = tx.sender
  if (!sender) throw new Error('Sender is not specified.')

  if (!(sender in state.accounts)) {
    state.accounts[sender] = {
      balance: 0,
      observations: Array.from(Array(Object.keys(state.accounts).length + 1), () => 0)
    }
  }

  if (tx.cmd === 'transfer') {
    if (state.accounts[sender].balance - tx.amount < 0)
      throw new Error('Sender does not have enough \'bytes\' to provide.')
    state.accounts[sender].balance -= tx.amount
    state.accounts[tx.receiver].balance += tx.amount
  }

  if (tx.cmd === 'record') {
    if (!tx.observations) throw new Error('Sender did not provide observations of other nodes bandwidth.')

    state.accounts[sender].observations = tx.observations
    state = rewardMiners(state)
  }
})

app.listen(8888, '0.0.0.0').then(console.log)