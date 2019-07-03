import { connect } from 'react-redux';
import {
  deleteAssignedTag, deleteAllAssignedTags, toggleTagCategoryChange,
  toggleTagValueChange, loadState, changeAssignedTags,
} from '../actions';
import Tagging from '../components/Tagging/Tagging';
import TaggingWithButtons from '../components/TaggingWithButtons/TaggingWithButtons';

// container compo
const mapStateToProps = ({ tagging }) => ({
  tags: tagging.appState.tags,
  selectedTagCategory: tagging.appState.selected.tagCategory,
  assignedTags: tagging.appState.assignedTags,
});


const mapDispatchToProps = dispatch => ({
  onTagDeleteClick: (tag, options) => {
    dispatch(deleteAssignedTag(tag, options));
  },
  onTagCategoryChange: (cat) => {
    dispatch(toggleTagCategoryChange(cat));
  },
  onTagValueChange: (val, options) => {
    dispatch(toggleTagValueChange(val, options));
    dispatch(changeAssignedTags(val));
  },
  onSingleTagValueChange: (val) => {
    dispatch(deleteAllAssignedTags());
    dispatch(changeAssignedTags(val));
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
