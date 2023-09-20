// Evaluate.jsx
import React, { useState } from 'react';

const Evaluate = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [labels, setLabels] = useState([]);

  const handleDropdownChange = (e) => {
    const newLabel = e.target.value;
    setSelectedOption(newLabel);
  };

  const handleLabelClick = (index) => {
    // Handle the click event - in the handleandclick for expresion-editor
    console.log(`Clicked on ${labels[index]}`);
  };

  const handleButtonClick = () => {
    if (selectedOption) {
      setLabels([...labels, selectedOption]);
      setSelectedOption('');
    }
  };

  return (
    <div className="Evaluate">
      <h1>Clickable Labels</h1>
      <select value={selectedOption} onChange={handleDropdownChange}>
        <option value="">Select an option</option>
        <option value="Option 1">Option 1</option>
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
      <div>
        {labels.map((label, index) => (
          <span
            key={index}
            className="clickable-label"
            onClick={() => handleLabelClick(index)}
          >
            {label}
          </span>
        ))}
      </div>
      <button onClick={handleButtonClick}>Add Label</button>
    </div>
  );
};

export default Evaluate;
