import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Icon
} from 'patternfly-react';
import {
  FormGroup, TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { useFieldApi } from '@@ddf';
import IconModal from './icon-modal';

const FontIconPickerNew = (props) => {
  const {
    labelText,
    input,
    FormGroupProps,
    helperText,
    meta: { error, warning, touched },
    validateOnMount,
    iconTypes, selected, onChangeURL, iconChange,
    ...rest
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
    //window.miqObserveRequest(onChangeURL, { data: { button_icon: activeIcon } });
    iconChange(activeIcon);
    setState((state) => ({ ...state, showModal: false, selectedIcon: activeIcon }));
  };

  const hide = () => setState((state) => ({ ...state, showModal: false }));
  const show = () => setState((state) => ({ ...state, showModal: true }));
  
  return (
    <FormGroup legendText={labelText} {...FormGroupProps}>
      <div className="fonticon-picker">
        <ButtonGroup>
          <Button className="icon-picker-btn" onClick={show}>
            { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
          </Button>
          <Button onClick={show}>
            <Icon type="fa" name="angle-down" />
          </Button>
        </ButtonGroup>
        <div style={{'display':'none'}}>
          <TextInput
            {...input}
            id={input.name}
            type="text"
            className="file-upload-input"
            disabled
            value={selectedIcon || 'NoIcon'}
            labelText=""
            {...rest}

          />
        </div>
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

FontIconPickerNew.propTypes = {
  iconTypes: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.string,
  onChangeURL: PropTypes.string,
};

FontIconPickerNew.defaultProps = {
  selected: undefined,
  iconTypes: {
    ff: 'Font Fabulous',
    pficon: 'PatternFly',
    fa: 'Font Awesome',
  },
};

export default FontIconPickerNew;