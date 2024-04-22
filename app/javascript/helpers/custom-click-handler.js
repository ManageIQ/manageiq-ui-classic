/** Function to handle the click events by redirecting the actions to js functions. */
const customJsAction = ({ action }) => {
  switch (action.name) {
    case 'miqTreeActivateNode':
      if (action.nodeTree && action.nodeKey) {
        window.miqTreeActivateNode(action.nodeTree, action.nodeKey);
      }
      break;
    case 'miqOnClickSelectRbacTreeNode':
      if (action.treeId) {
        window.miqOnClickSelectRbacTreeNode(action.treeId);
      }
      break;
    case 'miqQueueReport':
      if (action.id) {
        miqQueueReport(action.id);
      }
      break;
    default:
      console.warn(`Unrecognized action name: ${action.name}`);
  }
};

/** Function to handle onclick events generated from remote_functions. */
export const customOnClickHandler = (option) => {
  if (option.remote) {
    if (option.url) {
      window.miqJqueryRequest(option.url, { beforeSend: true, complete: true }); // GET requests.
    } else if (option.action) {
      customJsAction(option);
    }
  } else {
    document.location.href = option.url;
  }
};
