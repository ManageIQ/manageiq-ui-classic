import { useState } from "react";

function useUndoRedo(initialState) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialState);
  const [future, setFuture] = useState([]);

  const undo = () => {
    if (past.length === 0) return;

    const newPast = [...past];
    const newPresent = newPast.pop();

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(newPresent);
  };

  const redo = () => {
    if (future.length === 0) return;

    const newFuture = [...future];
    const newPresent = newFuture.shift();

    setPast([...past, present]);
    setFuture(newFuture);
    setPresent(newPresent);
  };


  const updatePresent = (newState) => {
    setPast([...past, present]);
    setFuture([]);
    setPresent(newState);
  };

  return { state: present, undo, redo, updatePresent };
}

export default useUndoRedo;
