import React, { useState, useRef } from 'react';
import { Button, Dropdown, Select, SelectItem } from 'carbon-components-react';
import './expression-editor-style.css';
import {
  newElement,
  items,
  ConditionalItems,
  DateItems,
  DateParameters,
  InputParameters,
} from './expression-editor-helper.jsx';

const EditExpression = () => {
//for selected values
  const [selectedValues, setSelectedValues] = useState({
    conditionalDropdownValues: [],
    additionalDropdown1Values: [],
    additionalDropdown2Values: [],
  });


  const initialState = {
    selectedItem: items[0],
    conditionalDropdownValue: null,
    additionalDropdown1Value: null,
    additionalDropdown2Value: null,
    additionalDropdown3Value: null,
  };//initial state

  const [state, setState] = useState(initialState);
  const [labelText, setLabelText] = useState(newElement); // State to store the label text
  const [buttonsEnabled, setButtonsEnabled] = useState(false); // State to control whether the buttons are enabled
  const initialLabelText = useRef(newElement); //a variable to store the initial label text
  const [selectedButtonText, setSelectedButtonText] = useState(''); // State to store the selected button text
  const [showNewElement, setShowNewElement] = useState(false); // State to control the visibility of the new element


  // Handler for the main dropdown selection
  const handleSelect = (event) => {
    setState({
      ...state,
      selectedItem: event.selectedItem,
      conditionalDropdownValue: null,
      additionalDropdown1Value: null,
      additionalDropdown2Value: null,
    });// Reset all dropdown values
  };

  // Handler for the conditional dropdown selection
  const handleConditionalDropdownChange = (event) => {
    const { value } = event.target;
    setSelectedValues((prevState) => ({
      ...prevState,
      conditionalDropdownValues: [...prevState.conditionalDropdownValues, value],
    }));
    setState({
      ...state,
      conditionalDropdownValue: value,
      additionalDropdown1Value: null, // Reset additional dropdown 1 value
      additionalDropdown2Value: null, // Reset additional dropdown 2 value
    });
  };

  // Handler for additionalDropdown1 selection
  const handleAdditionalDropdown1Change = (event) => {
    const { value } = event.target;
    setSelectedValues((prevState) => ({
      ...prevState,
      additionalDropdown1Values: [...prevState.additionalDropdown1Values, value],
    }));
    setState({
      ...state,
      additionalDropdown1Value: value,
    });
  };

  // Handler for additionalDropdown2 selection
  const handleAdditionalDropdown2Change = (event) => {
    const { value } = event.target;
    setSelectedValues((prevState) => ({
      ...prevState,
      additionalDropdown2Values: [...prevState.additionalDropdown2Values, value],
    }));
    setState({
      ...state,
      additionalDropdown2Value: value,
    });
  };

  // Function to generate the combined string based on selected values
  const generateCombinedString = () => {
    const conditionalDropdownString = selectedValues.conditionalDropdownValues.join(', ');
    const additionalDropdown1String = selectedValues.additionalDropdown1Values.join(', ');
    const additionalDropdown2String = selectedValues.additionalDropdown2Values.join(', ');

    const selectedValuesString = `${conditionalDropdownString}, ${additionalDropdown1String}, ${additionalDropdown2String}`;

    return selectedValuesString;
  };

  // Event handler for the label click
  const handleLabelClick = () => {
    setButtonsEnabled(!buttonsEnabled);
  };

  // Event handler for the "Cancel" button click
  const handleCancelClick = () => {
    setLabelText(initialLabelText.current);
  };

  // Function to get the label of the selected item from the ConditionalItems array
  const getConditionalDropdownLabel = () => {
    const selectedItem = ConditionalItems.find(item => item.id === state.conditionalDropdownValue);
    return selectedItem ? selectedItem.label : ''; // Return the label or an empty string if not found
  };

  const getAdditionalDropdown1Label = () => {
    const selectedItem = DateItems.find(item => item.id === state.additionalDropdown1Value);
    return selectedItem ? selectedItem.label : '';
  };

  const getAdditionalDropdown2Label = () => {
    const selectedItem = DateParameters.find(item => item.id === state.additionalDropdown2Value);
    return selectedItem ? selectedItem.label : '';
  };

  // Function to generate the combined string based on selected values
  const generateCombinedStrings = () => {
    const conditionalDropdownLabel = getConditionalDropdownLabel();
    const AdditionalDropdownLabel1 = getAdditionalDropdown1Label();
    const AdditionalDropdownLabel2 = getAdditionalDropdown2Label();
    const selectedValues = [
      conditionalDropdownLabel,
      AdditionalDropdownLabel1,
      AdditionalDropdownLabel2,
    ].filter(Boolean); // Filter out null or undefined values

    if (selectedValues.length === 0) {
      return labelText; // Return previous value if no values selected
    }
    return selectedValues.join(' '); // Join selected values
  };

  // Handler for commit button
  const handleCommitClick = () => {
    const combinedString = generateCombinedStrings();
    setLabelText(combinedString);

    // Log the combined string
    console.log(combinedString);
  };

  // Handler for expression buttons
  const handleButtonSelection = (buttonText) => {
    setSelectedButtonText(buttonText);
    setShowNewElement(true);
  };

  // Handler for additon label text
  const handleNewElementClick = () => {
    alert(`Selected: ${newElement}`);
  };


  // COnditional dropdown visibility
  const shouldDisplayConditionalDropdown = state.selectedItem.id === 'field';
  const shouldDisplayAdditionalDropdowns = state.conditionalDropdownValue === '1'; // Check if it's "EVM Audit Event: Date created"
  const shouldDisplayAdditionalfields = !['1', 'choose'].includes(state.conditionalDropdownValue); // Check if it's not "EVM Audit Event: Date created"

  return (
    <>
      <div className='edit-expression-container'>
        <h2 className='heading'>Edit Expression</h2>
        <Button disabled>Undo</Button>&nbsp;
        <Button disabled>Redo</Button>&nbsp;
        <Button kind="secondary" disabled={!buttonsEnabled} onClick={handleCancelClick}>Cancel</Button>
        <br />
        <br />
        {/* selected condition label */}
        <label className='edit-expression-textarea' onClick={handleLabelClick} >{labelText}</label>
        {/* Additional label for newly added elements */}
        {showNewElement && (
          <>
            <label className='edit-expression-textarea' onClick={handleNewElementClick}>
              {selectedButtonText} <span className='new-element-label'>{newElement}</span>
            </label>
            <br />
          </>
      )}
        <br />

        <label> Add a Condition: </label>
        <br />
        <Button disabled={!buttonsEnabled}  onClick={() => handleButtonSelection('and')}>and</Button>&nbsp;
        <Button disabled={!buttonsEnabled} onClick={() => handleButtonSelection('or')}>or</Button>&nbsp;
        <Button disabled={!buttonsEnabled} onClick={() => handleButtonSelection('not')}>not</Button>
        <br />
        <br />
      </div>

      <div className='edit-expression-container'>
        <h2>Edit Selected Element</h2>

        {/* Main Dropdown */}
        <Dropdown
          id="my-dropdown"
          label="Select an item"
          hideLabel={true}
          items={items}
          selectedItem={state.selectedItem}
          onChange={handleSelect}
        />

        {/** Conditional dropdown */}
        {shouldDisplayConditionalDropdown && (
          <Select
            id="conditionalDropdown"
            value={state.conditionalDropdownValue || ''}
            onChange={handleConditionalDropdownChange}
            hideLabel={true}
          >
            {ConditionalItems && ConditionalItems.map((item) => (
              <SelectItem key={item.id} value={item.id} text={item.label} />
            ))}
          </Select>
        )}
        <br />

        {/** Additional dropdowns */}
        {shouldDisplayAdditionalDropdowns && (
          <>
            <Select
              id="additionalDropdown1"
              hideLabel={true}
              value={state.additionalDropdown1Value || ''}
              onChange={(event) => setState({ ...state, additionalDropdown1Value: event.target.value })}
            >
              {DateItems && DateItems.map((item) => (
                <SelectItem key={item.id} value={item.id} text={item.label} />
              ))}
            </Select>
            <br />
            <Select
              id="additionalDropdown2"
              hideLabel={true}
              value={state.additionalDropdown2Value || ''}
              onChange={(event) => setState({ ...state, additionalDropdown2Value: event.target.value })}
            >
              {
                DateParameters && DateParameters.map((item) => (
                  <SelectItem key={item.id} value={item.id} text={item.label} />
                ))}
            </Select>
          </>
        )}
        {shouldDisplayAdditionalDropdowns && shouldDisplayAdditionalfields && (
          <>
            <Select
              id="additionalDropdown3"
              hideLabel={true}
              value={state.additionalDropdown3Value || ''}
              onChange={(event) => setState({ ...state, additionalDropdown3Value: event.target.value })}
            >
              {InputParameters && InputParameters.map((item) => (
                <SelectItem key={item.id} value={item.id} text={item.label} />
              ))}
            </Select>
            <br />
          </>
        )}
        <br />
        <Button id="commit" onClick={handleCommitClick}>Commit</Button>&nbsp;
        <Button kind="secondary">Discard</Button>
      </div>
    </>
  );
};

export default EditExpression;
