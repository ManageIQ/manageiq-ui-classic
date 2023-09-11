import React, { useState } from 'react';
import { Button, Dropdown, Select, SelectItem } from 'carbon-components-react';
import './expression-editor-style.css';

const EditExpression = () => {
  const newElement = "<new element>";
  const items = [
    { id: 'choose', label: '<choose>' },
    { id: 'field', label: 'field' },
  ];

  const ConditionalItems = [
    { id: 'choose', label: '<choose>' },
    { id: '1', label: 'EVM Audit Event:Date created' },
    { id: '2', label: 'EVM Audit Event:Event' },
    { id: '3', label: 'EVM Audit Event:Href Slug' },
    { id: '4', label: 'EVM Audit Event:Id' },
    { id: '5', label: 'EVM Audit Event:Message' },
    { id: '6', label: 'EVM Audit Event:Region Description' },
    { id: '7', label: 'EVM Audit Event:Region Number' },
    { id: '8', label: 'EVM Audit Event:Severity' },
    { id: '9', label: 'EVM Audit Event:Source' },
  ];

  const DateItems = [
    { id: 'is', label: 'IS' },
    { id: 'before', label: 'BEFORE' },
    { id: 'after', label: 'AFTER' },
    { id: 'from', label: 'FROM' },
    { id: 'isempty', label: 'IS EMPTY' },
    { id: 'isnotempty', label: 'IS NOT EMPTY' },
  ];

  const DateParameters = [
    { id: 'thishour', label: 'This Hour' },
    { id: 'lasthour', label: 'Last Hour' },
    { id: '2hoursago', label: '2 Hours Ago' },
    { id: '3hoursago', label: '3 Hours Ago' },
    { id: '4hoursago', label: '4 Hours Ago' },
    { id: '5hoursago', label: '5 Hours Ago' },
    { id: '6hoursago', label: '6 Hours Ago' },
    { id: '7hoursago', label: '7 Hours Ago' },
    { id: '8hoursago', label: '8 Hours Ago' },
    { id: '9hoursago', label: '9 Hours Ago' },
    { id: '10hoursago', label: '10 Hours Ago' },
    { id: '11hoursago', label: '11 Hours Ago' },
    { id: '12hoursago', label: '12 Hours Ago' },
    { id: '13hoursago', label: '13 Hours Ago' },
    { id: '14hoursago', label: '14 Hours Ago' },
    { id: '15hoursago', label: '15 Hours Ago' },
    { id: '16hoursago', label: '16 Hours Ago' },
    { id: '17hoursago', label: '17 Hours Ago' },
    { id: '18hoursago', label: '18 Hours Ago' },
    { id: '19hoursago', label: '19 Hours Ago' },
    { id: '20hoursago', label: '20 Hours Ago' },
    { id: '21hoursago', label: '21 Hours Ago' },
    { id: '22hoursago', label: '22 Hours Ago' },
    { id: '23hoursago', label: '23 Hours Ago' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '2dayssgo', label: '2 Days Ago' },
    { id: '3dayssgo', label: '3 Days Ago' },
    { id: '5dayssgo', label: '4 Days Ago' },
    { id: '6dayssgo', label: '5 Days Ago' },
    { id: '7dayssgo', label: '6 Days Ago' },
    { id: '14dayssgo', label: '7 Days Ago' },
    { id: 'thisweek', label: 'This Week' },
    { id: 'lastweek', label: 'Last Week' },
    { id: '2weeksago', label: 'Two Weeks  Ago' },
    { id: '3weeksago', label: 'Three Weeks  Ago' },
    { id: '4weeksago', label: 'Four Weeks  Ago' },
    { id: 'thismonth', label: 'This Month' },
    { id: 'lastmonth', label: 'Last Month' },
    { id: '2monthsago', label: '2 Months Ago' },
    { id: '3monthsago', label: '3 Months Ago' },
    { id: '4monthsago', label: '4 Months Ago' },
    { id: '6monthsago', label: '6 Months Ago' },
    { id: 'thisquarter', label: 'This Quarter' },
    { id: 'lastquarter', label: 'Last Quarter' },
    { id: 'thisyear', label: 'This Year' },
    { id: 'lastyear', label: 'Last Year' },
    { id: '2yearago', label: 'Two Year Ago' },
    { id: '3yearago', label: 'Three Year Ago' },
    { id: '4yearago', label: 'Four Year Ago' },
  ];

  const InputParameters = [
    { id: 'equal', label: '=' },
    { id: 'startswith', label: 'STARTS WITH' },
    { id: 'endswith', label: 'ENDS WITH' },
    { id: 'include', label: 'INCLUDE' },
    { id: 'isnull', label: 'IS NULL' },
    { id: 'isnotnull', label: 'IS NOT NULL' },
    { id: 'isempty', label: 'IS EMPTY' },
    { id: 'isnotempty', label: 'IS NOT EMPTY' },
    { id: 'regexmatches', label: 'REGULAR EXPRESSION MATCHES' },
    { id: 'regexdoesnotmatches', label: 'REGULAR EXPRESSION DOES NOT MATCH' },
  ]

  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [conditionalDropdownValue, setConditionalDropdownValue] = useState(null);

  const [additionalDropdown1Value, setAdditionalDropdown1Value] = useState(null);
  const [additionalDropdown2Value, setAdditionalDropdown2Value] = useState(null);

  const handleSelect = (event) => {
    setSelectedItem(event.selectedItem);

    // Reset conditional dropdown value when a new item is selected in the first dropdown
    setConditionalDropdownValue(null);

    // Reset additional dropdown values
    setAdditionalDropdown1Value(null);
    setAdditionalDropdown2Value(null);
  };

  const handleConditionalDropdownChange = (event) => {
    setConditionalDropdownValue(event.target.value);

    // Reset additional dropdown values when the conditional dropdown changes
    setAdditionalDropdown1Value(null);
    setAdditionalDropdown2Value(null);
  };

  // Determine whether to display the conditional dropdown based on the selected item
  const shouldDisplayConditionalDropdown = selectedItem.id === 'field';
  // Determine whether to display additional dropdowns based on the selected value of the conditional dropdown
  const shouldDisplayAdditionalDropdowns = conditionalDropdownValue === '1'; // Change '1' to the value for "EVM Audit Event: Date created"
  //Determine whether to display additional dropdowns based on the selected value of the conditional dropdown for values other than "EVM Audit Event: Date created"
  const shouldDisplayAdditionalfields = conditionalDropdownValue !=='1'
  return (
    <>
      <div className='edit-expression-container'>
        <h2 className='heading'>Edit Expression</h2>
        <Button>Undo</Button>
        <Button>Redo</Button>
        <Button kind="secondary">Cancel</Button>
        <br />
        <br />

        <label className='edit-expression-textarea'>{newElement}</label>
        <br />

        <label>Add a Condition: </label>
        <br />
        <Button>and</Button>
        <Button>or</Button>
        <Button>not</Button>
        <br />
        <br />
      </div>

      <div className='edit-expression-container'>
        <h2>Edit Selected Element</h2>

        <Dropdown
          id="my-dropdown"
          items={items}
          selectedItem={selectedItem}
          onChange={handleSelect}
        />

        {/** Conditional dropdown */}
        {shouldDisplayConditionalDropdown && (
          <Select
            id="conditionalDropdown"
            value={conditionalDropdownValue}
            onChange={handleConditionalDropdownChange}
          >
            {ConditionalItems.map((item) => (
              <SelectItem key={item.id} value={item.id} text={item.label} />
            ))}
          </Select>
        )}

        {/** Additional dropdowns */}
        {shouldDisplayAdditionalDropdowns && (
          <>
            <Select
              id="additionalDropdown1"
              value={additionalDropdown1Value}
              onChange={(event) => setAdditionalDropdown1Value(event.target.value)}
            >
              {DateItems.map((item) => (
                <SelectItem key={item.id} value={item.id} text={item.label} />
              ))}
            </Select>
            <br />
            <Select
              id="additionalDropdown2"
              value={additionalDropdown2Value}
              onChange={(event) => setAdditionalDropdown2Value(event.target.value)}
            >
              {shouldDisplayAdditionalDropdowns &&
                DateParameters.map((item) => (
                  <SelectItem key={item.id} value={item.id} text={item.label} />
                ))}
              {shouldDisplayAdditionalfields &&
                InputParameters.map((item) => (
                  <SelectItem key={item.id} value={item.id} text={item.label} />
                ))}
            </Select>

          </>
        )}
        <br />
        <Button>Commit</Button>
        <Button kind="secondary">Discard</Button>
      </div>
    </>
  );
};

export default EditExpression;
