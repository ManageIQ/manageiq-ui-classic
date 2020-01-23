ManageIQ.toolbars = {};

ManageIQ.toolbars.applyChanges = function(changes) {
  sendDataWithRx({batchUpdate: changes});
};
