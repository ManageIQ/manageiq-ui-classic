import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { Spinner } from'patternfly-react';
import { ConnectedRouter } from 'connected-react-router';
import { Route } from 'react-router-dom';
import { requestUsers } from './redux/actions';
import usersReducer from './redux/users-reducer';
import RbacUsersList from './components/users-list';
import UserDetail from './components/user-detail';
import UserAdd from './components/user-add';
import TagAssignment from './components/tagg-assignment';

class RbacModule extends Component {
  constructor(props) {
    super(props);
    ManageIQ.redux.addReducer(combineReducers({ usersReducer }));
    this.historyUnlisten = ManageIQ.redux.history.listen(({ pathname }, action) => {
      const toolbarUrl = `/ops/update_toolbar?toolbar_name=user${pathname === '/' ? 's' : ''}_center_tb${pathname.match(/\/preview\/[0-9]+/)
        ? `&id=${pathname.replace(/^\D+/g, '')}`
        : ''}`;
      http.get(toolbarUrl).then(data => sendDataWithRx({ redrawToolbar: [data.toolbar] }));
      const treeUrl = '/tree/ops_rbac?id=xx-u';
      if (pathname === '/' && action === "POP") {
        http.get(treeUrl).then(() => this.sendTreeUpdate({ state: { selected: true } }));
      } else if (action === "POP") {
        http.get(treeUrl).then(users => users.map(user => ({
          ...user,
          state: { selected: user.key === `u-${pathname.replace(/^\D+/g, '')}` },
        }))).then(data => this.sendTreeUpdate({ nodes: [...data], state: { selected: false } }));
      }
    });
    window.magix = this;
  }
  
  componentDidMount() {
    if (!this.props.rows) {
      this.props.requestUsers();
    }
    const treeUrl = '/tree/ops_rbac?id=xx-u';
    http.get(treeUrl).then(users => users.map(user => ({
      ...user,
      state: { selected: user.key === `u-${this.props.pathname.replace(/^\D+/g, '')}` },
    }))).then(data => setTimeout( this.sendTreeUpdate({ nodes: [...data], state: { selected: this.props.pathname === '/' } }) , 2000)); // have to w8 for the tree to initialize first...
  }

  componentWillUnmount() {
    this.historyUnlisten();
  }

  sendTreeUpdate = (data) => 
    sendDataWithRx({
      updateTreeNode: {
        tree: 'rbac_tree',
        key: 'xx-u',
        data,
      },
    });

  render() {
    const {
      isLoaded
    } = this.props;
    if (!isLoaded) {
      return <div><Spinner loading size="lg" /></div>;
    }
    return (
      <div>
        <h1>Rbac module</h1>
        <ConnectedRouter history={ManageIQ.redux.history}>
          <div>
            <Route exact path="/" component={RbacUsersList} />
            <Route path="/preview/:userId" component={UserDetail} />
            <Route path="/add/:copy?" component={UserAdd} />
            <Route path="/edit/:userId" component={UserAdd} />
            <Route path="/assign-company-tags" component={TagAssignment} />
          </div>
        </ConnectedRouter>
        <hr />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer, router: { location: { pathname } } }) => ({
    isLoaded: !!usersReducer && !!usersReducer.rows,
    pathname,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  requestUsers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RbacModule);