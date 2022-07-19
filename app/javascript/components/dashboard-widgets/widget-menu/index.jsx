import React from 'react';
import PropTypes from 'prop-types';

const WidgetMenu = ({ widgetModel }) => {
  let widget;
  const links = [];
  widgetModel.forEach((link) => {
    links.push(
      <tr key={link.description}>
        <td>
          <a title={`${__('Click to go this location')}`} href={link.href}>
            {link.description}
          </a>
        </td>
      </tr>
    );
  });
  if (widgetModel) {
    widget = (
      <table className="table table-hover">
        <tbody>
          {links}
        </tbody>
      </table>
    );
  } else {
    widget = (
      <h1 id="empty-widget">
        {__('No shortcuts are authorized for this user, contact your Administrator')}
      </h1>
    );
  }
  return widget;
};

WidgetMenu.propTypes = {
  widgetModel: PropTypes.arrayOf(PropTypes.any),
};

WidgetMenu.defaultProps = {
  widgetModel: undefined,
};

export default WidgetMenu;
