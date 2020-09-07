'use strict';

import MetaApiClient from '../metaApi.client';
import randomstring from 'randomstring';

/**
 * metaapi.cloud CopyFactory configuration API (trade copying configuration API) client (see
 * https://trading-api-v1.project-stock.agiliumlabs.cloud/swagger/#/)
 */
export default class ConfigurationClient extends MetaApiClient {

  /**
   * Constructs CopyFactory configuration API client instance
   * @param {HttpClient} httpClient HTTP client
   * @param {String} token authorization token
   * @param {String} domain domain to connect to, default is agiliumtrade.agiliumtrade.ai
   */
  constructor(httpClient, token, domain = 'agiliumtrade.agiliumtrade.ai') {
    super(httpClient, token, domain = 'agiliumtrade.agiliumtrade.ai');
    this._host = `https://trading-api-v1.${domain}`;
  }

  /**
   * Strategy id
   * @typedef {Object} StrategyId
   * @property {String} id strategy id
   */

  /**
   * Retrieves new unused strategy id. Method is accessible only with API access token. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/get_users_current_configuration_unused_strategy_id
   * @return {Promise<StrategyId>} promise resolving with strategy id generated
   */
  generateStrategyId() {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('generateStrategyId');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/unused-strategy-id`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Retrieves new unused strategy id. Method is accessible only with API access token. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/get_users_current_configuration_unused_strategy_id
   * @return {Promise<StrategyId>} promise resolving with strategy id generated
   */
  generateAccountId() {
    return randomstring.generate(64);
  }

  /**
   * CopyFactory account model
   * @typedef {CopyFactoryAccountUpdate} CopyFactoryAccount
   * @property {String} _id account unique identifier
   */

  /**
   * CopyFactory strategy subscriptions
   * @typedef {Object} CopyFactoryStrategySubscription
   * @property {String} strategyId id of the strategy to subscribe to
   * @property {Number} [multiplier] optional subscription multiplier, default is 1x
   * @property {Boolean} [skipPendingOrders] optional flag indicating that pending orders should not be copied. Default
   * is to copy pending orders
   * @property {String} [closeOnly] optional setting wich instructs the application not to open new positions. by-symbol
   * means that it is still allowed to open new positions with a symbol equal to the symbol of an existing strategy
   * position (can be used to gracefuly exit strategies trading in netting mode or placing a series of related trades
   * per symbol). One of by-position, by-symbol or leave empty to disable this setting.
   * @property {Number} [maxTradeRisk] optional max risk per trade, expressed as a fraction of 1. If trade has a SL, the
   * trade size will be adjusted to match the risk limit. If not, the trade SL will be applied according to the risk
   * limit
   * @property {String} [reduceCorrelations] optional setting indicating whether to enable automatic trade correlation
   * reduction. Possible settings are not specified (disable correlation risk restrictions), by-strategy (limit
   * correlations on strategy level) or by-symbol (limit correlations on symbol level).
   * @property {CopyFactoryStrategyStopOut} [stopOutRisk] optional stop out setting. All trading will be terminated and positions closed
   * once equity drawdown reaches this value
   * @property {CopyFactoryStrategySymbolFilter} [symbolFilter] optional symbol filter which can be used to copy only specific
   * symbols or exclude some symbols from copying
   * @property {CopyFactoryStrategyNewsFilter} [newsFilter] optional news risk filter configuration
   * @property {Array<CopyFactoryStrategyRiskLimit>} [riskLimits] optional strategy risk limits. You can configure trading to be
   * stopped once total drawdown generated during specific period is exceeded. Can be specified either for balance or
   * equity drawdown
   * @property {CopyFactoryStrategyMaxStopLoss} [maxStopLoss] optional stop loss value restriction
   * @property {Number} [maxLeverage] optional setting indicating maxumum leverage allowed when opening a new positions.
   * Any trade which results in a higher leverage will be discarded
   */

  /**
   * CopyFactory strategy stopout settings
   * @typedef {Object} CopyFactoryStrategyStopOut
   * @property {Number} value value of the stop out risk, expressed as a fraction of 1
   * @property {Date} [startTime] the time to start risk calculation from. All previous trades will be ignored. You can
   * use it to reset the risk counter after a stopout event
   */

  /**
   * CopyFactory symbol filter
   * @typedef {Object} CopyFactoryStrategySymbolFilter
   * @property {Array<String>} included list of symbols copied. Leave the value empty to copy all symbols
   * @property {Array<String>} excluded list of symbols excluded from copying. Leave the value empty to copy all symbols
   */

  /**
   * CopyFactory news risk filter
   * @typedef {Object} CopyFactoryStrategyNewsFilter
   * @property {CopyFactoryStrategyBreakingNewsFilter} [breakingNewsFilter] optional breaking news filter
   * @property {CopyFactoryStrategyCalendarNewsFilter} [calendarNewsFilter] optional calendar news filter
   */

  /**
   * CopyFactory breaking news risk filter
   * @typedef {Object} CopyFactoryStrategyBreakingNewsFilter
   * @property {Array<String>} priorities list of breaking news priorities to stop trading on, leave empty to disable
   * breaking news filter. One of high, medium, low.
   * @property {Number} [closePositionTimeGapInMinutes] optional time interval specifying when to force close an already
   * open position before calendar news. Default value is 60 minutes
   * @property {Number} [openPositionFollowingTimeGapInMinutes] optional time interval specifying when it is allowed to
   * open position after calendar news. Default value is 60 minutes
   */

  /**
   * CopyFactory calendar new filter
   * @typedef {Object} CopyFactoryStrategyCalendarNewsFilter
   * @property {Array<String>} priorities list of calendar news priorities to stop trading on, leave empty to disable
   * calendar news filter. One of election, high, medium, low.
   * @property {Number} [closePositionTimeGapInMinutes] optional time interval specifying when to force close an already
   * open position before calendar news. Default value is 60 minutes
   * @property {Number} [openPositionPrecedingTimeGapInMinutes] optional time interval specifying when it is still
   * allowed to open position before calendar news. Default value is 120 minutes
   * @property {Number} [openPositionFollowingTimeGapInMinutes] optional time interval specifying when it is allowed to
   * open position after calendar news. Default value is 60 minutes
   */

  /**
   * CopyFactory risk limit filter
   * @typedef {Object} CopyFactoryStrategyRiskLimit
   * @property {String} type restriction type. One of daily, monthly, or yearly
   * @property {String} applyTo account metric to apply limit to. One of balance, equity
   * @property {String} maxRisk max drawdown allowed, expressed as a fraction of 1
   * @property {Boolean} closePositions whether to force close positions when the risk is reached. If value is false
   * then only the new trades will be halted, but existing ones will not be closed
   * @property {Date} [startTime] optional time to start risk tracking from. All previous trades will be ignored. You
   * can use this value to reset the filter after stopout event
   */

  /**
   * CopyFactory strategy max stop loss settings
   * @typedef {Object} CopyFactoryStrategyMaxStopLoss
   * @property {Number} value maximum SL value
   * @property {String} units SL units. Only pips value is supported at this point
   */

  /**
   * Retrieves CopyFactory copy trading accounts. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/get_users_current_configuration_accounts
   * @return {Promise<CopyFactoryAccount>} promise resolving with CopyFactory accounts found
   */
  getAccounts() {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('getAccounts');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/accounts`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * CopyFactory account update
   * @typedef {Object} CopyFactoryAccountUpdate
   * @property {String} name account human-readable name
   * @property {String} connectionId id of the MetaApi MetaTrader account this copy trading account is connected to
   * @property {Number} [reservedMarginFraction] optional fraction of reserved margin to reduce a risk of margin call.
   * Default is to reserve no margin. We recommend using maxLeverage setting instead. Specified as a fraction of balance
   * thus the value is usually greater than 1
   * @property {Array<String>} [phoneNumbers] optional phone numbers to send sms notifications to. Leave empty to
   * receive no sms notifications
   * @property {Number} [minTradeAmount] optional value of minimal trade size allowed, expressed in amount of account
   * currency. Can be useful if your broker charges a fixed fee per transaction so that you can skip small trades with
   * high broker commission rates. Default is 1000
   * @property {String} [closeOnly] optional setting wich instructs the application not to open new positions. by-symbol
   * means that it is still allowed to open new positions with a symbol equal to the symbol of an existing strategy
   * position (can be used to gracefuly exit strategies trading in netting mode or placing a series of related trades
   * per symbol). One of by-position, by-symbol or leave empty to disable this setting.
   * @property {Number} [maxLeverage] optional setting indicating maxumum leverage allowed when opening a new positions.
   * Any trade which results in a higher leverage will be discarded.
   * @property {Array<CopyFactoryStrategySubscription>} subscriptions strategy subscriptions
   */

  /**
   * Updates a CopyFactory trade copying account. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/put_users_current_configuration_accounts_accountId
   * @param {String} id copy trading account id
   * @param {CopyFactoryAccountUpdate} account trading account update
   * @return {Promise} promise resolving when account is updated
   */
  updateAccount(id, account) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('updateAccount');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/accounts/${id}`,
      method: 'PUT',
      headers: {
        'auth-token': this._token
      },
      body: account,
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Deletes a CopyFactory trade copying account. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/delete_users_current_configuration_accounts_accountId
   * @param {String} id copy trading account id
   * @return {Promise} promise resolving when account is deleted
   */
  deleteAccount(id) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('deleteAccount');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/accounts/${id}`,
      method: 'DELETE',
      headers: {
        'auth-token': this._token
      },
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * CopyFactory provider strategy
   * @typedef {CopyFactoryStrategyUpdate} CopyFactoryStrategy
   * @property {String} _id unique strategy id
   * @property {Number} platformCommissionRate commission rate the platform charges for strategy copying, applied to
   * commissions charged by provider. This commission applies only to accounts not managed directly by provider. Should
   * be fraction of 1
   */

  /**
   * CopyFactory strategy commission scheme
   * @typedef {Object} CopyFactoryStrategyComissionScheme
   * @property {String} type commission type. One of flat-fee, lots-traded, lots-won, amount-traded, amount-won,
   * high-water-mark
   * @property {String} billingPeriod billing period. One of week, month, quater
   * @property {Number} commissionRate commission rate. Should be greater than or equal to zero if commission type is
   * flat-fee, lots-traded or lots-won, should be greater than or equal to zero and less than or equal to 1 if
   * commission type is amount-traded, amount-won, high-water-mark.
   */

  /**
   * CopyFactory strategy magic filter
   * @typedef {Object} CopyFactoryStrategyMagicFilter
   * @property {Array<String>} included list of magics (expert ids) or magic ranges copied. Leave the value empty to
   * copy all magics
   * @property {Array<String>} excluded list of magics (expert ids) or magic ranges excluded from copying. Leave the
   * value empty to copy all magics
   */

  /**
   * CopyFactory strategy time settings
   * @typedef {Object} CopyFactoryStrategyTimeSettings
   * @property {Number} [lifetimeInHours] optional position lifetime. Default is to keep positions open up to 90 days
   * @property {Number} [openingIntervalInMinutes] optional time interval to copy new positions. Default is to let 1
   * minute for the position to get copied. If position were not copied during this time, the copying will not be
   * retried anymore.
   */

  /**
   * Retrieves CopyFactory copy trading strategies. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/get_users_current_configuration_strategies
   * @return {Promise<CopyFactoryStrategy>} promise resolving with CopyFactory strategies found
   */
  getStrategies() {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('getStrategies');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/strategies`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * CopyFactory strategy update
   * @typedef {Object} CopyFactoryStrategyUpdate
   * @property {String} name strategy human-readable name
   * @property {String} description longer strategy human-readable description
   * @property {String} positionLifecycle position detection mode. Allowed values are netting (single position per
   * strategy per symbol), hedging (multiple positions per strategy per symbol)
   * @property {String} connectionId id of the MetaApi account providing the strategy
   * @property {Boolean} [skipPendingOrders] optional flag indicating that pending orders should not be copied.
   * Default is to copy pending orders
   * @property {CopyFactoryStrategyComissionScheme} [commissionScheme] commission scheme allowed by this strategy
   * @property {Number} platformCommissionRate commission rate the platform charges for strategy copying, applied to
   * commissions charged by provider. This commission applies only to accounts not managed directly by provider. Should
   * be fraction of 1
   * @property {Number} [maxTradeRisk] optional max risk per trade, expressed as a fraction of 1. If trade has a SL, the
   * trade size will be adjusted to match the risk limit. If not, the trade SL will be applied according to the risk
   * limit
   * @property {String} [reduceCorrelations] optional setting indicating whether to enable automatic trade correlation
   * reduction. Possible settings are not specified (disable correlation risk restrictions), by-strategy (limit
   * correlations on strategy level) or by-symbol (limit correlations on symbol level)
   * @property {CopyFactoryStrategyStopOut} [stopOutRisk] optional stop out setting. All trading will be terminated and
   * positions closed once equity drawdown reaches this value
   * @property {CopyFactoryStrategySymbolFilter} [symbolFilter] symbol filters which can be used to copy only specific
   * symbols or exclude some symbols from copying
   * @property {CopyFactoryStrategyNewsFilter} [newsFilter] news risk filter configuration
   * @property {Array<CopyFactoryStrategyRiskLimit>} [riskLimits] optional strategy risk limits. You can configure
   * trading to be stopped once total drawdown generated during specific period is exceeded. Can be specified either for
   * balance or equity drawdown
   * @property {CopyFactoryStrategyMaxStopLoss} [maxStopLoss] optional stop loss value restriction
   * @property {Number} [maxLeverage] optional max leverage risk restriction. All trades resulting in a leverage value
   * higher than specified will be skipped
   * @property {CopyFactoryStrategyMagicFilter} [magicFilter] optional magic (expert id) filter
   * @property {CopyFactoryStrategyTimeSettings} [timeSettings] settings to manage copying timeframe and position
   * lifetime. Default is to copy position within 1 minute from being opened at source and let the position to live for
   * up to 90 days
   */

  /**
   * Updates a CopyFactory strategy. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/put_users_current_configuration_strategies_strategyId
   * @param {String} id copy trading strategy id
   * @param {CopyFactoryStrategyUpdate} account trading strategy update
   * @return {Promise} promise resolving when strategy is updated
   */
  updateStrategy(id, strategy) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('updateStrategy');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/strategies/${id}`,
      method: 'PUT',
      headers: {
        'auth-token': this._token
      },
      body: strategy,
      json: true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Deletes a CopyFactory strategy. See
   * https://trading-api-v1.agiliumtrade.agiliumtrade.ai/swagger/#!/default/delete_users_current_configuration_strategies_strategyId
   * @param {String} id strategy id
   * @return {Promise} promise resolving when strategy is deleted
   */
  deleteStrategy(id) {
    if (this._isNotJwtToken()) {
      return this._handleNoAccessError('deleteStrategy');
    }
    const opts = {
      url: `${this._host}/users/current/configuration/strategies/${id}`,
      method: 'DELETE',
      headers: {
        'auth-token': this._token
      },
      json: true
    };
    return this._httpClient.request(opts);
  }

}
