//asanaSDK = Meteor.npmRequire('asana');
asanaSDK = Npm.require('asana');
Meteor.users.allow({
  update: function (userId, doc, fields, modifier) { 
    return true; 
  }
});
Asana = {
  createClient:function(){
     var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
     if (!config) {throw new ServiceConfiguration.ConfigError();}
     var asanaClient =  asanaSDK.Client.create({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri
       });
    return asanaClient;
  }
};

Meteor.loginWithAsana = function(options, callback) {
  // support a callback without options
  if (! callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
  Asana.requestCredential(options, credentialRequestCompleteCallback);
};


//Triggers once the user returns from 3rd party provider
//The query argument cotains a "code" field with the access code that we will now convert into a token
Oauth.registerService('asana', 2, null, function(query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'asana'});
  if (!config) throw new ServiceConfiguration.ConfigError();
  var response = getTokenResponse(query);
//  var userDetails = getAsanaUserDetails(response.access_token,response.refresh_token);
  return {
    serviceData: {
      id: response.data.id,
      email: response.data.email,
      accessToken: response.access_token,
      refreshToken: response.refresh_token
    },
    options: {
      profile: { 
        name: response.data.name
      },
      emails:response.data.email
    }
  };
});

//If a user was created by loggin in with Asana, retrive some additional information from the Asana API and update their profile
Accounts.onCreateUser(function(options, user) {
  if (!user.services.hasOwnProperty('asana')) return user;
  if (options.profile) user.profile = options.profile;
  var accessToken = user.services.asana.accessToken;
  var asanaClient = Asana.createClient().useOauth({credentials:accessToken});
  asanaClient.users.me()
    .then(Meteor.bindEnvironment(function(response){
        options.profile.img = response.photo.image_128x128;
        options.profile.workspaces =  response.workspaces;
      Meteor.users.update(user._id, {$set: {"profile": options.profile}});
    }))
    .catch(function(error){
      console.log('error',error);
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



