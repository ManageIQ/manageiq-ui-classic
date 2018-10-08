import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spinner, Grid, Row, Col } from 'patternfly-react';
import { ConnectedRouter } from 'connected-react-router';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { requestUsers, navigate, deleteMultipleusers, deleteUser } from './redux/actions';
import usersReducer from './redux/users-reducer';
import RbacUsersList from './components/users-list';
import UserDetail from './components/user-detail';
import UserAdd from './components/user-add';
import FlashMessages from './components/flash-messages';
import TagAssignment from './components/tagg-assignment';
import CustomEventsTable from './components/custom-events-table';
import { listenToRx } from '../../miq_observable';
import {
  RBAC_USER_EDIT,
  RBAC_USER_COPY,
  RBAC_USER_TAGS,
  RBAC_USER_DELETE,
  RBAC_USER_LIST_ADD,
  RBAC_USER_LIST_EDIT,
  RBAC_USER_LIST_COPY,
  RBAC_USER_LIST_TAGS,
  RBAC_USER_LIST_DELETE,
} from './rx-routing';
import historyReducer from '../../miq-redux/history-reducer';

class RbacModule extends Component {
  constructor(props) {
    super(props);
    ManageIQ.redux.addReducer({ usersReducer, historyReducer });
    ManageIQ.redux.registerController({ controller: 'configurationRbac' });
    this.historyUnlisten = ManageIQ.redux.history.listen(({ pathname }, action) => {
      if (pathname === '/add' || pathname === '/add/copy' || pathname === '/assign-company-tags' || pathname.match(/^\/edit\/[0-9]+$/)) {
        // hide toolbar when adding or editing
        sendDataWithRx({ redrawToolbar: [null, null] });
        return;
      }
      const toolbarUrl = `/ops/update_toolbar?toolbar_name=user${pathname === '/' ? 's' : ''}_center_tb${pathname.match(/\/preview\/[0-9]+/)
        ? `&id=${pathname.replace(/^\D+/g, '')}`
        : ''}`;
      http.get(toolbarUrl).then(data => sendDataWithRx({ redrawToolbar: data.toolbar.filter(item => item !== null) }));
      const treeUrl = '/tree/ops_rbac?id=xx-u';
      if (pathname === '/' && action === 'POP') {
        http.get(treeUrl).then(() => this.sendTreeUpdate({ state: { selected: true } }));
      } else {
        http.get(treeUrl).then(users => users.map(user => ({
          ...user,
          state: { selected: user.key === `u-${pathname.replace(/^\D+/g, '')}` },
        }))).then(data => this.sendTreeUpdate({ nodes: [...data], state: { selected: false } }));
      }
    });
    this.rxSubscription = listenToRx(({ rbacRouting, treeInit }) => {
      if (rbacRouting) this.chooseRoute(rbacRouting.type)();
      if (treeInit && treeInit.tree === 'rbac_tree') {
        if (ManageIQ.redux.history.location.pathname === '/' && treeInit.selected.match(/^u-[0-9]+$/)) {
          this.props.navigate(`/preview/${treeInit.selected.split('-').pop()}`);
        }
      }
    });
  }

  componentDidMount() {
    this.props.requestUsers();
    const treeUrl = '/tree/ops_rbac?id=xx-u';
    http.get(treeUrl).then(users => users.map(user => ({
      ...user,
      state: { selected: user.key === `u-${this.props.pathname.replace(/^\D+/g, '')}` },
    }))).then((data) => {
      setTimeout(this.sendTreeUpdate({ nodes: [...data], state: { selected: this.props.pathname === '/' } }), 2000);
    }); // have to w8 for the tree to initialize first...

    const toolbarUrl = `/ops/update_toolbar?toolbar_name=user${this.props.pathname === '/' ? 's' : ''}_center_tb${this.props.pathname.match(/\/preview\/[0-9]+/)
      ? `&id=${this.props.pathname.replace(/^\D+/g, '')}`
      : ''}`;
    http.get(toolbarUrl).then(data => sendDataWithRx({ redrawToolbar: data.toolbar.filter(item => item !== null) }));

    if (this.props.lastAction) {
      this.props.navigate(this.props.lastAction);
    }
  }

  componentWillUnmount() {
    this.historyUnlisten();
    this.rxSubscription.unsubscribe();
  }

  chooseRoute = (type = 'default') => ({
    [RBAC_USER_EDIT]: () => this.props.navigate(`/edit/${this.props.editUserId}`),
    [RBAC_USER_COPY]: () => this.props.navigate('/add/copy'),
    [RBAC_USER_TAGS]: () => this.props.navigate('/assign-company-tags'),
    [RBAC_USER_DELETE]: () => this.props.deleteUser(this.props.editUserId),
    [RBAC_USER_LIST_ADD]: () => this.props.navigate('/add'),
    [RBAC_USER_LIST_EDIT]: () => this.props.navigate(`/edit/${this.props.editUserId}`),
    [RBAC_USER_LIST_COPY]: () => this.props.navigate('/add/copy'),
    [RBAC_USER_LIST_TAGS]: () => this.props.navigate('/assign-company-tags'),
    [RBAC_USER_LIST_DELETE]: () => this.props.deleteMultipleusers(this.props.selectedUsers),
    default: () => {},
  })[type];

  sendTreeUpdate = data =>
    sendDataWithRx({
      updateTreeNode: {
        tree: 'rbac_tree',
        key: 'xx-u',
        data,
      },
    });

  render() {
    if (!this.props.isLoaded) return <div><Spinner loading size="lg" /></div>;
    return (
      <Grid fluid>
        <Row>
          <Col xs={12}>
            <FlashMessages />
          </Col>
          <Col xs={12}>
            <ConnectedRouter history={ManageIQ.redux.history}>
              <div>
                <Route exact path="/" component={RbacUsersList} />
                <Route exact path="/preview/:userId" component={UserDetail} />
                <Route path="/preview/:userId/custom-button-events" component={CustomEventsTable} />
                <Route path="/add/:copy?" component={UserAdd} />
                <Route path="/edit/:userId" component={UserAdd} />
                <Route path="/assign-company-tags" component={TagAssignment} />
              </div>
            </ConnectedRouter>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const mapStateToProps = ({ historyReducer, usersReducer, router: { location: { pathname } } }) => ({
  isLoaded: !!usersReducer && !!usersReducer.rows,
  selectedUsers: !!usersReducer && usersReducer.selectedUsers,
  editUserId: !!usersReducer && usersReducer.selectedUsers && usersReducer.selectedUsers.length > 0
    ? usersReducer.selectedUsers[0].id
    : undefined,
  pathname,
  lastAction: pathname === '/' && historyReducer && historyReducer.configurationRbac,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  requestUsers,
  navigate,
  deleteMultipleusers,
  deleteUser,
}, dispatch);

RbacModule.propTypes = {
  requestUsers: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  editUserId: PropTypes.string,
  deleteUser: PropTypes.func.isRequired,
  deleteMultipleusers: PropTypes.func.isRequired,
  selectedUsers: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.bool]),
  isLoaded: PropTypes.bool.isRequired,
  lastAction: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

RbacModule.defaultProps = {
  editUserId: undefined,
  selectedUsers: false,
  lastAction: undefined,
};

export default connect(mapStateToProps, mapDispatchToProps)(RbacModule);
