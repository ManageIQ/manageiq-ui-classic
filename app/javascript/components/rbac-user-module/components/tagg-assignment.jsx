import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { goBack } from 'connected-react-router';
import { Spinner } from 'patternfly-react';
import { RbacAssignCompanyTags } from '@manageiq/react-ui-components/dist/rbac-forms';
import { loadTagsCategories, createFlashMessage, editUserTags, selectUsers } from '../redux/actions';
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

  handleSaveTags = (selectedTags, initialTags, users) => {
    let deletedCatgeoryKeys = Object.keys(initialTags).filter(tagKey => !selectedTags[tagKey]);
    const unAssignedTags = deletedCatgeoryKeys.map(categoryKey => {
      const [ name, category ] = initialTags[categoryKey].name.split('/').reverse();
      return { category, name }
    });
    const assignedTags = Object.keys(selectedTags).map(categoryKey => {
      const [ name, category ] = selectedTags[categoryKey].name.split('/').reverse();
      return { category, name }
    });

    const unAssignPayload = {
      action: 'unassign_tags',
      resources: users.map(({ href }) => ({ href, tags: unAssignedTags })),
    }
    const assignPayload = {
      action: 'assign_tags',
      resources: users.map(({ href }) => ({ href, tags: assignedTags })),
    }
    this.props.editUserTags(unAssignPayload, assignPayload);
  }

  render() {
    const { categories, selectedUsers, columns } = this.props;
    if (!selectedUsers) return <Redirect to="/" />;
    if (!categories) return <div><Spinner loading size="lg" /></div>;
    return (
      <RbacAssignCompanyTags
        categories={categories}
        users={selectedUsers.map(user => ({ ...user, selected: false, current_group: user.current_group.label, role: user.role.label }))}
        columns={columns}
        loadCategoryEntry={categoryId => http.get(categoryEntryEndpoint(categoryId))}
        loadMultipleEntries={this.handleLoadMultipleEntries}
        handleCancel={this.handleCancelClicked}
        handleSave={this.handleSaveTags}
      />
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
  editUserTags,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TagAssignment);