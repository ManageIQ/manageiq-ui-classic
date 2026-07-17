/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalBody, Button } from '@carbon/react';
import ModalItem from './modal-item';
import { detectBrowser } from './helper';

const SHOW_ABOUT_MODAL = '@@aboutModal/show';
const HIDE_ABOUT_MODAL = '@@aboutModal/hide';
const LOAD_ABOUT_MODAL = '@@aboutModal/load';

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

function MiqAboutModal({ dialogClassName = '' }) {
  const dispatch = useDispatch();
  const aboutModal = useSelector((state) => state.AboutModal);
  const show = aboutModal ? aboutModal.show : false;
  const data = aboutModal ? aboutModal.data : undefined;

  const [expand, setExpand] = useState(false);

  const showModal = () => {
    if (aboutModal && aboutModal.data) {
      dispatch({ type: SHOW_ABOUT_MODAL });
      return;
    }
    API.get('/api').then((root) =>
      API.get(root.server_info.region_href).then((region) =>
        API.get(root.server_info.zone_href).then((zone) => ({ ...root, region, zone }))
          .then((payload) => dispatch({ type: LOAD_ABOUT_MODAL, data: payload }))
          .then(() => dispatch({ type: SHOW_ABOUT_MODAL }))));
  };

  const hideModal = () => dispatch({ type: HIDE_ABOUT_MODAL });

  useEffect(() => {
    const subscribe = window.listenToRx((event) => {
      if (event.type === 'showAboutModal') {
        showModal();
      }
    });
    return () => subscribe.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboutModal]);

  let className = 'about-modal';
  if (dialogClassName === 'whitelabel') {
    className = dialogClassName;
  }

  if (!data) {
    return null;
  }

  const browser = detectBrowser();
  const plugins = Object.keys(data.server_info.plugins).map((key) => {
    const val = data.server_info.plugins[key];
    return (
      <ModalItem key={key} label={val.display_name} value={val.version} />
    );
  });

  return (
    <>
      {show && (
        <Modal
          aria-label="About Modal"
          modalHeading={`${data.product_info.name_full} ${data.server_info.release}`}
          open
          onRequestClose={hideModal}
          passiveModal
          className={className}
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
            <ModalItem label={`${__('Browser')} `} value={browser.browser} />
            <ModalItem
              label={`${__('Browser Version')} `}
              value={browser.version.toString()}
            />
            <ModalItem label={`${__('Browser OS')} `} value={browser.OS} />
            <Button
              kind="ghost"
              className="plugins-button"
              onClick={(event) => {
                setExpand((prev) => !prev);
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
            <div className="miq-product-info-and-logo-wrapper">
              <p className="ModalItem">{data.product_info.copyright}</p>
              <img
                src={data.product_info.branding_info.logo}
                alt="logo"
                className="logo"
              />
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

MiqAboutModal.propTypes = {
  dialogClassName: PropTypes.string,
};

export default MiqAboutModal;
