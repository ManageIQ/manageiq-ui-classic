/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, BreadcrumbItem } from 'carbon-components-react';
import { unescape } from 'lodash';
import { onClickTree, onClick, onClickToExplorer } from './on-click-functions';

// FIXME: don't parse html here
const parsedText = (text) => unescape(text).replace(/<[/]{0,1}strong>/g, '');

const renderItems = ({ items, controllerName }) => items
  .filter((_item, index) => index !== (items.length - 1))
  .map((item, index) => {
    const text = parsedText(item.title);
    if (item.action || (!item.url && !item.key && !item.to_explorer)) {
      return <li key={index} className="inactive-item">{text}</li>;
    }

    if (item.key || item.to_explorer) {
      return (
        <BreadcrumbItem
          key={`${item.key}-${index}`}
          href="#"
          onClick={(e) =>
            (item.to_explorer
              ? onClickToExplorer(e, controllerName, item.to_explorer)
              : onClickTree(e, controllerName, item))}
        >
          {text}
        </BreadcrumbItem>
      );
    }

    return (
      <BreadcrumbItem
        key={item.url || index}
        href={item.url}
        onClick={(e) => onClick(e, item.url)}
      >
        {text}
      </BreadcrumbItem>
    );
  });

export const Breadcrumbs = ({ items, title, controllerName }) => (
  <Breadcrumb noTrailingSlash>
    {items && renderItems({ items, controllerName })}
    <BreadcrumbItem isCurrentPage>
      <strong>
        {items && items.length > 0 ? parsedText(items[items.length - 1].title) : parsedText(title)}
      </strong>
    </BreadcrumbItem>
  </Breadcrumb>
);

Breadcrumbs.propTypes = {
  controllerName: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.string,
    key: PropTypes.string,
    title: PropTypes.string.isRequired,
    url: PropTypes.string,
  })),
  title: PropTypes.string.isRequired,
};

Breadcrumbs.defaultProps = {
  items: null,
};
