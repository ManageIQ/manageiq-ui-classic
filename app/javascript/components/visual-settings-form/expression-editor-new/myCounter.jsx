import React, { useState, useEffect } from "react";
import useUndoRedo from "./custom-hooks/UseUndoRedo";


function CounterApp() {
  const { state, undo, redo, updatePresent } = useUndoRedo(0);
  const [hasFuture, setHasFuture] = useState(false);

  const handleIncrement = () => {
    const newState = state + 1;
    updatePresent(newState);
  };

  const handleDecrement = () => {
    const newState = state - 1;
    updatePresent(newState);
  };

  useEffect(() => {
    // Update the hasFuture state  teh future state changse
    setHasFuture(redo !== undefined);
  }, [redo]);

  return (
    <div>
      <h1>Counter App</h1>
      <p>Count: {state}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
      <button onClick={undo} disabled={state === 0}>Undo</button>
      <button onClick={redo} disabled={state === 0}>Redo</button>
    </div>
  );
}

export default CounterApp;


