import React from 'react';
import PropTypes from 'prop-types';
import { dragItems } from './data';

/** Component to render the components list vertically on left side.
 * Components can be used to drag and drop into the tab Contents */
const DynamicComponentChooser = ({ list, onDragStartComponent }) => (
  <div className="components-list-wrapper">
    {
      list.map((item, index) => (
        <div
          title={`Drag and Drop a ${item.title.toLowerCase()} to any section`}
          id={item.id}
          className="component-item-wrapper"
          draggable="true"
          onDragStart={(event) => onDragStartComponent(event, dragItems.COMPONENT)}
          key={index.toString()}
        >
          <div className="component-item">
            {item.icon}
            {item.title}
          </div>
        </div>
      ))
    }
  </div>
);

DynamicComponentChooser.propTypes = {
  list: PropTypes.arrayOf(PropTypes.any).isRequired,
  onDragStartComponent: PropTypes.func.isRequired,
};

export default DynamicComponentChooser;
