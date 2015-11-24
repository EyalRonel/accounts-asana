Package.describe({
  name: 'eyalronel:accounts-asana',
  version: '0.0.2',
  summary: 'Login service for Asana accounts (www.asana.com)',
  git: 'https://github.com/EyalRonel/accounts-asana',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('service-configuration', ['client', 'server']);
  api.use('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('accounts-ui', ['client']);
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

/* 
 * Tests are coming soon
Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('eyalronel:accounts-asana');
  api.addFiles('accounts-asana-tests.js');
});
*/