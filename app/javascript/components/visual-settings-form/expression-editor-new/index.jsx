import React, { useState } from 'react';
import {
  Dropdown,
  Button,
  Checkbox,
  Form,
} from 'carbon-components-react';
import {
  ExprCondition,
  FieldItems,
  EventItems,
  ConstraintTexts,
  DateParameters,
  InputParameters,
} from './editor-helper.js';
import useUndoRedo from './custom-hooks/UseUndoRedo.js';
import CounterApp from './myCounter.jsx';
import Evaluate from './evaluate.jsx';
import './editor-style.css';

const ExpressionEditor = () => {
  const [data, setData] = useState({
    selectedCondition: undefined,
    isComponentVisible: false,
    isEditSelectedComponentVisible: true,
    isEventVisible: false,
    selectedField: undefined,
    selectedEvent: undefined,
    selectedConstraint: undefined,
    selectedDateParam: undefined,
    selectedInputParam: undefined,
    combinedSelectedItems: '',
    buttonsEnabled: false,
    textFieldButtonCount: 1,
  });

  const ExpressionLabels = {
    newElement: '<new element>',
  }

  const DropDownLabels = {
    expression: 'expression',
    field: 'field',
    event: 'event',
    constraint: 'constraint',
    date: 'date',
    input: 'input',
  }

  // Function to reset the form and clear state variables
  const resetForm = () => {
    setData({
      ...data,
      selectedCondition: undefined,
      isEventVisible: false,
      selectedField: undefined,
      selectedEvent: undefined,
      selectedConstraint: undefined,
      selectedInputParam: undefined,
    })
  };

  // Handle commit button click
  const handleCommitClick = () => {
    const combinedString = [
      selectedEvent,
      selectedConstraint,
      selectedDateParam,
      selectedInputParam,
    ]
      .filter((item) => item !== null)
      .map((item) => item.label)
      .join(' ');

    setData({
      ...data,
      combinedSelectedItems: combinedString,
      selectedLabel: combinedString,
      isEditSelectedComponentVisible: false,
    });
  };

  // Handle and button click
  const handleAndClick = () => {
    const { selectedLabel, buttonsEnabled, textFieldButtonCount } = data;
    let newData = {
      buttonsEnabled: !buttonsEnabled,
      selectedLabel: selectedLabel+ ' ' + 'and' + ' ',
      textFieldButtonCount: textFieldButtonCount + 1,
      selectedOption: '',
    }
    if (selectedLabel) {
      newData = {
        ...newData,
        selectedOption: '',
      }
    }
    setData({
      ...data,
      newData,
    });
  };

  // Handle or button click
  const handleOrClick = () => {
    setData({
      ...data,
      buttonsEnabled: !buttonsEnabled,
    });
  };

  // Handle not button click
  const handleNotClick = () => {
    setData({
      ...data,
      buttonsEnabled: !buttonsEnabled,
    });
  };

  console.log('data=', data);

  /** Function to render the buttons in toolbar */
  const renderToolBarButtons = () => (<>
    <Button className='undo' size='sm'>Undo</Button> &nbsp;
    <Button className='redo' size='sm'>Redo</Button> &nbsp;
    <Button className='cancel' kind='secondary' size='sm'>Cancel</Button>
  </>);

  /** Function to render the conditional buttons in the editor. */
  const renderConditionalButtons = () => (<>
  <Button className='and' disabled={!data.buttonsEnabled} onClick={handleAndClick}>and</Button>&nbsp;
  <Button className='or' disabled={!data.buttonsEnabled} onClick={handleOrClick}>or</Button>&nbsp;
  <Button className='not' disabled={!data.buttonsEnabled} onClick={handleNotClick}>not</Button></>);

  /** Function to handle the drop down button change events. */
  const handleDropDownChange = (name, value) => {
    const {expression, field, event, constraint, date, input} = DropDownLabels;
    switch(name){
      case expression:
        return { selectedCondition: value, isComponentVisible: true,  };
      case field:
        return { selectedField: value, isEventVisible: true };
      case event:
        return { selectedEvent: value };
      case constraint:
        return { selectedConstraint: value };
      case date:
        return { selectedDateParam: value };
      case input:
        return { selectedInputParam: value };
      default:
        return {};
    }
  }

  const dropDownOnChange = (name, value) => {
    console.log(name, value)
    const newData = handleDropDownChange(name, value);
    console.log(newData);
    setData({
      ...data,
      ...newData,
    })
  }

  const renderDropDown = (name, items, selectedItem) => (
    <Dropdown
      className={`${name}-dropdown`}
      id={`${name}-dropdown`}
      label='<Choose>'
      items={items}
      selectedItem={selectedItem}
      onChange={(value) => dropDownOnChange(name, value)}
    />
  )

  const isSelectedFieldValid = (data) => {
    return data.selectedField && data.selectedField.selectedItem.label === 'field';
  }

  const isSelectedEventValid = (data) => {
    return  data.isEventVisible && data.selectedEvent && data.selectedEvent.selectedItem.label === 'EVM Audit Event:Date Created'
  }

  const renderActionButtons = () => (<>
  <Button className='commit' size='md' onClick={handleCommitClick}>Commit</Button>&nbsp;
  <Button className='discard' kind='secondary' size='md' onClick={resetForm}>Discard</Button>
  </>)

  return (
    <div>
      <div className='div-dummy-drop-down'>
        { renderDropDown(DropDownLabels.expression, ExprCondition, data.selectedCondition) }
      </div>

      {data.isComponentVisible && (
        <div>
          <div className='edit-expression-container'>
            <h1>Edit Expression</h1>
            <br />
            <div className='edit-exp-opr-btn'>
              { renderToolBarButtons() }
            </div>
            <br />
            <br />
            &nbsp;
            <label className='selected-item'>{data.selectedLabel}</label>
            <br />
            <br />
            <div className='edit-exp-cond-btn'>
              <label>Add a condition:</label>
              <br />

            </div>
            <br />{ renderConditionalButtons() }
          </div>
          <br />
          { data.isEditSelectedComponentVisible &&(
          <>
            <div className='edit-expression-container'>
              <h1>Edit Selected Element</h1>
              <Form>
              { renderDropDown('field', FieldItems, data.selectedField) }
              {/* {console.log(data.selectedField ? data.selectedField.selectedItem.label : "", "Amal")} */}
                <Checkbox labelText={`User will input the value`} id='user-input' />
                <br />
                { isSelectedFieldValid(data) && (renderDropDown(DropDownLabels.event, EventItems, data.selectedEvent)) }
                { isSelectedEventValid(data) && (
                  <>
                  {console.log(data.selectedEvent.label,"data.selectedEvent.label")}
                    {renderDropDown(DropDownLabels.constraint, ConstraintTexts, data.selectedConstraint)}
                    {renderDropDown(DropDownLabels.date, DateParameters, data.selectedDateParam)}
                  </>
                )}
                {!isSelectedEventValid(data) && (
                  renderDropDown(DropDownLabels.input, InputParameters, data.selectedInputParam)
                )}
                { renderActionButtons() }
              </Form>
            </div>
          </>
          )}
        </div>
      )}
      <br />
      <div className='input-param'>{/* TBD Input parameters section */}</div>
      <CounterApp />
      <Evaluate />
    </div>
  );
};

export default ExpressionEditor;
