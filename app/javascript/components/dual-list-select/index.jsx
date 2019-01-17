import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'patternfly-react';
import List from './list';
import { filterOptions } from './helpers';

class DualListSelect extends Component {
  constructor(props) {
    super(props);
    this.leftList = React.createRef();
    this.rightList = React.createRef();
  }

  moveLeft = (rightValues) => {
    const { input: { onChange } } = this.props;
    const selectedItems = Array.prototype.map.call(this.rightList.current.selectedOptions, ({ value }) => value);
    const reducedItems = rightValues.filter(({ key }) => !selectedItems.includes(key));

    onChange([
      ...reducedItems,
    ]);
  };

  moveRight = () => {
    const { input: { onChange, value }, options } = this.props;
    const selectedItems = Array.prototype.map.call(this.leftList.current.selectedOptions, ({ value }) => value);
    const movedItems = options.filter(({ key }) => selectedItems.includes(key));

    onChange([
      ...value,
      ...movedItems,
    ]);
  };

  moveAllRight = (leftValues) => {
    const { input: { onChange, value } } = this.props;

    onChange([
      ...value,
      ...leftValues,
    ]);
  };

  moveAllLeft = () => {
    const { input: { onChange } } = this.props;

    onChange([]);
  };

  render() {
    const {
      input: { value = [] },
      options,
      leftId,
      rightId,
      leftTitle,
      rightTitle,
      size,
      allToRight,
      allToLeft,
      moveLeftTitle,
      moveRightTitle,
      moveAllLeftTitle,
      moveAllRightTitle,
    } = this.props;
    const leftValues = filterOptions(options, value);
    const rightValues = value;

    return (
      <div>
        <div className="col-md-5">
          {leftTitle}
          <List size={size} ref={this.leftList} id={leftId} values={leftValues} />
        </div>
        <div className="col-md-1" style={{ padding: 10 }}>
          <div className="spacer" />
          <div className="spacer" />
          <Button disabled={leftValues.length === 0} className="btn-block" onClick={this.moveRight} title={moveRightTitle}>
            <Icon type="fa" name="angle-right" size="lg" />
          </Button>
          {allToRight
            && (
              <Button
                disabled={leftValues.length === 0}
                className="btn-block"
                onClick={() => this.moveAllRight(leftValues)}
                title={moveAllRightTitle}
              >
                <Icon type="fa" name="angle-double-right" size="lg" />
              </Button>
            )}
          {allToLeft
            && (
              <Button disabled={rightValues.length === 0} className="btn-block" onClick={this.moveAllLeft} title={moveAllLeftTitle}>
                <Icon type="fa" name="angle-double-left" size="lg" />
              </Button>
            )}
          <Button disabled={rightValues.length === 0} className="btn-block" onClick={() => this.moveLeft(rightValues)} title={moveLeftTitle}>
            <Icon type="fa" name="angle-left" size="lg" />
          </Button>
        </div>
        <div className="col-md-5">
          {rightTitle}
          <List size={size} ref={this.rightList} id={rightId} values={rightValues} />
        </div>
      </div>);
  }
}

DualListSelect.propTypes = {
  /* ID of the left select */
  leftId: PropTypes.string,
  /* ID of the right select */
  rightId: PropTypes.string,
  /* Title above left select */
  leftTitle: PropTypes.string,
  /* Title above right select */
  rightTitle: PropTypes.string,
  /* Size of select */
  size: PropTypes.number,
  /* Should show button "move all to right" */
  allToRight: PropTypes.bool,
  /* Should show button "move all to left" */
  allToLeft: PropTypes.bool,
  /* Title of move left button */
  moveLeftTitle: PropTypes.string,
  /* Title of move right button */
  moveRightTitle: PropTypes.string,
  /* Title of move all right button */
  moveAllRightTitle: PropTypes.string,
  /* Title of move all left button */
  moveAllLeftTitle: PropTypes.string,
  /* Options:
    [
      {key: 'key', label: 'label'},
      ...
    ]
  */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
      [PropTypes.string]: PropTypes.string,
    }),
  ),
};

DualListSelect.defaultProps = {
  leftId: undefined,
  rightId: undefined,
  leftTitle: undefined,
  rightTitle: undefined,
  size: 15,
  allToRight: true,
  allToLeft: false,
  moveLeftTitle: __('Move selected to left'),
  moveRightTitle: __('Move selected to right'),
  moveAllRightTitle: __('Move all to right'),
  moveAllLeftTitle: __('Move all to left'),
  options: [],
};

const WrappedDualList = ({ FieldProvider, name, ...rest }) => (
  <FieldProvider
    name={name}
    {...rest}
    component={props => <DualListSelect {...props} />}
  />
);

export default WrappedDualList;
