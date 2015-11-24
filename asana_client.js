Asana = {};

Meteor.loginWithAsana = function(options, callback) {
  // support a callback without options
  if (! callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
  Asana.requestCredential(options, credentialRequestCompleteCallback);
};

Asana.requestCredential = function (options, credentialRequestCompleteCallback) {
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }
  var credentialToken = Random.secret();
  var loginStyle = OAuth._loginStyle('asana', config, options);

  var loginUrl = 
    'https://app.asana.com/-/oauth_authorize' +
    '?client_id=' + config.clientId +
    '&response_type=code' +
    '&redirect_uri=' + config.redirectUri +
    '&state=' + OAuth._stateParam(loginStyle, credentialToken);
    '&scope=default';

  OAuth.launchLogin({
    loginService: "asana"
    ,loginStyle: loginStyle
    ,loginUrl: loginUrl
    ,credentialRequestCompleteCallback: credentialRequestCompleteCallback
    ,credentialToken: credentialToken
  });
};

