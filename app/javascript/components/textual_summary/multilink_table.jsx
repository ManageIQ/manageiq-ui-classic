import * as React from 'react';
import PropTypes from 'prop-types';
import IconOrImage from './icon_or_image';
import MiqStructuredList from '../miq-structured-list';
import { onClick } from '../breadcrumbs/on-click-functions';

export default function MultilinkTable(props) {
  const renderLink = (sub, i, onClick) => (
    <td
      key={i}
      title={sub.title}
      className="hover"
      style={{ cursor: 'pointer, hand' }}
    >
      <a href={sub.link} onClick={(e) => onClick(sub, e)}>
        <IconOrImage icon={sub.icon} image={sub.image} title={sub.title} />
        {sub.value}
      </a>
    </td>
  );

  const renderNonLink = (sub, i) => (
    <td key={i} title={sub.title}>
      <IconOrImage icon={sub.icon} image={sub.image} title={sub.title} />
      {sub.value}
    </td>
  );

  const renderLinkOrNolink = (sub, i) => (
    sub.link ? renderLink(sub, i, props.onClick) : renderNonLink(sub, i)
  );

  const renderLine = (item, j) => (
    <tr key={j} className="no-hover">
      <td className="hover">
        <IconOrImage icon={item.icon} image={item.image} title={item.title} />
        {item.value}
      </td>
      {item.sub_items.map((subitem, i) => renderLinkOrNolink(subitem, i))}
    </tr>
  );

  const { title, items } = props;

  return (
    <>
      <MiqStructuredList
        rows={items}
        title={title}
        mode="multilink_table"
        onClick={(item, event) => onClick(item, event)}
      />
      <table className="table table-bordered table-striped table-summary-screen multilink_table">
        <thead>
          <tr>
            <th colSpan="100">
              {title}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => renderLine(item, i))}
        </tbody>
      </table>
    </>
  );
}

MultilinkTable.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};
