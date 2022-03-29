import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import { Close16 } from '@carbon/icons-react';

const WidgetZoom = ({
  widgetTitle, widget, footer,
}) => {
  const zoomedWidget = (
    <div id="lightbox_div">
      <div id="zoomed_chart_div">
        <div className="card-pf">
          <div className="card-pf-heading">
            <h2 className="card-pf-title">
              {widgetTitle}
              <Button
                className="closeButton"
                kind="ghost"
                renderIcon={Close16}
                hasIconOnly
                iconDescription={__('Close')}
                onClick={() => {
                  document.getElementById('lightbox-panel').style.display = 'none';
                }}
              />
            </h2>
          </div>
          <div className="card-pf-body">
            {widget}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );

  return zoomedWidget;
};

WidgetZoom.propTypes = {
  widgetModel: PropTypes.string,
};

WidgetZoom.defaultProps = {
  widgetModel: undefined,
};

export default WidgetZoom;
