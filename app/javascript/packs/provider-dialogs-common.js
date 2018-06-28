function call_the_endpoint(buttonData) {
  return Promise.resolve({
    react: 'CreateAmazonSecurityGroupForm',
    props: {
      providerId: buttonData.ems_id,
    },
  });
}

window.listenToRx(function(buttonData) {
  if (!buttonData || buttonData.controller !== 'provider_dialogs') {
    return;
  }

  call_the_endpoint(buttonData)
    .then(function(response) {
      if (response.react) {
        reactModal(buttonData, response);
      } else if (response.dialog) {
        dialogModal(buttonData, response);
      } else {
        console.error('provider-dialogs: surprising response', buttonData, response);
      }
    });
});

function reactModal(buttonData, response) {
  // TODO
  console.log('TODO reactModal', arguments);
}

function dialogModal(buttonData, response) {
  // TODO
  console.log('TODO dialogModal', arguments);
}
