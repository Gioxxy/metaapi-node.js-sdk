'use strict';

import HttpClient from '../clients/httpClient';
import ProvisioningProfileClient from '../clients/metaApi/provisioningProfile.client';
import ProvisioningProfileApi from './provisioningProfileApi';
import MetaApiWebsocketClient from '../clients/metaApi/metaApiWebsocket.client';
import MetatraderAccountApi from './metatraderAccountApi';
import MetatraderAccountClient from '../clients/metaApi/metatraderAccount.client';
import MetatraderDemoAccountApi from './metatraderDemoAccountApi';
import MetatraderDemoAccountClient from '../clients/metaApi/metatraderDemoAccount.client';
import HistoricalMarketDataClient from '../clients/metaApi/historicalMarketData.client';
import ConnectionRegistry from './connectionRegistry';
import {ValidationError} from '../clients/errorHandler';
import LatencyMonitor from './latencyMonitor';

/**
 * Request retry options
 * @typedef {Object} RetryOpts
 * @property {Number} [retries] maximum amount of request retries, default value is 5
 * @property {Number} [minDelayInSeconds] minimum delay in seconds until request retry, default value is 1
 * @property {Number} [maxDelayInSeconds] maximum delay in seconds until request retry, default value is 30
 */

/**
 * MetaApi options
 * @typedef {Object} MetaApiOpts
 * @property {String} [application] application id
 * @property {String} [domain] domain to connect to, default is agiliumtrade.agiliumtrade.ai
 * @property {Number} [requestTimeout] timeout for socket requests in seconds
 * @property {Number} [connectTimeout] timeout for connecting to server in seconds
 * @property {Number} [packetOrderingTimeout] packet ordering timeout in seconds
 * @property {PacketLoggerOpts} [packetLogger] packet logger options
 * @property {Boolean} [enableLatencyMonitor] an option to enable latency tracking
 * @property {Boolean} [enableLatencyTracking] an option to enable latency tracking
 * @property {SynchronizationThrottlerOpts} [synchronizationThrottler] options for synchronization throttler
 * @property {RetryOpts} [retryOpts] options for request retries
 */

/**
 * MetaApi MetaTrader API SDK
 */
export default class MetaApi {

  /**
   * Constructs MetaApi class instance
   * @param {String} token authorization token
   * @param {MetaApiOpts} opts application options
   */
  // eslint-disable-next-line complexity
  constructor(token, opts) {
    opts = opts || {};
    const application = opts.application || 'MetaApi';
    const domain = opts.domain || 'agiliumtrade.agiliumtrade.ai';
    const requestTimeout = opts.requestTimeout || 60;
    const historicalMarketDataRequestTimeout = opts.historicalMarketDataRequestTimeout || 240;
    const connectTimeout = opts.connectTimeout || 60;
    const packetOrderingTimeout = opts.packetOrderingTimeout || 60;
    const retryOpts = opts.retryOpts || {};
    const packetLogger = opts.packetLogger || {};
    const synchronizationThrottler = opts.synchronizationThrottler || {};
    if (!application.match(/[a-zA-Z0-9_]+/)) {
      throw new ValidationError('Application name must be non-empty string consisting from letters, digits and _ only');
    }
    let httpClient = new HttpClient(requestTimeout, retryOpts);
    let historicalMarketDataHttpClient = new HttpClient(historicalMarketDataRequestTimeout, retryOpts);
    this._metaApiWebsocketClient = new MetaApiWebsocketClient(token, {application, domain, requestTimeout,
      connectTimeout, packetLogger, packetOrderingTimeout, synchronizationThrottler, retryOpts});
    this._provisioningProfileApi = new ProvisioningProfileApi(new ProvisioningProfileClient(httpClient, token, domain));
    this._connectionRegistry = new ConnectionRegistry(this._metaApiWebsocketClient, application);
    let historicalMarketDataClient = new HistoricalMarketDataClient(historicalMarketDataHttpClient, token, domain);
    this._metatraderAccountApi = new MetatraderAccountApi(new MetatraderAccountClient(httpClient, token, domain),
      this._metaApiWebsocketClient, this._connectionRegistry, historicalMarketDataClient);
    this._metatraderDemoAccountApi = new MetatraderDemoAccountApi(
      new MetatraderDemoAccountClient(httpClient, token, domain));
    if (opts.enableLatencyTracking || opts.enableLatencyMonitor) {
      this._latencyMonitor = new LatencyMonitor();
      this._metaApiWebsocketClient.addLatencyListener(this._latencyMonitor);
    }
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
   * Returns MetaTrader demo account API
   * @return {MetatraderDemoAccountApi} MetaTrader demo account API
   */
  get metatraderDemoAccountApi() {
    return this._metatraderDemoAccountApi;
  }

  /**
   * Returns MetaApi application latency monitor
   * @return {LatencyMonitor} latency monitor
   */
  get latencyMonitor() {
    return this._latencyMonitor;
  }

  /**
   * Closes all clients and connections
   */
  close() {
    this._metaApiWebsocketClient.removeLatencyListener(this._latencyMonitor);
    this._metaApiWebsocketClient.close();
  }

}
