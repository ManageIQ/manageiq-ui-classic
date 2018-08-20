import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as catalogActions from './catalogActions';

import reducer from './catalogReducer';
import { AnsibleCatalogItemForm } from './ansibleCatalogItemForm';

const actions = { ...catalogActions };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);
const mapStateToProps = state => ({
  ansibleCatalog: state.ansibleCatalog || {},
});
ManageIQ.redux.addReducer({ ansibleCatalog: reducer });
export default connect(mapStateToProps, mapDispatchToProps)(AnsibleCatalogItemForm);
