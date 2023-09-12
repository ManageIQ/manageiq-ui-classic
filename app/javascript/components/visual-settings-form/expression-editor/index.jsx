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
  // Define the initial state for the component
  const initialState = {
    selectedItem: items[0],
    conditionalDropdownValue: null,
    additionalDropdown1Value: null,
    additionalDropdown2Value: null,
    additionalDropdown3Value: null,
  };

  // Initialize the state using useState hook
  const [state, setState] = useState(initialState);
  const [labelText, setLabelText] = useState(newElement); // State to store the label text
  const labelRef = useRef(null); // Reference to the label element

  // Event handler for the main dropdown selection
  const handleSelect = (event) => {
    setState({
      ...state,
      selectedItem: event.selectedItem,
      conditionalDropdownValue: null, // Reset conditional dropdown value
      additionalDropdown1Value: null, // Reset additional dropdown 1 value
      additionalDropdown2Value: null, // Reset additional dropdown 2 value
    });
  };

  // Event handler for the conditional dropdown selection
  const handleConditionalDropdownChange = (event) => {
    setState({
      ...state,
      conditionalDropdownValue: event.target.value,
      additionalDropdown1Value: null, // Reset additional dropdown 1 value
      additionalDropdown2Value: null, // Reset additional dropdown 2 value
    });
  };

  // Function to get the label of the selected item from the ConditionalItems array
  const getConditionalDropdownLabel = () => {
    const selectedItem = ConditionalItems.find(item => item.id === state.conditionalDropdownValue);
    return selectedItem ? selectedItem.label : ''; // Return the label or an empty string if not found
  };

  const getAdditionalDropdown1Label = () => {
    const selectedItem = DateItems.find(item => item.id === state.additionalDropdown1Value);
    return selectedItem ? selectedItem.label : ''; // Return the label or an empty string if not found
  };

  const getAdditionalDropdown2Label = () => {
    const selectedItem = DateParameters.find(item => item.id === state.additionalDropdown2Value);
    return selectedItem ? selectedItem.label : ''; // Return the label or an empty string if not found
  };

  // Function to generate the combined string based on selected values
  const generateCombinedString = () => {
    const conditionalDropdownLabel = getConditionalDropdownLabel();
    const AdditionalDropdownLabel1 = getAdditionalDropdown1Label();
    const AdditionalDropdownLabel2 = getAdditionalDropdown2Label();
    const selectedValues = [
      conditionalDropdownLabel, // Use the label instead of the value
      AdditionalDropdownLabel1, // Use the label instead of the value
      AdditionalDropdownLabel2, // Use the label instead of the value
    ].filter(Boolean); // Filter out null or undefined values

    if (selectedValues.length === 0) {
      return labelText; // Return previous value if no values selected
    }

    return selectedValues.join(' '); // Combine selected values with a comma separator
  };

  // Event handler for the "Commit" button click
  const handleCommitClick = () => {
    const combinedString = generateCombinedString();
    setLabelText(combinedString);
  };

  // Determine whether to display the conditional dropdown based on the selected item
  const shouldDisplayConditionalDropdown = state.selectedItem.id === 'field';
  const shouldDisplayAdditionalDropdowns =
    state.conditionalDropdownValue === '1'; // Check if it's "EVM Audit Event: Date created"
  const shouldDisplayAdditionalfields = !['1', 'choose'].includes(
    state.conditionalDropdownValue
  ); // Check if it's not "EVM Audit Event: Date created"

  return (
    <>
      <div className='edit-expression-container'>
        <h2 className='heading'>Edit Expression</h2>
        <Button disabled>Undo</Button>&nbsp;
        <Button disabled>Redo</Button>&nbsp;
        <Button kind="secondary" disabled>Cancel</Button>
        <br />
        <br />

        {/* Display the label text */}
        <label className='edit-expression-textarea'>{labelText}</label>
        <br />

        <label> Add a Condition: </label>
        <br />
        <Button disabled >and</Button>&nbsp;
        <Button disabled >or</Button>&nbsp;
        <Button disabled >not</Button>
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

        {/* "Commit" and "Discard" buttons */}
        <Button id="commit" onClick={handleCommitClick}>Commit</Button>&nbsp;
        <Button kind="secondary">Discard</Button>
      </div>
    </>
  );
};

export default EditExpression;
