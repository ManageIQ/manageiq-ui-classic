import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'patternfly-react';
import { unescape } from 'lodash';

const parsedText = text => unescape(text).replace(/<[/]{0,1}strong>/g, '');

class Breadcrumbs extends Component {
  constructor(props) {
    super(props);
    this.state = { nodes: [] };
  }

  componentDidMount() {
    const { tree, node } = this.props;

    this.subscription = window.listenToRx((event) => {
      if (event.treeNodeHierarchy) {
        this.setState({ nodes: event.treeNodeHierarchy });
      }
    });

    setTimeout(() => sendDataWithRx({
      requestNodeHierarchy: node,
      tree,
    }));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const {
      items, controllerName, title, ...rest
    } = this.props;

    const { nodes } = this.state;
    // This head-tail is a little different: the head is an array of items while the tail is the last item.
    const head = items.concat(nodes); // We are expecting incoming tree nodes from Rx through the state
    const tail = head.pop();

    // Map the head items one-by-one to Breadcrumb.Item components
    const renderedItems = (head).map((item, index) => {
      const text = parsedText(item.title);

      if ((item.url || item.key) && !item.action) {
        const clickFn = () => sendDataWithRx({
          breadcrumbSelect: {
            path: `/${controllerName}/tree_select`,
            key: item.key,
          },
        });

        return (
          <Breadcrumb.Item key={`${item.key}-${index + 0}`} onClick={clickFn}>
            { text }
          </Breadcrumb.Item>
        );
      }

      return (
        <Breadcrumb.Item key={item.url || (index + 0)} href={item.url}>
          { text }
        </Breadcrumb.Item>
      );
    });

    return (
      // Display the mapped (head) items first and then map the last (tail) item as active
      <Breadcrumb style={{ marginBottom: 0 }} {...rest}>
        {items && renderedItems}
        <Breadcrumb.Item active>
          <strong>
            {tail ? parsedText(tail.title) : parsedText(title)}
          </strong>
        </Breadcrumb.Item>
      </Breadcrumb>
    );
  }
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape(
    {
      title: PropTypes.string.isRequired,
      url: PropTypes.string,
      action: PropTypes.string,
      key: PropTypes.string,
    },
  )),
  title: PropTypes.string,
  controllerName: PropTypes.string,
  tree: PropTypes.string,
  node: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  items: undefined,
  title: undefined,
  controllerName: undefined,
  tree: undefined,
  node: undefined,
};

export default Breadcrumbs;
