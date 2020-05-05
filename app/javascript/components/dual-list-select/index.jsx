import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon,
  Grid,
  Row,
  Col,
} from 'patternfly-react';
import { groupBy, isEqual, map as pluck } from 'lodash';
import List from './list';

const getOptionsGroup = (value, lastClicked, options) => {
  const lastIndex = options.map(({ key }) => key.toString()).indexOf(lastClicked.toString());
  const currentIndex = options.map(({ key }) => key.toString()).indexOf(value);
  const startIndex = Math.min(lastIndex, currentIndex);
  const endIndex = Math.max(lastIndex, currentIndex) + 1;
  return [...options.slice(startIndex, endIndex).map(({ key }) => key.toString())];
};

class DualList extends Component {
  state = {
    lastRightClicked: undefined,
    selectedRightValues: [],
    lastLeftClicked: undefined,
    selectedLeftValues: [],
  };

  handleOptionClicked = (event, options, side) => {
    const { target: { value } } = event;
    const selectedKey = side === 'right' ? 'selectedRightValues' : 'selectedLeftValues';
    const lastKey = side === 'right' ? 'lastRightClicked' : 'lastLeftClicked';
    if (event.shiftKey && this.state[lastKey]) {
      this.setState(prevState => ({ [selectedKey]: getOptionsGroup(value, prevState[lastKey], options) }));
    } else if (event.ctrlKey && this.state[lastKey]) {
      this.setState((prevState) => {
        const selectedValues = prevState[selectedKey].includes(value)
          ? prevState[selectedKey].filter(item => item !== value)
          : [...prevState[selectedKey], value];
        return { [selectedKey]: selectedValues };
      });
    } else {
      this.setState({ [selectedKey]: [value] });
    }
    this.setState({ [lastKey]: value });
  };

  handleAll = (targetSide) => {
    const {
      input: { onChange },
      options,
      selectedSide,
    } = this.props;

    const sourceKey = targetSide === 'left' ? 'selectedRightValues' : 'selectedLeftValues';

    // all or none
    onChange(selectedSide === targetSide ? pluck(options, 'key') : []);

    this.setState({ [sourceKey]: [] });
  }

  handleAllLeft = () => {
    this.handleAll('left');
  }

  handleAllRight = () => {
    this.handleAll('right');
  }

  handleMove = (targetSide) => {
    const {
      input: { value, onChange },
      selectedSide,
    } = this.props;

    const sourceKey = targetSide === 'left' ? 'selectedRightValues' : 'selectedLeftValues';

    if (targetSide === selectedSide) {
      // add item to input
      onChange([...value, ...this.state[sourceKey]]);
    } else {
      // remove item from input
      onChange(value.filter(value => !this.state[sourceKey].includes(value)));
    }

    this.setState({ [sourceKey]: [] });
  }

  handleMoveLeft = () => {
    this.handleMove('left');
  }

  handleMoveRight = () => {
    this.handleMove('right');
  }

  render() {
    const {
      allToLeft,
      allToRight,
      input: { value },
      leftTitle,
      moveAllLeftTitle,
      moveAllRightTitle,
      moveRightTitle,
      moveLeftTitle,
      options,
      rightTitle,
      size,
      selectedSide,
    } = this.props;

    const groupedValues = groupBy(options, (option) => !!value.includes(option.key));
    const leftValues = groupedValues[selectedSide === 'left'] || [];
    const rightValues = groupedValues[selectedSide === 'right'] || [];

    return (
      <div className="dual-list">
        <Grid fluid>
          <Row>
            <Col md={5}>
              {leftTitle}
              <List size={size} optionClick={event => this.handleOptionClicked(event, leftValues, 'left')} value={leftValues} />
            </Col>
            <Col md={2} className="buttons-block">
              <div className="spacer" />
              <div className="spacer" />
              <Button
                disabled={leftValues.length === 0}
                className="btn-block dual-list-button"
                onClick={this.handleMoveRight}
                title={moveRightTitle}
                type="button"
              >
                <Icon type="fa" name="angle-right" size="lg" />
              </Button>
              {
                allToRight && (
                <Button
                  disabled={leftValues.length === 0}
                  className="btn-block dual-list-button"
                  onClick={this.handleAllRight}
                  title={moveAllRightTitle}
                  type="button"
                >
                  <Icon type="fa" name="angle-double-right" size="lg" />
                </Button>
                )
              }
              {
                allToLeft && (
                <Button
                  disabled={rightValues.length === 0}
                  className="btn-block dual-list-button"
                  onClick={this.handleAllLeft}
                  title={moveAllLeftTitle}
                  type="button"
                >
                  <Icon type="fa" name="angle-double-left" size="lg" />
                </Button>
                )
              }
              <Button
                disabled={rightValues.length === 0}
                className="btn-block dual-list-button"
                onClick={this.handleMoveLeft}
                title={moveLeftTitle}
                type="button"
              >
                <Icon type="fa" name="angle-left" size="lg" />
              </Button>
            </Col>
            <Col md={5}>
              {rightTitle}
              <List size={size} optionClick={event => this.handleOptionClicked(event, rightValues, 'right')} value={rightValues} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}


DualList.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  size: PropTypes.number,
  moveLeftTitle: PropTypes.string,
  moveRightTitle: PropTypes.string,
  input: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  allToLeft: PropTypes.bool,
  allToRight: PropTypes.bool,
  moveAllLeftTitle: PropTypes.string,
  moveAllRightTitle: PropTypes.string,
  selectedSide: PropTypes.oneOf(['left', 'right']),
};

DualList.defaultProps = {
  leftTitle: __('Options'),
  rightTitle: __('Selected'),
  size: 15,
  moveLeftTitle: __('Move selected to left'),
  moveRightTitle: __('Move selected to right'),
  moveAllRightTitle: __('Move all to right'),
  moveAllLeftTitle: __('Move all to left'),
  options: [],
  allToLeft: false,
  allToRight: false,
  selectedSide: 'right',
};

const WrappedDualList = ({ FieldProvider, name, ...rest }) => (
  <FieldProvider
    name={name}
    {...rest}
    subscription={{ error: true, pristine: true, value: true }}
    isEqual={(current, initial) => isEqual([...current || []].sort(), [...initial || []].sort())}
    component={DualList}
  />
);

export default WrappedDualList;
