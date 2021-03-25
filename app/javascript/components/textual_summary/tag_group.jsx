import * as React from 'react';
import PropTypes from 'prop-types';
import IconOrImage from './icon_or_image';

/**
 * Render a group of tags in a table.
 */
export default class TagGroup extends React.Component {
  /**
   * Render a simple row. Label, icon, value.
   */
  renderTagRowSimple = item => (
    <tr key={item.key} className={item.link ? '' : 'no-hover'}>
      <td className="label">{item.label}</td>
      {(item.link && this.props.onClick) &&
      <td title={item.title}>
        <a href={item.link} onClick={e => this.props.onClick(item, e)}>
          <IconOrImage icon={item.icon} image={item.image} title={item.title} />
          {' '}
          {item.value}
        </a>
      </td>
      }
      {(item.link === undefined) &&
      <td title={item.title}>
        <IconOrImage icon={item.icon} image={item.image} title={item.title} />
        {' '}
        {item.value}
      </td>
      }
    </tr>
  );

  /**
   * Render a list of values joined with "<b> | </b>", with or without label
   */
  renderSubitemList = subitem => (
    <span>
      &nbsp;
      {subitem.label && `${subitem.label}: `}{Array.isArray(subitem.value) && subitem.value.map((val, index) => (
        <React.Fragment key={index}>
          {val}
          {(index < subitem.value.length - 1) && <b>&nbsp;|&nbsp;</b>}
        </React.Fragment>
      ))}
    </span>
  );

  /**
   * Render a single value, with or without label
   */
  renderSubitem = subitem => (
    <span>
      &nbsp;
      {subitem.label && `${subitem.label}: `}
      {subitem.value}
    </span>
  );

  /**
   * Render a row. Rows can be simple or with multiple values.
   */
  renderTagRow = item => (Array.isArray(item.value) ? this.renderTagRowMultivalue(item) : this.renderTagRowSimple(item));

  /**
   * Render a multi-value row. This is done by using rowspan in the left column.
   */
  renderTagRowMultivalue = item => (
    <React.Fragment key={item.key}>
      {item.value.map((subitem, index) => (
        <tr key={index} className={item.link ? '' : 'no-hover'}>
          {(index === 0) && (
          <td rowSpan={item.value.length} className="label" title={item.title}>{item.label}</td>
            )}
          {(subitem.link && this.props.onClick) &&
          <td title={subitem.title}>
            <a href={subitem.link} onClick={e => this.props.onClick(subitem, e)}>
              <IconOrImage icon={subitem.icon} image={subitem.image} text={subitem.text} />
              {Array.isArray(subitem.value) ? this.renderSubitemList(subitem) : this.renderSubitem(subitem)}
            </a>
          </td>
      }
          {(subitem.link === undefined) &&
          <td title={subitem.title}>
            <IconOrImage icon={subitem.icon} image={subitem.image} text={subitem.text} />
            {Array.isArray(subitem.value) ? this.renderSubitemList(subitem) : this.renderSubitem(subitem)}
          </td>
      }
        </tr>
        ))}
    </React.Fragment>
  );

  render() {
    return (
      <table className="table table-bordered table-hover table-striped table-summary-screen">
        <thead>
          <tr>
            <th colSpan="2" align="left">{this.props.title}</th>
          </tr>
        </thead>
        <tbody>
          {this.props.items.map((item, i) => this.renderTagRow({ key: i, ...item }))}
        </tbody>
      </table>
    );
  }
}

TagGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.any.isRequired,
  onClick: PropTypes.func,
};
