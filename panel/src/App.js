import React, { Component } from 'react'
import styled from 'styled-components'
import random from 'random-name'
import _ from 'lodash';

const Page = styled.div`
margin: 0;
  padding: 1.5em;
  width: 960px;
  max-width: 960px;
`

const NavBar = styled.div`
display: flex;
align-items: center;
flex-direction: row;
width: 100%;

& > *:not(:first-child) {
margin-right: 1.5em;
}
`

const Row = styled.div`
display: flex;
flex-direction: row;
width: 100%;
`

const Column = styled.div`
display: flex;
flex-direction: column;
overflow-x: hidden;
`

const Logo = styled.span`
  font-weight: 600;
  font-size: 2.5em;
  margin-right: 1em;
  font-family: monospace;
`

const Container = styled.div`
margin-top: 1em;
width: 100%;

& > * {
margin-bottom: 0.5em;
}
`

const StatusTitle = styled.span`
  font-size: 1em;
  font-weight: 700;
`

const StatusText = styled.span`
  font-size: 0.8em;
`

const CodeButton = styled.button`
font-family: monospace;
border: 0;
background-color: black;
color: white;
padding: 0.5em;
margin-right: 0.5em;
cursor: pointer;
 `

const Textbox = styled.input`
padding: 0.35em;
font-family: ProximaNova;
margin: 0;
border: 1px solid black;

:focus {
  outline: none;
}
`

const SelectBox = styled.select`
font-family: ProximaNova;
margin: 0;
border: 1px solid black;

:focus {
  outline: none;
}
background-color: #f2f2f2;
height: 100%;
margin-right: 0.5em;`

const WideTextbox = styled(Textbox)`
width: 100%;
font-size: 2.5em;
padding: 0.25em;
text-align: center;
font-family: monospace;
background-color: #f2f2f2;
user-select: none;
`

const STATE_REQUIRES_INIT = 0
const STATE_TESTING = 1
const STATE_BROADCAST = 2
const STATE_BROADCASTING = 3

const NUM_NODES = 3

const ListContainer = styled.div`
display: flex;
flex-direction: column;
  background-color: #f2f2f2;
  border: 1px solid black;
  margin-bottom: 0.5em;
`

const ListTitlebar = styled(Row)`
  color: black;
  background-color: white;
  font-family: monospace;
  width: 100%;
  font-weight: 600;
`

const ListBody = styled(Row)`
  width: 100%;
  background-color: black;
  color: lime;
  overflow-x: auto;
  `
const FlexRow = styled(Row)`
  width: 100%;
  overflow: auto;
  justify-content: space-evenly;
  & > *:not(:last-child) {
    margin-right: 1em;
  }
`

