let MetaApi = require('metaapi.cloud-sdk').default;
let SynchronizationListener = require('metaapi.cloud-sdk').SynchronizationListener;

let token = process.env.TOKEN || '<put in your token here>';
let accountId = process.env.ACCOUNT_ID || '<put in your account id here>';
let symbol = process.env.SYMBOL || 'EURUSD';
let domain = process.env.DOMAIN || 'agiliumtrade.agiliumtrade.ai';

const api = new MetaApi(token, {domain});

// eslint-disable-next-line
async function retrieveHistoricalCandles() {
  try {
    let account = await api.metatraderAccountApi.getAccount(accountId);

    // wait until account is deployed and connected to broker
    console.log('Deploying account');
    if (account.state !== 'DEPLOYED') {
      await account.deploy();
    } else {
      console.log('Account already deployed');
    }
    console.log('Waiting for API server to connect to broker (may take couple of minutes)');
    if (account.connectionStatus !== 'CONNECTED') {
      await account.waitConnected();
    }

    // retrieve last 10K 1m candles
    let pages = 10;
    console.log(`Downloading ${pages}K latest candles for ${symbol}`);
    let startedAt = Date.now();
    let startTime;
    let candles
    for (let i = 0; i < pages; i++) {
      // the API to retrieve historical market data is currently available for G1 only
      candles = await account.getHistoricalCandles(symbol, '1m', startTime);
      console.log(`Downloaded ${candles ? candles.length : 0} historical candles for ${symbol}`);
      if (candles && candles.length) {
        startTime = candles[0].time;
        startTime.setMinutes(startTime.getMinutes() - 1);
        console.log(`First candle time is ${startTime}`);
      }
    }
    if (candles) {
      console.log('First candle is', candles[0]);
    }
    console.log(`Took ${Date.now() - startedAt}ms`);

  } catch (err) {
    console.error(err);
  }
}

retrieveHistoricalCandles();
