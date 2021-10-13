import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Icon,
} from 'patternfly-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import IconModal from './icon-modal';

const FontIconPicker = ({ iconTypes, selected, onChangeURL }) => {
  const [{
    showModal,
    selectedIcon,
    activeTab,
    activeIcon,
  }, setState] = useState({
    showModal: false,
    selectedIcon: selected,
    activeIcon: selected,
    activeTab: selected ? selected.split(' ')[0] : Object.keys(iconTypes)[0],
  });

  const onModalApply = () => {
    // This is required to connect the old session-backed form with the component
    window.miqObserveRequest(onChangeURL, { data: { button_icon: activeIcon } });
    setState((state) => ({ ...state, showModal: false, selectedIcon: activeIcon }));
  };

  const hide = () => setState((state) => ({ ...state, showModal: false }));
  const show = () => setState((state) => ({ ...state, showModal: true }));

  return (
    <div className="fonticon-picker">
      <ButtonGroup>
        <Button className="icon-picker-btn" onClick={show}>
          { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
        </Button>
        <Button onClick={show}>
          <Icon type="fa" name="angle-down" />
        </Button>
      </ButtonGroup>
      <IconModal
        showModal={showModal}
        hide={hide}
        activeTab={activeTab}
        selectedIcon={selectedIcon}
        activeIcon={activeIcon}
        iconTypes={iconTypes}
        onModalApply={onModalApply}
        setState={setState}
      />
    </div>
  );
};

FontIconPicker.propTypes = {
  iconTypes: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.string,
  onChangeURL: PropTypes.string.isRequired,
};

FontIconPicker.defaultProps = {
  selected: undefined,
  iconTypes: {
    ff: 'Font Fabulous',
    pficon: 'PatternFly',
    fa: 'Font Awesome',
  },
};

export default FontIconPicker;
