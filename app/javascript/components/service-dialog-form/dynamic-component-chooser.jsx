import PropTypes from 'prop-types';
import { fieldComponents } from './data';

const DynamicComponentChooser = ({ onDragStart }) => (
  <div className="dynamic-component-chooser">
    <div className="dynamic-component-chooser__title">
      {__('Fields')}
    </div>
    <div className="dynamic-component-chooser__items">
      {fieldComponents.map(({ id, label, icon: Icon }) => (
        <div
          key={id}
          className="dynamic-component-chooser__item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'copy';
            if (onDragStart) onDragStart(id);
          }}
          role="button"
          tabIndex={0}
          aria-label={sprintf(__('Drag %s into dialog'), label)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (onDragStart) onDragStart(id);
            }
          }}
        >
          {Icon && <Icon size={16} className="dynamic-component-chooser__icon" />}
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

DynamicComponentChooser.propTypes = {
  onDragStart: PropTypes.func,
};

DynamicComponentChooser.defaultProps = {
  onDragStart: undefined,
};

export default DynamicComponentChooser;
