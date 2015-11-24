//Include the Asana SDK (available on server side only)
asanaSDK = Npm.require('asana');

//Declare a Server Side loginWithAsana Method
//This is function is called as part of the OAuth follow implemented in Meteor
Meteor.loginWithAsana = function(options, callback) {
  if (! callback && typeof options === "function") {
    callback = options;
    options = null;
  }
  var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
  Asana.requestCredential(options, credentialRequestCompleteCallback);
};


//Triggers once the user returns from Asana
//query argument cotains a "code" field with an access code that we will now convert into a token.
//the returned value will be added to the created user records under Meteor.users
Oauth.registerService('asana', 2, null, function(query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
  if (!config) throw new ServiceConfiguration.ConfigError();
  var response = getTokenResponse(query);
  return {
    serviceData: {
      id: response.data.id,
      email: response.data.email,
      accessToken: response.access_token,
      refreshToken: response.refresh_token
    },
    options: {
      profile: { 
        name: response.data.name,
        asana:{}
      },
      emails:response.data.email      
    }
  };
});


//Bind into the onCreateUser method, this is trigger once a new user is created in the system.
//If the user has the asana service, we query Asana for /user/me endpoint using Asana's JS SDK, and append the returned information into their "profile" fields
//This information will later be available client side by the return value of "Meteor.user();"
Accounts.onCreateUser(function(options, user) {
  if (!user.services.hasOwnProperty('asana')) return user;
  if (options.profile) user.profile = options.profile;
  var accessToken = user.services.asana.accessToken;
  var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
  if (!config) {throw new ServiceConfiguration.ConfigError();}
  var asanaClient =  asanaSDK.Client.create({clientId: config.clientId,clientSecret: config.clientSecret,redirectUri: config.redirectUri}).useOauth({credentials:accessToken});
  asanaClient.users.me()
    .then(Meteor.bindEnvironment(function(response){
      var currenAsanaUserDetails = {
        photo:response.photo,
        workspaces: response.workspaces
      };
      Meteor.users.update(user._id, {$set: {"profile.asana": currenAsanaUserDetails}});
    }))
    .catch(function(error){
      throw _.extend(new Error("Failed to retrieve user"));
    });
  return user;
});

var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
  if (!config) {throw new ServiceConfiguration.ConfigError();}
  var response;
  try {
    response = HTTP.post(
      "https://app.asana.com/-/oauth_token", {
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        }
      });
      if (!response.hasOwnProperty('statusCode') || (response.hasOwnProperty('statusCode') && response.statusCode != 200)){
        throw response.content;
      } 
    } catch(error){
      throw _.extend(new Error("Failed to complete OAuth handshake with Asana."));
    }
    return JSON.parse(response.content);
};



