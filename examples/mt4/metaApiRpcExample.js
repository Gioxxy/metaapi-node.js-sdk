let MetaApi = require('metaapi.cloud-sdk').default;

let token = process.env.TOKEN || '<put in your token here>';
let login = process.env.LOGIN || '<put in your MT login here>';
let password = process.env.PASSWORD || '<put in your MT password here>';
let serverName = process.env.SERVER || '<put in your MT server name here>';
let brokerSrvFile = process.env.PATH_TO_BROKER_SRV || '/path/to/your/broker.srv';

const api = new MetaApi(token);

async function testMetaApiSynchronization() {
  try {
    const profiles = await api.provisioningProfileApi.getProvisioningProfiles();

    // create test MetaTrader account profile
    let profile = profiles.find(p => p.name === serverName);
    if (!profile) {
      console.log('Creating account profile');
      profile = await api.provisioningProfileApi.createProvisioningProfile({
        name: serverName,
        type: 'standard',
        version: 4
      });
      await profile.uploadFile('broker.srv', brokerSrvFile);
    }
    if (profile && profile.statue === 'new') {
      console.log('Uploading broker.srv');
      await profile.uploadFile('broker.srv', brokerSrvFile);
    } else {
      console.log('Account profile already created');
    }

    // Add test MetaTrader account
    let accounts = await api.metatraderAccountApi.getAccounts();
    let account = accounts.find(a => a.login === login && a.synchronizationMode == 'automatic');
    if (!account) {
      console.log('Adding MT4 account to MetaApi');
      account = await api.metatraderAccountApi.createAccount({
        name: 'Test account',
        type: 'cloud',
        login: login,
        password: password,
        server: serverName,
        synchronizationMode: 'automatic',
        provisioningProfileId: profile.id,
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        magic: 1000
      });
    } else {
      console.log('MT4 account already added to MetaApi');
    }

    // wait until account is deployed and connected to broker
    console.log('Deploying account')
    await account.deploy();
    console.log('Waiting for API server to connect to broker (may take couple of minutes)')
    await account.waitConnected();

    // connect to MetaApi API
    let connection = await account.connect();

    // wait until terminal state synchronized to the local state
    console.log('Waiting for SDK to synchronize to terminal state (may take some time depending on your history size)');
    await connection.waitSynchronized();

    // invoke RPC API (replace ticket numbers with actual ticket numbers which exist in your MT account)
    console.log('Testing MetaAPI RPC API');
    console.log('account information:', await connection.getAccountInformation());
    console.log('positions:', await connection.getPositions());
    //console.log(await connection.getPosition('1234567'));
    console.log('open orders:', await connection.getOrders());
    //console.log(await connection.getOrder('1234567'));
    console.log('history orders by ticket:', await connection.getHistoryOrdersByTicket('1234567'));
    console.log('history orders by position:', await connection.getHistoryOrdersByPosition('1234567'));
    console.log('history orders (~last 3 months):', await connection.getHistoryOrdersByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
    console.log('history deals by ticket:', await connection.getDealsByTicket('1234567'));
    console.log('history deals by position:', await connection.getDealsByPosition('1234567'));
    console.log('history deals (~last 3 months):', await connection.getDealsByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));

    // trade
    console.log('Submitting pending order');
    let result = await connection.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE')
    if (result.description === 'TRADE_RETCODE_DONE') {
      console.log('Trade successful');
    } else {
      console.error('Trade failed with ' + result.description + ' error');
    }

    // finally, undeploy account after the test
    console.log('Undeploying MT4 account so that it does not consume any unwanted resources');
    await account.undeploy();

    process.exit();
  } catch (err) {
    console.error(err);
  }
}

testMetaApiSynchronization();
