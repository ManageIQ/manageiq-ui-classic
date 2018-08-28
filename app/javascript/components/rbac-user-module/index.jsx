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
  }
  
  componentDidMount() {
    if (!this.props.rows) {
      this.props.requestUsers();
    }
  }
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

const mapStateToProps = ({ usersReducer }) => ({
    isLoaded: !!usersReducer && usersReducer.rows,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  requestUsers,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RbacModule);