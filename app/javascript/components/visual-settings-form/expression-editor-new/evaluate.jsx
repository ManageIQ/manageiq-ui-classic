import React, { useState } from 'react';

const Evaluate = () => {
  const [selectedOption1, setSelectedOption1] = useState('');
  const [selectedOption2, setSelectedOption2] = useState('');
  const [labels, setLabels] = useState([]);

  const handleDropdownChange1 = (e) => {
    setSelectedOption1(e.target.value);
  };

  const handleDropdownChange2 = (e) => {
    setSelectedOption2(e.target.value);
  };

  const handleLabelClick = (index) => {
    console.log(`Clicked on ${labels[index]}`);
  };

  const handleButtonClick = () => {
    if (selectedOption1 && selectedOption2) {
      const combinedLabel = `${selectedOption1} - ${selectedOption2}`;
      setLabels([...labels, combinedLabel]);
      setSelectedOption1('');
      setSelectedOption2('');
    }
  };

  return (
    <div className="Evaluate">
      <h1>Clickable Labels</h1>
      <div>
        <select value={selectedOption1} onChange={handleDropdownChange1}>
          <option value="">Select an option</option>
          <option value="Option 1">Option 1</option>
          <option value="Option 2">Option 2</option>
          <option value="Option 3">Option 3</option>
        </select>
        <select value={selectedOption2} onChange={handleDropdownChange2}>
          <option value="">Select another option</option>
          <option value="Value A">Value A</option>
          <option value="Value B">Value B</option>
          <option value="Value C">Value C</option>
        </select>
      </div>
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
