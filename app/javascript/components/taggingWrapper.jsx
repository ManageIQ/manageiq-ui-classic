import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from 'patternfly-react';
import { TaggingWithButtonsConnected, TaggingConnected, taggingApp } from '@manageiq/react-ui-components/dist/tagging';
import { http } from '../http_api';

const params = (type = 'default', state, tag = {}) => ({
  provision: {
    id: "new",
    ids_checked: [state.tagging.appState.assignedTags.map(t => t.values.map(val => val.id)).flat(), tag.tagValue.id].flat(),
    tree_typ: 'tags'
  },
  default: {
    id: state.tagging.appState.affectedItems[0] || "new",
    cat: tag.tagCategory.id,
    val: tag.tagValue.id,
    check: 1,
    tree_typ: 'tags'
  }
})[type]

const onDelete = (type = 'default', params = [], deleted_element) => ({
  provision: {...params, check: 0, ids_checked: params.ids_checked.filter(element => element !== deleted_element), deleted: deleted_element },
  default: params,
})[type]

class TaggingWrapper extends React.Component {
  constructor(props) {
    super(props);
    ManageIQ.redux.addReducer({tagging: taggingApp});
  }

  componentDidMount() {
    this.loadState(this.props.tags);
  }

  loadState = state => this.props.loadState(state);
  reset = () => this.props.reset();
  isLoaded = () => this.props.isLoaded();

  render() {
    if (!this.props.isLoaded) return <Spinner loading size="lg" />;
    const { urls, options, tagging } = this.props;
    return (options && options.hideButtons && <TaggingConnected options={{...options, params, onDelete }}/> || <TaggingWithButtonsConnected
      saveButton={{
          // FIXME: jQuery is necessary here as it communicates with the old world
          // don't replace $.post with http.post
          onClick: (assignedTags) => {
            $.post(urls.save_url, { data: JSON.stringify(assignedTags) });
          },
          href: '',
          type: 'button',
          disabled: _.isEqual({...tagging.initialState, selected: undefined}, {...tagging.appState, selected: undefined}),
          description: __('Save'),
        }
      }
      cancelButton={{
        // FIXME: jQuery is necessary here as it communicates with the old world
        // don't replace $.post with http.post
        onClick: () => { this.reset(); $.post(urls.cancel_url); },
        href: '',
        type: 'button',
        disabled: false,
        description: __('Cancel'),
        }
      }
      resetButton={{
        onClick: () => this.reset(),
        href: '',
        type: 'button',
        disabled: _.isEqual({...tagging.initialState, selected: undefined}, {...tagging.appState, selected: undefined}),
        description: __('Reset'),
        }
      }
      options={{...options, params, onDelete }}
    />);
  }
}

TaggingWrapper.propTypes = {
  reset: PropTypes.func.isRequired,
  loadState: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  urls: PropTypes.shape({
    cancel_url: PropTypes.string.isRequired,
    save_url: PropTypes.string.isRequired,
  }),
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      description: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        description: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    })).isRequired,
    assignedTags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      description: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        description: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    })).isRequired,
    affectedItems: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  loadState: state => dispatch({ initialState: state, type: 'UI-COMPONENTS_TAGGING_LOAD_STATE' }),
  reset: () => dispatch({ type: 'UI-COMPONENTS_TAGGING_RESET_STATE' }),
});

const mapStateToProps = ({ tagging }) => ({
  isLoaded: !!tagging,
  tagging: tagging
});

const TaggingWrapperConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaggingWrapper);

export default TaggingWrapperConnected;
