window.provisioningListenToRx = () => {
  listenToRx ( event => {
    if (event === undefined || event.type === undefined || event.actionType === undefined) {
      return;
    }
    const { type, actionType, payload: {action, item} } = event;
    if (type === 'GTL_CLICKED' && actionType === 'provisioning') {
      const url = `${action.url}${item.id}`;
      miqAjax(url);
      sendDataWithRx({item: item, type: 'gtlSetOneRowActive'});
      return;
    }
  })
}
