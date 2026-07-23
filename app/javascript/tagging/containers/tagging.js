import { useDispatch, useSelector } from 'react-redux';
import {
  deleteAssignedTag,
  deleteAllAssignedTags,
  toggleTagCategoryChange,
  toggleTagValueChange,
  loadState,
  changeAssignedTags,
} from '../actions';
import Tagging from '../components/Tagging/Tagging';
import TaggingWithButtons from '../components/TaggingWithButtons/TaggingWithButtons';

const mapStateToProps = ({ tagging }) => ({
  tags: tagging.appState.tags,
  selectedTagCategory: tagging.appState.selected.tagCategory,
  assignedTags: tagging.appState.assignedTags,
});

function TaggingConnected(props) {
  const dispatch = useDispatch();
  const stateProps = useSelector(mapStateToProps);

  const dispatchProps = {
    onTagDeleteClick: (tag, options) => dispatch(deleteAssignedTag(tag, options)),
    onTagCategoryChange: (cat) => dispatch(toggleTagCategoryChange(cat)),
    onTagValueChange: (val, options) => {
      dispatch(toggleTagValueChange(val, options));
      dispatch(changeAssignedTags(val, options));
    },
    onSingleTagValueChange: (val, options) => {
      dispatch(deleteAllAssignedTags());
      dispatch(changeAssignedTags(val, options));
    },
    onLoadState: (state) => dispatch(loadState(state)),
  };

  return <Tagging {...stateProps} {...dispatchProps} {...props} />;
}

function TaggingWithButtonsConnected(props) {
  const dispatch = useDispatch();
  const stateProps = useSelector(mapStateToProps);

  const dispatchProps = {
    onTagDeleteClick: (tag, options) => dispatch(deleteAssignedTag(tag, options)),
    onTagCategoryChange: (cat) => dispatch(toggleTagCategoryChange(cat)),
    onTagValueChange: (val, options) => {
      dispatch(toggleTagValueChange(val, options));
      dispatch(changeAssignedTags(val, options));
    },
    onSingleTagValueChange: (val, options) => {
      dispatch(deleteAllAssignedTags());
      dispatch(changeAssignedTags(val, options));
    },
    onLoadState: (state) => dispatch(loadState(state)),
  };

  return <TaggingWithButtons {...stateProps} {...dispatchProps} {...props} />;
}

export { TaggingConnected, TaggingWithButtonsConnected };