class ListRow extends Component {
  render() {
    const {title, text} = this.props

    return (
      <ListContainer>
        <ListTitlebar>
          <span style={{padding: '0.5em', width: '100%'}}>
            {title || 'Test Title'}
          </span>
        </ListTitlebar>
        <ListBody>
          <code style={{padding: '0.5em', fontSize: '0.8em'}}>{_.isFunction(text) ? text() : (text || 'Test Text')}</code>
        </ListBody>
      </ListContainer>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    const nodes = []
    for (let i = 0; i < NUM_NODES; i++) {
      nodes.push(`${random.first()} ${random.last()}`)
    }

    this.state = {
      url: 'https://google.com',
      broadcastState: STATE_REQUIRES_INIT,
      latestBlockHeight: 0,
      bandwidth: -1,
      submittedTransactions: [],
      address: 'N4zCmrGo1qm2c9nvYZq915fyNvUun1A1N',
      accounts: ['N4zCmrGo1qm2c9nvYZq915fyNvUun1A1N', 'Lfpj8Khus686xAVsFyze1XYckXR6u4PqX', 'CKhQgGEk45axuGi8KnyAg6of4buWPvPkh'],
      testContent: '...',
      blockchain: null,
      nodes
    }

  }

  recordTransaction(transaction) {
    let transactions = this.state.submittedTransactions
    if (transactions.length >= 5) {
      transactions.shift()
    }

    transactions.push(transaction)

    this.setState({submittedTransactions: transactions})

  }

  async componentDidMount() {
    setInterval(async () => {
      await this.updateNetworkInfo()
      if (this.state.broadcastState === STATE_BROADCASTING) {
        await this.recordBandwidth()
      }
    }, 1000)
  }

  async recordBandwidth() {
    const bandwidth = await this.updateBandwidth()

    const observations = Array.from(Array(this.state.nodes.length), () => bandwidth + Math.random() * (bandwidth / 100) + bandwidth / 2)
    observations[0] = bandwidth

    const transaction = {
      cmd: 'record',
      observations,
      sender: this.state.address
    }

    this.recordTransaction(transaction)

    await (await fetch(`http://${window.location.hostname}:8888/txs`, {
      method: 'POST',
      body: JSON.stringify(transaction)
    })).json()
  }

  async updateNetworkInfo() {
    const {result} = await (await fetch(`http://${window.location.hostname}:8888/tendermint/status`)).json()
    const chain = await (await fetch(`http://${window.location.hostname}:8888/state`)).json()
    this.setState({latestBlockHeight: result.latest_block_height, chain})
  }

  async pageSize() {
    const response = await (await fetch(this.state.url, {headers: new Headers({'Origin': this.state.url})})).text()
    return response
  }

  setURL(url) {
    this.setState({url})
  }

  async handleBroadcast() {
    const {broadcastState} = this.state

    if (broadcastState === STATE_REQUIRES_INIT) {
      this.setState({broadcastState: STATE_TESTING})

      await this.updateBandwidth()

      this.setState({broadcastState: STATE_BROADCAST})
    } else if (broadcastState === STATE_BROADCAST) {
      this.setState({broadcastState: STATE_BROADCASTING})
    } else if (broadcastState === STATE_TESTING || broadcastState === STATE_BROADCASTING) {
      this.setState({broadcastState: STATE_REQUIRES_INIT, bandwidth: -1, testContent: '...'})
    }
  }

  async updateBandwidth() {
    const start = new Date().getTime()
    const testContent = await this.pageSize()
    const bandwidth = testContent.length / ((new Date().getTime() - start) / 1000)
    this.setState({bandwidth, testContent})

    return bandwidth
  }

  cancelSelling() {
    this.setState({broadcastState: STATE_REQUIRES_INIT, bandwidth: -1, testContent: '...', submittedTransactions: []})
  }

  chooseAccount(account) {
    console.log(account)
    this.cancelSelling()
    this.setState({address: account})
  }

  render() {
    const {url, broadcastState, latestBlockHeight, testContent, submittedTransactions, bandwidth, address, chain, nodes} = this.state

    let broadcastButtonText = 'Test bandwidth'
    if (broadcastState === STATE_TESTING) broadcastButtonText = 'Testing bandwidth...'
    if (broadcastState === STATE_BROADCAST) broadcastButtonText = 'Start selling bandwidth'
    if (broadcastState === STATE_BROADCASTING) broadcastButtonText = 'Stop selling bandwidth'

    let broadcastButtonColor = 'black'
    if (broadcastState === STATE_TESTING) broadcastButtonColor = 'blue'
    if (broadcastState === STATE_BROADCAST) broadcastButtonColor = 'green'
    if (broadcastState === STATE_BROADCASTING) broadcastButtonColor = 'red'

    return (
      <Page>
        <NavBar>
          <Column>
            <Logo>:pipe</Logo>
          </Column>
          <Column>
            <Row>
              <StatusTitle>Connected Clients</StatusTitle>
            </Row>
            <Row>
              <StatusText>{nodes.length} nodes are connected.</StatusText>
            </Row>
          </Column>
          <Column>
            <Row>
              <StatusTitle>Latest Block</StatusTitle>
            </Row>
            <Row>
              <StatusText>Block #{latestBlockHeight}</StatusText>
            </Row>
          </Column>
          <Column>
            <Row>
              <StatusTitle>Account Balance</StatusTitle>
            </Row>
            <Row>
              <StatusText>{chain && chain.accounts[address].balance.toFixed(2) || 0} coin(s)</StatusText>
            </Row>
          </Column>
          <Column>
            <Row>
              <StatusTitle>Status</StatusTitle>
            </Row>
            <Row>
              <StatusText>
                {bandwidth !== -1 && broadcastState !== STATE_REQUIRES_INIT ? (broadcastState === STATE_BROADCAST ? `Achieved ${bandwidth.toFixed(2)} bytes/sec.` : `You are providing ${bandwidth.toFixed(2)} bytes/sec.`) : `You are not providing any bandwidth.`}
              </StatusText>
            </Row>
          </Column>
        </NavBar>

        <Container>
          <Row>
            <WideTextbox type="text" defaultValue={url} onChange={event => this.setURL(event.target.value)}/>
          </Row>
          <Row style={{justifyContent: 'center'}}>
            <Column>
              <SelectBox onChange={event => this.chooseAccount(event.target.value)}>
                {
                  this.state.accounts.map((account, i) => {
                    return (
                      <option value={account} key={i}>{`Wallet Public Key: ${account}`}</option>
                    )
                  })
                }
              </SelectBox>
            </Column>
            <CodeButton style={{backgroundColor: broadcastButtonColor}}
                        onClick={async _ => await this.handleBroadcast()}>{broadcastButtonText}</CodeButton>
            {broadcastState === STATE_BROADCAST ? <CodeButton onClick={() => this.cancelSelling()}
                                                              style={{backgroundColor: 'red'}}>Cancel</CodeButton> : ''}
          </Row>
          <FlexRow>
            <Column style={{flex: 1}}>
              {
                submittedTransactions.length == 0 ?
                  <ListRow title="no transactions submitted" text="..."/> : submittedTransactions.map((tx, i) => {
                    const data = Object.assign({}, tx)
                    delete data['cmd']

                    return (
                      <ListRow key={i} title={tx.cmd}
                               text={JSON.stringify(data).slice(0, 80) + (JSON.stringify(data).length >= 80 ? '...' : '')}/>
                    )
                  })
              }
            </Column>
            <Column style={{flex: 1}}>
              <ListRow title={`bandwidth test i/o`}
                       text={testContent.slice(0, 1000) + (JSON.stringify(testContent).length >= 1000 ? '...' : '')}/>
              <ListRow title={`true bandwidth`}
                       text={() => {
                         return chain && chain.bandwidth && chain.bandwidth.map((v, i) => {
                           return (
                             <span>{`Node ${Object.keys(chain.accounts)[i]}: ${v.toFixed(2)} bytes(s)`}<br/></span>
                           )
                         })
                         || '....'
                       }
                       }/>
            </Column>
          </FlexRow>
        </Container>
      </Page>
    )
  }
}

export default App
