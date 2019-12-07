import React, { useContext } from 'react';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';

import { ReducerContext, DropZone, DraggableItem, itemTypes } from 'ddf-editor';

const EditableSection = (Component) => {
  const fn = ({ visible, ...props }) => {
    const dispatch = useContext(ReducerContext);

    const { name, fields } = props;

    const [{ isDragging }, drag, preview] = DraggableItem({ name, type: itemTypes.SECTION }, dispatch, 'dropExisting');

    const [{ isOver: isOverTop }, dropTop] = DropZone({ name, type: itemTypes.SECTION }, 'before');
    const [{ isOver: isOverBottom }, dropBottom] = DropZone({ name, type: itemTypes.SECTION }, 'after');
    // When there are no items in the section, an empty item is automatically added to add some padding to
    // the section and also to act as a drop zone for adding children into the section.
    const [{ isOver: isOverEmpty }, dropEmpty] = DropZone({ name, type: itemTypes.INPUT }, 'child');

    return (
      <div className={classNames({ 'section-wrapper': true, drag: isDragging })} ref={preview}>
        <div className="handle" ref={drag} />
        <div className="item">
          <Component {...props} />
          {fields.length === 0 &&
            <div className={classNames({ empty: true, over: isOverEmpty })} ref={dropEmpty} />
          }
        </div>
        <div className="toolbox">
          <ul>
            <li>
              <Icon type="fa" name="pencil" fixedWidth onClick={() => dispatch({ type: 'editStart', target: name })} />
            </li>
            <li>
              <Icon type="fa" name="times" fixedWidth onClick={() => dispatch({ type: 'delete', source: name })} />
            </li>
          </ul>
        </div>
        <div className="horizontal-overlay">
          <div className={classNames({ 'overlay-top': true, over: isOverTop })} ref={dropTop} />
          <div className={classNames({ 'overlay-bottom': true, over: isOverBottom })} ref={dropBottom} />
        </div>
      </div>
    );
  };

  return fn;
};

export default EditableSection;
