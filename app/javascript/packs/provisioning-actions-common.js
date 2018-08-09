window.provisioningListenToRx = () => {
  listenToRx ( event => {
    if (event === undefined || event.type === undefined || event.actionType === undefined) {
      console.log('return');
      return;
    }
    const { type, actionType, payload: {action, item} } = event;
    if (type === 'GTL_CLICKED' && actionType === 'provisioning') {
      const url = `${action.url}${item.id}`;
      console.log(url);
      miqAjax(url);
      sendDataWithRx(event);
      return;
    }
  })
}
