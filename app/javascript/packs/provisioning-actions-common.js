window.provisioningListenToRx = () => {
  listenToRx((event) => {
    if (!event || !event.payload || event.type !== 'GTL_CLICKED' || event.actionType !== 'provisioning') {
      return;
    }

    const { action, item } = event.payload;

    sendDataWithRx({ item, type: 'gtlSetOneRowActive' });
    miqAjax(`${action.url}${item.id}`);
  });
};
