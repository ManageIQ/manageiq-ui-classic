import { connect } from 'react-redux';
import { changeAssignedTag, deleteAssignedTag, toggleTagCategoryChange, toggleTagValueChange, loadState, addAssignedTag } from '../actions';
import Tagging from '../components/tagging';
import TaggingWithButtons from '../components/taggingWithButtons';

// container compo
const mapStateToProps = ({ tagging }) => ({
  tags: tagging.appState.tags,
  selectedTagCategory: tagging.appState.selected.tagCategory,
  selectedTagValue: tagging.appState.selected.tagValue,
  assignedTags: tagging.appState.assignedTags,
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
