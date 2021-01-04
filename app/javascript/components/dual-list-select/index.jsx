import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon,
  Grid,
  Row,
  Col,
} from 'patternfly-react';
import { isEqual } from 'lodash';
import List from './list';

import { useFieldApi } from '@@ddf';

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

  handleOptionClicked = (event, options, isRight) => {
    const { target: { value } } = event;
    const selectedKey = isRight ? 'selectedRightValues' : 'selectedLeftValues';
    const lastKey = isRight ? 'lastRightClicked' : 'lastLeftClicked';
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

  handleMoveRight = () => {
    this.props.input.onChange([...this.props.input.value, ...this.state.selectedRightValues]);
    this.setState({ selectedRightValues: [] });
  }

  handleMoveLeft = () => {
    this.props.input.onChange(this.props.input.value.filter(value => !this.state.selectedLeftValues.includes(value)));
    this.setState({ selectedLeftValues: [] });
  }

  render() {
    const {
      allToLeft,
      allToRight,
      input: { value, onChange },
      leftTitle,
      moveAllLeftTitle,
      moveAllRightTitle,
      moveRightTitle,
      moveLeftTitle,
      options,
      rightTitle,
      size,
    } = this.props;
    const leftValues = options.filter(option => !value.includes(option.key));
    const rightValues = options.filter(option => value.includes(option.key));
    return (
      <div className="dual-list">
        <Grid fluid>
          <Row>
            <Col md={5}>
              {leftTitle}
              <List size={size} optionClick={event => this.handleOptionClicked(event, leftValues, true)} value={leftValues} />
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
                  onClick={() => this.setState({ selectedRightValues: [] }, () => onChange(options.map(({ key }) => key)))}
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
                  onClick={() => this.setState({ selectedLeftValues: [] }, () => onChange([]))}
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
              <List size={size} optionClick={event => this.handleOptionClicked(event, rightValues, false)} value={rightValues} />
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
};

const WrappedDualList = (props) => {
  const { input, ...rest } = useFieldApi({
    ...props,
    subscription: {
      error: true,
      pristine: true,
      value: true,
    },
    isEqual: (current, initial) => isEqual([...current || []].sort(), [...initial || []].sort()),
  });

  return <DualList input={input} {...rest} />;
};

export default WrappedDualList;
