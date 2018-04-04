import { connect } from 'react-redux';
import { changeAssignedTag, deleteAssignedTag, toggleTagCategoryChange, toggleTagValueChange, loadState, addAssignedTag } from '../actions';
import Tagging from '../components/tagging';
import TaggingWithButtons from '../components/taggingWithButtons';

// container compo
const mapStateToProps = state => ({
  tags: state.tagging.appState.tags,
  selectedTagCategory: state.tagging.appState.selected.tagCategory,
  selectedTagValue: state.tagging.appState.selected.tagValue,
  assignedTags: state.tagging.appState.assignedTags,
});


const mapDispatchToProps = dispatch => ({
  onTagDeleteClick: (tag) => {
    dispatch(deleteAssignedTag(tag));
  },
  onTagCategoryChange: (cat) => {
    dispatch(toggleTagCategoryChange(cat));
  },
  onTagValueChange: (val) => {
    dispatch(toggleTagValueChange(val));
    dispatch(changeAssignedTag(val));
  },

  onTagMultiValueChange: (val) => {
    dispatch(toggleTagValueChange(val));
    dispatch(addAssignedTag(val));
  },

  onLoadState: (state) => {
    console.log('ON LOAD STATE');
    dispatch(loadState(state));
  },
});

const TaggingConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Tagging);

const TaggingWithButtonsConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaggingWithButtons);

export { TaggingConnected, TaggingWithButtonsConnected };
