import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AboutModal } from 'patternfly-react';

const SHOW_ABOUT_MODAL = '@@aboutModal/show';
const HIDE_ABOUT_MODAL = '@@aboutModal/hide';
const LOAD_ABOUT_MODAL = '@@aboutModal/load';

const showModal = () => (dispatch, getState) => {
  if (getState().AboutModal && getState().AboutModal.data) {
    // If the modal has been already rendered, do not request its data twice
    return dispatch({ type: SHOW_ABOUT_MODAL });
  }

  // Request the modal data from the API
  return API.get('/api').then(root =>
    API.get(root.server_info.region_href).then(region =>
      API.get(root.server_info.zone_href).then(zone => ({ ...root, region, zone })).then(data =>
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
    this.subscribe = window.listenToRx((event) => {
      if (event.type === 'showAboutModal') {
        this.props.showModal();
      }
    });
  }

  componentWillUnmount() {
    this.subscribe.unsubscribe();
  }

  render() {
    if (!this.props.data) {
      return null;
    }

    const { data } = this.props;
    const browser = window.miqBrowserDetect();
    const plugins = Object.keys(data.server_info.plugins).map((key) => {
      const val = data.server_info.plugins[key];
      return (
        <AboutModal.VersionItem
          label={val.display_name}
          versionText={val.version}
          key={key}
        />
      );
    });

    return (
      <AboutModal
        dialogClassName={this.props.dialogClassName}
        show={this.props.show}
        onHide={this.props.hideModal}
        productTitle={`${data.product_info.name_full} ${data.server_info.release}`}
        logo={data.product_info.branding_info.logo}
        altLogo={data.product_info.name_full}
        trademarkText={data.product_info.copyright}
      >
        <AboutModal.Versions>
          <AboutModal.VersionItem label={__('Version')} versionText={`${data.server_info.version}.${data.server_info.build}`} />
          <AboutModal.VersionItem label={__('Server Name')} versionText={data.server_info.appliance || ''} />
          <AboutModal.VersionItem label={__('Region')} versionText={data.region.region.toString()} />
          <AboutModal.VersionItem label={__('Zone')} versionText={data.zone.name || ''} />
          <AboutModal.VersionItem label={__('User Name')} versionText={data.identity.name} />
          <AboutModal.VersionItem label={__('User Role')} versionText={data.identity.role} />
          <AboutModal.VersionItem label={__('Browser')} versionText={browser.browser} />
          <AboutModal.VersionItem label={__('Browser Version')} versionText={browser.version.toString()} />
          <AboutModal.VersionItem label={__('Browser OS')} versionText={browser.OS} />
          <br />
          <a
            style={{ color: 'white' }}
            onClick={(event) => {
              this.setState({ expand: !this.state.expand });
              event.preventDefault();
            }}
          >
            <strong>
              <i className={this.state.expand ? 'fa fa-angle-down' : 'fa fa-angle-right'} />
              Plugins
            </strong>
          </a>
          <div className={this.state.expand ? 'about-visible-scrollbar' : 'hidden'} style={{ height: '200px', overflow: 'auto' }}>
            {plugins}
          </div>
        </AboutModal.Versions>
      </AboutModal>
    );
  }
}

MiqAboutModal.propTypes = {
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

MiqAboutModal.defaultProps = {
  dialogClassName: undefined,
  show: false,
  data: undefined,
};

const mapStateToProps = state =>
  (state.AboutModal ? { show: state.AboutModal.show, data: state.AboutModal.data } : {});
const mapDispatchToProps = dispatch => bindActionCreators({ showModal, hideModal }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(MiqAboutModal);
