import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Loading } from '@carbon/react';
import { TaggingWithButtonsConnected, TaggingConnected, taggingApp } from '../tagging';

const selectedTags = (state, tag) => {
  const selectedVal = Array.isArray(tag.tagValue) ? tag.tagValue.map((val) => val.id).flat() : [];
  return [state.tagging.appState.assignedTags.map((t) => t.values.map((val) => val.id)).flat(), selectedVal].flat();
};

const params = (type = 'default', state, tag = {}, selectedId) => ({
  provision: {
    id: 'new',
    ids_checked: selectedTags(state, tag),
    tree_typ: 'tags',
  },
  default: {
    id: state.tagging.appState.affectedItems[0] || 'new',
    cat: tag.tagCategory ? tag.tagCategory.id : undefined,
    val: selectedId,
    check: 1,
    tree_typ: 'tags',
  },
})[type];

// eslint-disable-next-line camelcase
const onDelete = (type = 'default', params = [], deleted_element) => ({
  // eslint-disable-next-line camelcase
  provision: () => ({ ...params, check: 0, ids_checked: params.ids_checked.filter((element) => element !== deleted_element) }),
  default: () => ({ ...params, check: '0' }),
})[type];

function TaggingWrapperConnected({
  tags, urls, options, isDisabled,
}) {
  const dispatch = useDispatch();
  const tagging = useSelector((state) => state.tagging);
  const isLoaded = !!tagging;

  useEffect(() => {
    ManageIQ.redux.addReducer({ tagging: taggingApp });
    dispatch({ initialState: tags, type: 'UI-COMPONENTS_TAGGING_LOAD_STATE' });

    return () => {
      dispatch({ type: 'UI-COMPONENTS_TAGGING_RESET_STATE' });
    };
  }, []);

  const reset = () => dispatch({ type: 'UI-COMPONENTS_TAGGING_RESET_STATE' });

  if (!isLoaded) {
    return (
      <div className="loadingSpinner">
        <Loading active small withOverlay={false} className="loading" />
      </div>
    );
  }

  // eslint-disable-next-line no-mixed-operators
  return (options && options.hideButtons && <TaggingConnected options={{ ...options, params, onDelete }} /> || (
    <TaggingWithButtonsConnected
      saveButton={{
        // FIXME: jQuery is necessary here as it communicates with the old world
        // don't replace $.post with http.post
        onClick: (assignedTags) => {
          $.post(urls.save_url, { data: JSON.stringify(assignedTags) });
        },
        href: '',
        type: 'button',
        disabled: _.isEqual({ ...tagging.initialState, selected: undefined }, { ...tagging.appState, selected: undefined }),
        description: __('Save'),
      }}
      cancelButton={{
        // FIXME: jQuery is necessary here as it communicates with the old world
        // don't replace $.post with http.post
        onClick: () => { reset(); $.post(urls.cancel_url); },
        href: '',
        type: 'button',
        disabled: false,
        description: __('Cancel'),
      }}
      resetButton={{
        onClick: () => reset(),
        href: '',
        type: 'button',
        disabled: _.isEqual({ ...tagging.initialState, selected: undefined }, { ...tagging.appState, selected: undefined }),
        description: __('Reset'),
      }}
      options={{
        ...options, params, onDelete, isDisabled,
      }}
    />
  ));
}

TaggingWrapperConnected.propTypes = {
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    })).isRequired,
    assignedTags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    })).isRequired,
    affectedItems: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  urls: PropTypes.shape({
    cancel_url: PropTypes.string.isRequired,
    save_url: PropTypes.string.isRequired,
  }),
  options: PropTypes.objectOf(PropTypes.any),
  isDisabled: PropTypes.bool,
};

export default TaggingWrapperConnected;
