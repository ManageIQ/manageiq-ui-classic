import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Alert } from 'patternfly-react';
import PropTypes from 'prop-types';
import { removeFlashMessage } from '../redux/actions';

class FlashMessage extends Component {
  componentDidMount() {
    const { message, onDismiss } = this.props;
    if (message.type !== 'error') {
      setTimeout(() => {
        onDismiss(message);
      }, 5000);
    }
  }
  render() {
    const { message: { text, type }, onDismiss } = this.props;
    return (
      <div className={type !== 'error' ? 'react-fading-flash' : ''}>
        <Alert type={type} onDismiss={() => onDismiss(this.props.message)}>
          {text}
        </Alert>
      </div>
    );
  }
}

FlashMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const FlashMessages = ({ flashMessages, removeFlashMessage }) =>
  flashMessages.map(message =>
    <FlashMessage key={message.flashId} message={message} onDismiss={removeFlashMessage} />);

const mapStateToProps = ({ usersReducer: { flashMessages } }) => ({
  flashMessages,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  removeFlashMessage,
}, dispatch);

FlashMessages.propTypes = {
  flashMessages: PropTypes.arrayOf(PropTypes.shape({
    flashId: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['success', 'info', 'warning', 'error']).isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
  removeFlashMessage: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(FlashMessages);
