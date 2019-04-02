import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner } from 'patternfly-react';
import { TaggingWithButtonsConnected, taggingApp } from '@manageiq/react-ui-components/dist/tagging';
import { http } from '../http_api';

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
    const { urls } = this.props;
    return (<TaggingWithButtonsConnected
      saveButton={{
        // don't replace $.post with http.post
          onClick: (assignedTags) => {
            $.post(urls.save_url, { data: JSON.stringify(assignedTags) });
          },
          href: '',
          type: 'button',
          disabled: false,
          description: 'Save',
        }
      }
      cancelButton={{
        // don't replace $.post with http.post
        onClick: () => { this.reset(); $.post(urls.cancel_url); },
        href: '',
        type: 'button',
        disabled: false,
        description: 'Cancel',
        }
      }
      resetButton={{
        onClick: () => this.reset(),
        href: '',
        type: 'button',
        disabled: false,
        description: 'Reset',
        }
      }
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
  }).isRequired,
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    })).isRequired,
    assignedTags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
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
});

const TaggingWrapperConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TaggingWrapper);

export default TaggingWrapperConnected;
