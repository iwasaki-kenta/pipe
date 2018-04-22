import Interface from 'bluetooth-serial-port'

const port = new Interface.BluetoothSerialPort()

let it = 0
port.on('found', (address, name) => {
  console.log(`[pipe #${it++}]: Found '${name}' on address ${address}.`)

  port.findSerialPortChannel(address, channel => {
    port.connect(address, channel, () => {
      console.log('Connected. Transmitting...')

      port.write(new Buffer('LISTENER_CONNECT', 'utf-8'), (err, _) => {
        if (err) console.log(err)
      })

      port.on('data', buffer => {
        console.log(buffer.toString("utf-8"))
      })
    }, () => {
      console.log('Cannot connect to serial port of Bluetooth device.')
    })

    // close the connection when you're ready
    port.close()
  }, () => {
    console.log(`Couldn't find any Bluetooth devices available.`)
  })
})

port.inquire()