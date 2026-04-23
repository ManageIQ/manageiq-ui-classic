/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, ModalBody, Button } from 'carbon-components-react';
import DOMPurify from 'dompurify';

const SHOW_ERROR_MODAL = '@@errorModal/show';
const HIDE_ERROR_MODAL = '@@errorModal/hide';
const LOAD_ERROR_MODAL = '@@errorModal/load';

const showModal = () => (dispatch, getState) => {
  if (getState().ErrorModal && getState().ErrorModal.error) {
    // If the modal has been already rendered, do not request its data twice
    return dispatch({ type: SHOW_ERROR_MODAL });
  }

  // Request the modal data from the API
  //   return API.get('/api').then((root) =>
  //     API.get(root.server_info.region_href).then((region) =>
  //       API.get(root.server_info.zone_href).then((zone) => ({ ...root, region, zone })).then((data) =>
  //         dispatch({ type: LOAD_ERROR_MODAL, data })).then(() =>
  //         dispatch({ type: SHOW_ERROR_MODAL }))));
};

const hideModal = () => ({ type: HIDE_ERROR_MODAL });

ManageIQ.redux.addReducer({
  ErrorModal: function ErrorModalReducer(state = { show: false }, action) {
    switch (action.type) {
      case SHOW_ERROR_MODAL:
        return { ...state, show: true };
      case HIDE_ERROR_MODAL:
        return { ...state, show: false };
      case LOAD_ERROR_MODAL:
        return { ...state, error: action.data };
      default:
        return state;
    }
  },
});

class MiqErrorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: '' };
    console.log(props);
  }

  componentDidMount() {
    const { showModal } = this.props;
    // this.subscribe = window.listenToRx((event) => {
    //   if (event.type === 'showErrorModal') {
    //     showModal();
    //   }
    // });

    this.subscribe = window.listenToRx((event) => {
      if ('serverError' in event) {
        console.log(event);
        this.setState({ error: event.serverError, source: event.source, backendName: event.backendName });
        showModal();
      }
    });
  }

  componentWillUnmount() {
    this.subscribe.unsubscribe();
  }

  render() {
    // const {
    //   data, dialogClassName, hideModal,
    // } = this.props;
    // const { show } = this.props;
    // const { expand } = this.state;
    // let className = 'about-modal';
    // if (dialogClassName === 'whitelabel') {
    //   className = dialogClassName;
    // }
    // if (!data) {
    //   return null;
    // }

    console.log(this.state);
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.state.error.data) }} />
      </div>
    );
  }
}

MiqErrorModal.propTypes = {
  dialogClassName: PropTypes.string,
  show: PropTypes.bool,
  data: PropTypes.shape({
    product_info: PropTypes.shape({
      name_full: PropTypes.string,
      copyright: PropTypes.string,
      branding_info: PropTypes.shape({
        logo: PropTypes.string,
      }),
    }),
    server_info: PropTypes.shape({
      release: PropTypes.string,
    }),
  }),
  hideModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};

MiqErrorModal.defaultProps = {
  dialogClassName: '',
  show: false,
  data: undefined,
};

const mapStateToProps = (state) =>
  (state.ErrorModal ? { show: state.ErrorModal.show, error: state.ErrorModal.error } : {});
const mapDispatchToProps = (dispatch) => bindActionCreators({ showModal, hideModal }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(MiqErrorModal);
