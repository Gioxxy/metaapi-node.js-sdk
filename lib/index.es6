'use strict';

import MetaApiWebsocketClient from './clients/metaApiWebsocket.client';
import ProvisioningProfileApi from './provisioningProfileApi';
import ProvisioningProfileClient from './clients/provisioningProfile.client';
import HttpClient from './clients/httpClient';
import MetatraderAccountClient from './clients/metatraderAccount.client';
import MetatraderAccountApi from './metatraderAccountApi';
import HistoryStorage from './historyStorage';
import MemoryHistoryStorage from './memoryHistoryStorage';
import SynchronizationListener from './clients/synchronizationListener';

/**
 * MetaApi MetaTrader API SDK
 */
export default class MetaApi {

  /**
   * Constructs MetaApi class instance
   * @param {String} token authorization token
   * @param {String} domain domain to connect to
   * @param {Number} requestTimeout timeout for http requests in seconds
   * @param {Number} connectTimeout timeout for connecting to server in seconds
   */
  constructor(token, domain = 'agiliumtrade.agiliumtrade.ai', requestTimeout = 60, connectTimeout = 60) {
    let httpClient = new HttpClient(requestTimeout);
    this._metaApiWebsocketClient = new MetaApiWebsocketClient(token, domain, requestTimeout, connectTimeout);
    this._provisioningProfileApi = new ProvisioningProfileApi(new ProvisioningProfileClient(httpClient, token, domain));
    this._metatraderAccountApi = new MetatraderAccountApi(new MetatraderAccountClient(httpClient, token, domain),
      this._metaApiWebsocketClient);
  }

  /**
   * Returns provisioning profile API
   * @returns {ProvisioningProfileApi} provisioning profile API
   */
  get provisioningProfileApi() {
    return this._provisioningProfileApi;
  }

  /**
   * Returns MetaTrader account API
   * @return {MetatraderAccountApi} MetaTrader account API
   */
  get metatraderAccountApi() {
    return this._metatraderAccountApi;
  }

  /**
   * Closes all clients and connections
   */
  close() {
    this._metaApiWebsocketClient.close();
  }
  
}

export {HistoryStorage, SynchronizationListener, MemoryHistoryStorage};
