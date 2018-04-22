import lotion from 'lotion'
import { GCI } from './constants'

(async () => {
  const client = await lotion.connect(GCI)
  // const wallet = coins.wallet(Buffer.from('4de693ec7a181a6e4ab20d24d1901a287d8eebcc77e0dd29544fc5cc3b733071', "hex"), client);
  //
  // console.log(`[pipe] address: ${wallet.address()}`);
  //
  // const balance = await wallet.balance();
  // console.log(`[pipe] balance: ${balance}`);

  const result = await client.send(
    {
      cmd: 'transfer',
      amount: 4,
      sender: 'N4zCmrGo1qm2c9nvYZq915fyNvUun1A1N',
      receiver: 'Lfpj8Khus686xAVsFyze1XYckXR6u4PqX'
    }
  )

  console.log(result)
})()
