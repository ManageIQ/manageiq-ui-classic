import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Alert } from 'patternfly-react';
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

const FlashMessages = ({ flashMessages, removeFlashMessage }) =>
  flashMessages.map(message =>
    <FlashMessage key={message.flashId} message={message} onDismiss={removeFlashMessage}/>);

const mapStateToProps = ({ usersReducer: { flashMessages } }) => ({
  flashMessages,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  removeFlashMessage,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(FlashMessages);