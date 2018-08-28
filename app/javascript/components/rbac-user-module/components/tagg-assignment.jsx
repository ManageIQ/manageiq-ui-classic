import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { goBack } from 'connected-react-router';
import { Spinner } from 'patternfly-react';
import { RbacAssignCompanyTags } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadTagsCategories } from '../redux/actions';
import { http } from '../../../http_api';

const categoryEntryEndpoint = categoryId => `/ops/get_category_entries?cat_id=${categoryId}`;

class TagAssignment extends Component {
  componentDidMount() {
    if (!this.props.categories) this.props.loadTagsCategories()
  }

  handleLoadMultipleEntries = categories =>
    http.get(`/ops/get_category_entries_multi?ids[]=${categories.join('&ids[]=')}`);

  render() {
    const { categories, goBack, selectedUsers, columns } = this.props;
    if (!selectedUsers) return <Redirect to="/" />;
    if (!categories) return <div><Spinner loading size="lg" /></div>;
    return (
      <div>
        <RbacAssignCompanyTags
          categories={categories}
          users={selectedUsers.map(user => ({ ...user, selected: false }))}
          columns={columns}
          loadCategoryEntry={categoryId => http.get(categoryEntryEndpoint(categoryId))}
          loadMultipleEntries={this.handleLoadMultipleEntries}
          handleCancel={goBack}
          handleSave={(selection, initial, users) => console.log('tagsSave: ', { selection, initial, users })}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ usersReducer: { categories, selectedUsers, columns } }) => ({
  categories,
  selectedUsers,
  columns,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  loadTagsCategories,
  goBack,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TagAssignment);