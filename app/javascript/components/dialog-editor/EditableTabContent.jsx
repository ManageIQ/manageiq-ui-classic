import React from 'react';
import { TabPane, Icon } from 'patternfly-react';
import classNames from 'classnames';

import { DropZone, itemTypes } from 'ddf-editor';

const EditableTabContent = ({ name, fields, formOptions, dispatch }) => {
  const [{ isOver: isOverEmpty }, dropEmpty] = DropZone({ name, type: itemTypes.SECTION }, 'child');

  return (
    <TabPane key={name} eventKey={name}>
      { formOptions.renderForm(fields, formOptions) }
      { fields.length === 0 &&
        <div className={classNames({ empty: true, over: isOverEmpty })} ref={dropEmpty} />
      }
      <div className="section-wrapper">
        <div className="item new-section" onClick={() => dispatch({ type: 'newSection', target: name })}>
          <Icon type="fa" name="plus" fixedWidth />
          New section
        </div>
      </div>
    </TabPane>
  );
};

export default EditableTabContent;
