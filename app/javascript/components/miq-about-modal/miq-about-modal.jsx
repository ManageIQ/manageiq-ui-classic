/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, ModalBody, Button } from 'carbon-components-react';
import ModalItem from './modal-item';

const SHOW_ABOUT_MODAL = '@@aboutModal/show';
const HIDE_ABOUT_MODAL = '@@aboutModal/hide';
const LOAD_ABOUT_MODAL = '@@aboutModal/load';

const showModal = () => (dispatch, getState) => {
  if (getState().AboutModal && getState().AboutModal.data) {
    // If the modal has been already rendered, do not request its data twice
    return dispatch({ type: SHOW_ABOUT_MODAL });
  }

  // Request the modal data from the API
  return API.get('/api').then((root) =>
    API.get(root.server_info.region_href).then((region) =>
      API.get(root.server_info.zone_href).then((zone) => ({ ...root, region, zone })).then((data) =>
        dispatch({ type: LOAD_ABOUT_MODAL, data })).then(() =>
        dispatch({ type: SHOW_ABOUT_MODAL }))));
};

const hideModal = () => ({ type: HIDE_ABOUT_MODAL });

ManageIQ.redux.addReducer({
  AboutModal: function AboutModalReducer(state = { show: false }, action) {
    switch (action.type) {
      case SHOW_ABOUT_MODAL:
        return { ...state, show: true };
      case HIDE_ABOUT_MODAL:
        return { ...state, show: false };
      case LOAD_ABOUT_MODAL:
        return { ...state, data: action.data };
      default:
        return state;
    }
  },
});

class MiqAboutModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expand: false };
  }

  componentDidMount() {
    const { showModal } = this.props;
    this.subscribe = window.listenToRx((event) => {
      if (event.type === 'showAboutModal') {
        showModal();
      }
    });
  }

  componentWillUnmount() {
    this.subscribe.unsubscribe();
  }

  render() {
    const {
      data, hideModal,
    } = this.props;
    const { show } = this.props;
    const { expand } = this.state;
    if (!data) {
      return null;
    }

    const browser = window.miqBrowserDetect();
    const plugins = Object.keys(data.server_info.plugins).map((key) => {
      const val = data.server_info.plugins[key];
      return (
        <ModalItem key={key} label={val.display_name} value={val.version} />
      );
    });

    return (
      <Modal
        aria-label="About Modal"
        modalHeading={`${data.product_info.name_full} ${data.server_info.release}`}
        open={show}
        onRequestClose={() => { hideModal(); }}
        passiveModal
        className="about-modal"
      >
        <ModalBody className="about-modal-body">
          <ModalItem
            label={`${__('Version')}`}
            value={`${data.server_info.version}.${data.server_info.build}`}
          />
          <ModalItem
            label={`${__('Server Name')}`}
            value={data.server_info.appliance || ''}
          />
          <ModalItem
            label={`${__('Region')}`}
            value={data.region.region.toString()}
          />
          <ModalItem
            label={`${__('Zone')} `}
            value={data.zone.name || ''}
          />
          <ModalItem
            label={`${__('User Name')} `}
            value={data.identity.name}
          />
          <ModalItem
            label={`${__('User Role')} `}
            value={data.identity.role}
          />
          <ModalItem
            label={`${__('Browser')} `}
            value={browser.browser}
          />
          <ModalItem
            label={`${__('Browser Version')} `}
            value={browser.version.toString()}
          />
          <ModalItem
            label={`${__('Browser OS')} `}
            value={browser.OS}
          />
          <Button
            kind="ghost"
            className="plugins-button"
            onClick={(event) => {
              this.setState({ expand: !expand });
              event.preventDefault();
            }}
          >
            <strong>
              <i className={expand ? 'fa fa-angle-down' : 'fa fa-angle-right'} />
              Plugins
            </strong>
          </Button>
          <div className={expand ? 'about-visible-scrollbar' : 'hidden'}>
            {plugins}
          </div>
          <br />
          <br />
          <p className="ModalItem">
            {data.product_info.copyright}
          </p>
          <img src={data.product_info.branding_info.logo} alt="logo" className="logo" />
        </ModalBody>
      </Modal>
    );
  }
}

MiqAboutModal.propTypes = {
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

MiqAboutModal.defaultProps = {
  show: false,
  data: undefined,
};

const mapStateToProps = (state) =>
  (state.AboutModal ? { show: state.AboutModal.show, data: state.AboutModal.data } : {});
const mapDispatchToProps = (dispatch) => bindActionCreators({ showModal, hideModal }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(MiqAboutModal);
