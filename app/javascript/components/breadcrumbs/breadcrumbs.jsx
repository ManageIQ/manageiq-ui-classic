import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'patternfly-react';
import { unescape } from 'lodash';

import { onClickTree, onClick, onClickToExplorer } from './on-click-functions';

// FIXME: don't parse html here
const parsedText = (text) => unescape(text).replace(/<[/]{0,1}strong>/g, '');

const renderItems = ({ items, controllerName }) => items
  .filter((_item, index) => index !== (items.length - 1))
  .map((item, index) => {
    const text = parsedText(item.title);
    if (item.action || (!item.url && !item.key && !item.to_explorer)) {
      // eslint-disable-next-line react/no-array-index-key
      return <li key={index}>{text}</li>;
    }

    if (item.key || item.to_explorer) {
      return (
        <Breadcrumb.Item
          // eslint-disable-next-line react/no-array-index-key
          key={`${item.key}-${index}`}
          onClick={(e) =>
            (item.to_explorer
              ? onClickToExplorer(e, controllerName, item.to_explorer)
              : onClickTree(e, controllerName, item))}
        >
          {text}
        </Breadcrumb.Item>
      );
    }

    return (
      <Breadcrumb.Item
        key={item.url || index}
        href={item.url}
        onClick={(e) => onClick(e, item.url)}
      >
        {text}
      </Breadcrumb.Item>
    );
  });

export const Breadcrumbs = ({ items, title, controllerName }) => (
  <Breadcrumb>
    {items && renderItems({ items, controllerName })}
    <Breadcrumb.Item active>
      <strong>
        {items && items.length > 0 ? parsedText(items[items.length - 1].title) : parsedText(title)}
      </strong>
    </Breadcrumb.Item>
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
