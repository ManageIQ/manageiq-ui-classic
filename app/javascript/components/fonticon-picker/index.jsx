import React, { useState } from 'react';
import { Button } from 'carbon-components-react';
import { ChevronDown32 } from '@carbon/icons-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import IconModal from './icon-modal';

const FontIconPicker = ({ iconTypes, selected, onChangeURL }) => {
  const [{
    showModal,
    selectedIcon,
    activeIcon,
  }, setState] = useState({
    showModal: false,
    selectedIcon: selected,
    activeIcon: selected,
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
      <Button onClick={show} kind="tertiary" renderIcon={ChevronDown32} className="icon-button">
        { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
      </Button>
      <IconModal
        showModal={showModal}
        hide={hide}
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
