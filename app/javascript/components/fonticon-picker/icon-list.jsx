import React, { useMemo } from 'react';
import { Grid, Row, Col } from 'patternfly-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const isFontIcon = (value, family) => value.selectorText && value.selectorText.includes(`.${family}-`) && value.cssText.includes('content:');

const clearRule = (rule, family) => {
  const re = new RegExp(`.*(${family}\-[a-z0-9\-\_]+).*`);
  return rule.replace(re, '$1');
};

const findIcons = family => _.chain(document.styleSheets)
  .map(oneSheet => oneSheet.cssRules)
  .map(rule => _.filter(rule, value => isFontIcon(value, family)))
  .filter(rules => rules.length !== 0)
  .map(rules => _.map(rules, value => clearRule(value.selectorText, family)))
  .flatten()
  .value()
  .map(icon => `${family} ${icon}`);

const IconList = ({ type, activeIcon, activeTab, setState }) => {
  const icons = useMemo(() => findIcons(type), [type]);

  // Short path for not rendering the icons if the tab isn't active
  if (activeTab !== type) {
    return <div />;
  }

  return (
    <Grid fluid>
      <Row>
        { icons.map(icon => (
          <Col xs={1} key={icon} className="fonticon" onClick={() => setState(state => ({ ...state, activeIcon: icon }))}>
            <span className={classNames({ active: icon === activeIcon })}>
              <i className={icon} title={icon.replace(' ', '.')} />
            </span>
          </Col>
        )) }
      </Row>
    </Grid>
  );
};

IconList.propTypes = {
  type: PropTypes.string.isRequired,
  activeIcon: PropTypes.string,
  activeTab: PropTypes.string,
  setState: PropTypes.func.isRequired,
};

IconList.defaultProps = {
  activeIcon: undefined,
  activeTab: undefined,
};

export default IconList;
