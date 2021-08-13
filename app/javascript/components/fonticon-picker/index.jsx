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

const FontIconPicker = (props) => {
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
    // This is required to connect the old session-backed form with the component

    //window.miqObserveRequest(onChangeURL, { data: { button_icon: activeIcon } });
    console.log('activeIcon)', activeIcon);
    iconChange(activeIcon);
    setState((state) => ({ ...state, showModal: false, selectedIcon: activeIcon }));
  };

  const hide = () => setState((state) => ({ ...state, showModal: false }));
  const show = () => setState((state) => ({ ...state, showModal: true }));
  //   const invalid = (touched || validateOnMount) && error;
  //   const warnText = (touched || validateOnMount) && warning;

  return (
    <FormGroup legendText={labelText} {...FormGroupProps}>
      {/* // <FormGroup> */}
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

FontIconPicker.propTypes = {
  iconTypes: PropTypes.objectOf(PropTypes.any),
  selected: PropTypes.string,
  onChangeURL: PropTypes.string,
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

// import React, { useState, useEffect } from 'react';
// import { componentTypes, validatorTypes, useFieldApi } from '@@ddf';
// import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
// import PropTypes from 'prop-types';

// const FontIconPicker = (props) => {
//   const {
//     iconTypes, selected, onChangeURL, iconChange,labelText, input, meta, ...rest
//   } = useFieldApi(prepareProps(props));

//    console.log('iconChangeiconChangeiconChangeiconChange', iconChange, onChangeURL);
//   return (
//     <div>
//       <label htmlFor={input.value}>{labelText}</label>
//       <input {...input} {...rest} id={input.name} />
//     </div>
//   );
// };
// FontIconPicker.propTypes = {
//   iconTypes: PropTypes.objectOf(PropTypes.any),
//   selected: PropTypes.string,
//   onChangeURL: PropTypes.string,
// };

// FontIconPicker.defaultProps = {
//   selected: undefined,
//   iconTypes: {
//     ff: 'Font Fabulous',
//     pficon: 'PatternFly',
//     fa: 'Font Awesome',
//   },
// };

// export default FontIconPicker;