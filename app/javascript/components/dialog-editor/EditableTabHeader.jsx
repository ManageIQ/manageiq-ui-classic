import React, { useRef } from 'react';
import { NavItem, Icon } from 'patternfly-react';
import classNames from 'classnames';
import debounce from 'lodash.debounce';

import { DropZone, FakeDropZone, DraggableItem, itemTypes } from 'ddf-editor';

const EditableTabHeader = ({ name, title, active, single, setActiveTab, dispatch }) => {
  const [{ isDragging }, drag, preview] = DraggableItem({ name, type: itemTypes.TAB_ITEM }, dispatch, 'dropExisting');

  const [{ isOver: isOverLeft }, dropLeft] = DropZone({ name, type: itemTypes.TAB_ITEM }, 'before');
  const [{ isOver: isOverRight }, dropRight] = DropZone({ name, type: itemTypes.TAB_ITEM }, 'after');

  // Create a fake drop zone that allows switching tabs when dragging an input or a section
  const switchTab = debounce(() => setActiveTab(name), 80);
  // switchTab.cancel = () => undefined; // FIXME: workaround for lodash.debounce's missing cancel
  const [, tabSwitch] = FakeDropZone([itemTypes.INPUT, itemTypes.SECTION], switchTab, switchTab.cancel);

  const toolboxRef = useRef(null);
  // Do not fire the tab change when clicking on the edit/delete icon
  const handleSelect = (_, e) => {
    if (!toolboxRef.current.contains(e.target)) {
      setActiveTab(name);
    }
  };

  return (
    <NavItem eventKey={name} active={active} onSelect={handleSelect} className="tab-header-wrapper">
      <span className={classNames({ drag: isDragging })} ref={preview}>
        <div className={classNames({ handle: true, active })} ref={drag} />
        { title }
        <ul className="toolbox" ref={toolboxRef}>
          <li>
            <Icon type="fa" name="pencil" fixedWidth onClick={() => dispatch({ type: 'editStart', target: name })} />
          </li>
          <li className={classNames({ disabled: single })}>
            <Icon type="fa" name="times" fixedWidth onClick={() => (single ? undefined : dispatch({ type: 'delete', source: name }))} />
          </li>
        </ul>
        <div className="vertical-overlay" ref={tabSwitch}>
          <div className={classNames({ 'overlay-left': true, over: isOverLeft })} ref={dropLeft} />
          <div className={classNames({ 'overlay-right': true, over: isOverRight })} ref={dropRight} />
        </div>
      </span>
    </NavItem>
  );
};

export default EditableTabHeader;
