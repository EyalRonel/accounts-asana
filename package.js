Package.describe({
  name: 'eyalronel:accounts-asana',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Login service for Asana accounts (www.asana.com)',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('service-configuration', ['client', 'server']);
  api.use('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['client', 'server']);
  api.use('random', 'client');
  api.use('templating', 'client');
  
  api.add_files(['asana_login_buttons.css', 'asana_configure.html', 'asana_configure.js'],'client');
  
  api.add_files('asana_common.js', ['client', 'server']);
  api.add_files('asana_server.js', 'server');
  api.add_files('asana_client.js', 'client');
  
});

Npm.depends({
  "asana": "0.13.0"
});


//Package.onTest(function(api) {
//  api.use('ecmascript');
//  api.use('tinytest');
//  api.use('eyalronel:accounts-asana');
//  api.addFiles('accounts-asana-tests.js');
//});