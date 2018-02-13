import { connect } from 'react-redux';
import { addSetTag, deleteSetTag, toggleTagCategoryChange, toggleTagValueChange } from '../actions';
import Tagging from '../components/tagging';

// container compo
const mapStateToProps = state => ({
  tags: state.tags,
  selectedTagCategory: state.selected.tagCategory,
  selectedTagValue: state.selected.tagValue,
  setTags: state.setTags,
});


const mapDispatchToProps = dispatch => ({
  onTagDeleteClick: (tag) => {
    dispatch(deleteSetTag(tag));
  },
  onTagCategoryChange: (cat) => {
    dispatch(toggleTagCategoryChange(cat));
  },
  onTagValueChange: (val) => {
    dispatch(toggleTagValueChange(val));
    dispatch(addSetTag(val));
  },
});

const TaggingConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Tagging);

export default TaggingConnected;
