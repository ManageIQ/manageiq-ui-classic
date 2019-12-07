import React from 'react';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';

import { DropZone, DraggableItem } from 'ddf-editor';

const type = 'option';

const FieldArrayItem = ({
  FieldProvider,
  fields,
  fieldIndex,
  name,
  value,
  dataType,
  dispatch,
  formOptions,
}) => {
  const [labelField, valueField] = fields.map(field => ({ ...field, name: `${name}.${field.name}` }));

  const [{ isDragging }, drag, preview] = DraggableItem({ name: fieldIndex, type, formOptions }, dispatch, 'dropOption');

  const [{ isOver: isOverTop }, dropTop] = DropZone({ name: fieldIndex, type }, 'before');
  const [{ isOver: isOverBottom }, dropBottom] = DropZone({ name: fieldIndex, type }, 'after');

  return (
    <div className={classNames({ 'option-wrapper': true, drag: isDragging })} ref={preview}>
      <div className="handle" ref={drag} />
      <div className="item">
        <div className="option-label">
          {
            formOptions.renderForm([labelField])
          }
        </div>
        <div className="option-value">
          {
            formOptions.renderForm([{ ...valueField, dataType}])
          }
        </div>
        <div className="option-default">
          <FieldProvider name="initialValue">
            { ({ input: { value: initialValue } }) => {
              const initialValues = Array.isArray(initialValue) ? initialValue : [initialValue];
              const checked = initialValues.includes(value);

              return (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => dispatch({ type: 'checkDefault', formOptions, checked, target: fieldIndex })}
                />
              );
            } }
          </FieldProvider>
        </div>
      </div>
      <div className="toolbox">
        <Icon type="fa" name="times" fixedWidth onClick={() => dispatch({ type: 'removeOption', target: fieldIndex })} />
      </div>
      <div className="horizontal-overlay">
        <div className={classNames({ 'overlay-top': true, over: isOverTop })} ref={dropTop} />
        <div className={classNames({ 'overlay-bottom': true, over: isOverBottom })} ref={dropBottom} />
      </div>
    </div>
  );
};

export default FieldArrayItem;
