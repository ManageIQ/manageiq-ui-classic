import React, { useState } from 'react';
import {
  FormGroup, Button,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi } from '@@ddf';
import { ChevronDown32 } from '@carbon/icons-react';
import IconModal from './icon-modal';

const FontIconPickerDdf = (props) => {
  const {
    labelText,
    FormGroupProps,
    iconTypes, selected, iconChange,
  } = useFieldApi(prepareProps(props));

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
    // This is required to connect the old session-backed form with the component. Was used for the olf rails form.
    iconChange(activeIcon);
    setState((state) => ({ ...state, showModal: false, selectedIcon: activeIcon }));
  };

  const hide = () => setState((state) => ({ ...state, showModal: false }));
  const show = () => setState((state) => ({ ...state, showModal: true }));

  return (
    <FormGroup legendText={labelText} {...FormGroupProps}>
      <div className="fonticon-picker">
        <Button onClick={show} kind="tertiary" renderIcon={ChevronDown32} className="icon-button">
          { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
        </Button>
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

    </FormGroup>

  );
};

FontIconPickerDdf.propTypes = {
  iconTypes: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.string,
};

FontIconPickerDdf.defaultProps = {
  selected: undefined,
  iconTypes: {
    ff: 'Font Fabulous',
    pficon: 'PatternFly',
    fa: 'Font Awesome',
  },
};

export default FontIconPickerDdf;
