Template.configureLoginServiceDialogForAsana.helpers({
  absoluteUrl: function () {
    return Meteor.absoluteUrl();
  }
});

Template.configureLoginServiceDialogForAsana.fields = function () {
  return [
    {property: 'clientId', label: 'Client Id'},
    {property: 'clientSecret', label: 'Client Secret'},
    {property: 'redirectUri', label: 'Redirect URL'}
  ];
};