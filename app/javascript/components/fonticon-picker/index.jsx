import React, { useState } from 'react';
import {
  Button,
  Modal,
  ButtonGroup,
  Icon,
  Tabs,
  Tab,
} from 'patternfly-react';
import {
  FormGroup, TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';

import { useFieldApi } from '@@ddf';

import IconList from './icon-list';

const FontIconPicker = (props) => {
  console.log('propssss before', props);
  const {
    labelText,
    input: { value, onChange, name },
    FormGroupProps,
    helperText,
    meta: { error, warning, touched },
    validateOnMount,
    iconTypes, selected, onChangeURL, iconChange,
    ...rest
  } = useFieldApi(prepareProps(props));
  console.log('propssss', props);

  //   const {
  //     iconTypes, selected, onChangeURL, iconChange,
  //   } = props;
  console.log('iconChangeiconChangeiconChangeiconChange', iconChange, onChangeURL);
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
        {/* <ButtonGroup>
          <Button className="icon-picker-btn" onClick={show}>
            { selectedIcon ? (<i id="selected-icon" className={classNames('fa-lg', selectedIcon)} />) : __('No icon') }
          </Button>
          <Button onClick={show}>
            <Icon type="fa" name="angle-down" />
          </Button>
        </ButtonGroup> */}
        <Button onClick={show}>
          <Icon type="fa" name="angle-down" />
        </Button>
        <div>
          <label htmlFor={input.value}>kkk</label>
          <TextInput
          {...input}
            type="text"
            className="file-upload-input"
            disabled
            value={selectedIcon || 'NoICOn'}
            {...rest}

          />
        </div>
        <Modal show={showModal} onHide={hide} bsSize="large">
          <Modal.Header>
            <button
              id="close-icon-picker-modal"
              type="button"
              className="close"
              onClick={hide}
              aria-label={__('Close')}
            >
              <Icon type="pf" name="close" />
            </button>
            <Modal.Title>{ __('Select an icon') }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="fonticon-picker-modal">
              <Tabs
                id="font-icon-tabs"
                activeKey={activeTab}
                animation={false}
                onSelect={(activeTab) => setState((state) => ({ ...state, activeTab }))}
              >
                { Object.keys(iconTypes).map((type) => (
                  <Tab eventKey={type} key={type} title={iconTypes[type]}>
                    <IconList
                      {...{
                        type,
                        activeIcon,
                        activeTab,
                        setState,
                      }}
                    />
                  </Tab>
                )) }
              </Tabs>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              id="apply-icon-picker-icon"
              bsStyle="primary"
              onClick={onModalApply}
              disabled={selectedIcon === activeIcon || activeIcon === undefined}
            >
              { __('Apply') }
            </Button>
            <Button id="cancel-icon-picker-modal" bsStyle="default" className="btn-cancel" onClick={hide}>
              { __('Cancel') }
            </Button>
          </Modal.Footer>
        </Modal>

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
