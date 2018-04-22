import Interface from 'bluetooth-serial-port'

const server = new Interface.BluetoothSerialPortServer()

const CHANNEL_ID = 22
const UUID = '38e851bc-7144-44b4-9cd8-80549c6f2912'

server.listen(address => {
  console.log('Client: ' + address + ' connected!')

  server.on('data', buffer => {
    console.log('Received data from client: ' + buffer)
    console.log('Sending data to the client')

    server.write(new Buffer('...'), (err, len) => {
      if (err) {
        console.log('Error!', err)
      } else {
        console.log('Sent ' + len + ' to the client!')
      }
    })
  })
}, err => {
  console.error('Something wrong happened!:' + err)
}, {uuid: UUID, channel: CHANNEL_ID})