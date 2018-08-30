import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { goBack } from 'connected-react-router';
import { Spinner } from 'patternfly-react';
import { RbacAssignCompanyTags } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadTagsCategories, createFlashMessage } from '../redux/actions';
import { http } from '../../../http_api';

const categoryEntryEndpoint = categoryId => `/ops/get_category_entries?cat_id=${categoryId}`;

class TagAssignment extends Component {
  componentDidMount() {
    if (!this.props.categories) this.props.loadTagsCategories()
  }

  handleCancelClicked = () => {
    const { goBack, createFlashMessage } = this.props;
    createFlashMessage(__('Tag Edit was cancelled by the user'), 'info');
    goBack();
  };

  handleLoadMultipleEntries = categories =>
    http.get(`/ops/get_category_entries_multi?ids[]=${categories.join('&ids[]=')}`);

  render() {
    const { categories, selectedUsers, columns } = this.props;
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
          handleCancel={this.handleCancelClicked}
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
  createFlashMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TagAssignment);