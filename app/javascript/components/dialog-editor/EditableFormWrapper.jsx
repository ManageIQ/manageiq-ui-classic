import React, { useContext } from 'react';
import { Icon } from 'patternfly-react';

import { ReducerContext } from 'ddf-editor';

const EditableFormWrapper = (Component) => {
  const fn = ({ ...props }) => {
    const dispatch = useContext(ReducerContext);

    return (
      <div className="form-wrapper">
        <div className="toolbox">
          <ul>
            <li>
              <Icon type="fa" name="pencil" fixedWidth onClick={() => dispatch({ type: 'editStart', target: undefined })} />
            </li>
          </ul>
        </div>
        <Component {...props} />
      </div>
    );
  };

  return fn;
};

export default EditableFormWrapper;
