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
import CounterApp from './myCounter.jsx';
import Evaluate from './evaluate.jsx';
import './editor-style.css';

const ExpressionLabels = {
  newElement: '',
}

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
    buttonsEnabled: false,
    textFieldButtonCount: 1,
    combinedString: ExpressionLabels.newElement,
    labelStack: [ExpressionLabels.newElement],
    labelStackIndex: 0,
    conditionalButtonsDisabled:true,
  });

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
      selectedDateParam: undefined,
      selectedConstraint: undefined,
      selectedInputParam: undefined,
    })
  };
  // Handle undo button click
  const handleUndoClick = () => {
    const { labelStack, labelStackIndex } = data;
    console.log('labelStack:', labelStack);
    console.log('labelStackIndex:', labelStackIndex);
    if (labelStackIndex > 0) {
      const newLabelStackIndex = labelStackIndex - 1;
      setData({
        ...data,
        combinedString: labelStack[newLabelStackIndex],
        labelStackIndex: newLabelStackIndex,
        conditionalButtonsDisabled: false,
      });
    }
  };

  // Handle redo button click
  const handleRedoClick = () => {
    const { labelStack, labelStackIndex } = data;
    if (labelStackIndex < labelStack.length - 1) {
      const newLabelStackIndex = labelStackIndex + 1;
      setData({
        ...data,
        combinedString: labelStack[newLabelStackIndex],
        labelStackIndex: newLabelStackIndex,
        conditionalButtonsDisabled: false,
      });
    }
  };

  // Handle and button click
  const handleAndClick = () => {
    const { combinedString, labelStack } = data;
    const newLabelStack = [...labelStack, `${combinedString} and `];
    updateLabelStack(newLabelStack, false);
  };

  // Handle or button click
  const handleOrClick = () => {
    const { combinedString, labelStack } = data;
    const newLabelStack = [...labelStack, `${combinedString} or `];
    updateLabelStack(newLabelStack);
  };

  // Handle not button click
  const handleNotClick = () => {
    const { combinedString, labelStack } = data;
    const newLabelStack = [...labelStack, `NOT(${combinedString})`];
    updateLabelStack(newLabelStack);
  };

  // Update labelStack and reset combinedString
  const updateLabelStack = (newLabelStack, enableConditionalButtons) => {
    setData({
      ...data,
      labelStack: newLabelStack,
      combinedString: ExpressionLabels.newElement, // Reset combinedString
      conditionalButtonsDisabled: false, // Enable conditional buttons
    });
  };

  /** Function to render the buttons in toolbar */
  const renderToolBarButtons = () => (<>
    <Button className='undo' size='sm' onClick={handleUndoClick}>Undo</Button> &nbsp;
    <Button className='redo' size='sm' onClick={handleRedoClick}>Redo</Button> &nbsp;
    <Button className='cancel' kind='secondary' size='sm'>Cancel</Button>
  </>);

  /** Function to render the conditional buttons in the editor. */
  const renderConditionalButtons = () => (<>
    <Button className='and' disabled={data.conditionalButtonsDisabled} onClick={handleAndClick}>and</Button>&nbsp;
    <Button className='or' disabled={data.conditionalButtonsDisabled} onClick={handleOrClick}>or</Button>&nbsp;
    <Button className='not' disabled={data.conditionalButtonsDisabled} onClick={handleNotClick}>not</Button>
  </>);

  /** Function to handle the drop down button change events. */
  const handleDropDownChange = (name, {selectedItem}) => {
    const value = selectedItem;
    console.log('value=', value);
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

  // Handle label click to display a new label
  const handleLabelClick = (index) => {
  const newLabelStack = data.labelStack.slice(0, index + 1);
  console.log('label clicked')
  console.log('newLabelStack=',newLabelStack)
    setData({
      ...data,
      labelStack: newLabelStack,
      conditionalButtonsDisabled:false,
    });
  };

  const dropDownOnChange = (name, value) => {
    const newData = handleDropDownChange(name, value);
    setData({
      ...data,
      ...newData,
    })
  }

  const renderDropDown = (name, items, selectedItem) => {
    return (
      <Dropdown
        className={`${name}-dropdown`}
        id={`${name}-dropdown`}
        label='<Choose>'
        items={items}
        selectedItem={selectedItem ? selectedItem.label : undefined}
        onChange={(value) => dropDownOnChange(name, value)}
      />
    );
  }

  const renderActionButtons = () => (<>
    <Button className='commit' size='md' onClick={handleCommitClick}>Commit</Button>&nbsp;
    <Button className='discard' kind='secondary' size='md' onClick={resetForm}>Discard</Button>
  </>)

  const isSelectedFieldValid = (data) => {
    return data.selectedField && data.selectedField.label === 'field';
  }
  const isSelectedEventValid = (data) => {
    return  data.isEventVisible && data.selectedEvent && data.selectedEvent.label === 'EVM Audit Event:Date Created'
  }

  // Handle commit button click
  const handleCommitClick = () => {
    const {
      selectedEvent,
      selectedConstraint,
      selectedDateParam,
      selectedInputParam,
    } = data;

    const combinedString = ` ${selectedEvent ? selectedEvent.label : ''} ${selectedConstraint ? selectedConstraint.label : ''} "${selectedDateParam ? selectedDateParam.label : ''}" ${selectedInputParam ? selectedInputParam.label : ''}`;
    console.log('Combined Selected Items=', combinedString);
    const newLabelStack = [...data.labelStack, combinedString];
    console.log(newLabelStack,"newLabelStack")
    setData({
      ...data,
      combinedString,
      label:combinedString,
      labelStack:newLabelStack,
    });
  };

  // Render labels conditionally
  const renderLabels = () => {
    if (data.combinedString === ExpressionLabels.newElement) {
      return (
        <label className='selected-item' key={0}>
          {data.combinedString}
        </label>
      );
    } else {
      return data.labelStack.map((label, index) => (
        <label
          className='selected-item'
          key={index}
          onClick={() => handleLabelClick(index)}
        >
          {label}
        </label>
      ));
    }
  };

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
            &nbsp;
            {renderLabels()}
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
                <Checkbox labelText={`User will input the value`} id='user-input' />
                <br />
                { isSelectedFieldValid(data) && (renderDropDown(DropDownLabels.event, EventItems, data.selectedEvent)) }
                { isSelectedEventValid(data) && (
                  <>
                    {renderDropDown(DropDownLabels.constraint, ConstraintTexts, data.selectedConstraint)}
                    {renderDropDown(DropDownLabels.date, DateParameters, data.selectedDateParam)}
                  </>
                )}
                {data.isEventVisible && data.selectedEvent && data.selectedEvent.label !== 'EVM Audit Event:Date Created' && (
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
