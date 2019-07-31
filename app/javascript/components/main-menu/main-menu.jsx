import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import TopLevel from './top-level';
import SecondLevel from './second-level';
import ThirdLevel from './third-level';
import { menuProps, RecursiveMenuProps } from './recursive-props';

const Fallback = props => <ThirdLevel level={2} {...props} />;

const getLevelComponent = level => ({
  0: props => <TopLevel level={level} {...props} />,
  1: props => <SecondLevel level={level} {...props} />,
})[level] || Fallback;

export const MenuItem = ({ level, ...props }) => getLevelComponent(level)(props);

const MainMenu = ({ menu }) => (
  <Grid className="top-navbar">
    <div className="nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-collapsible-menus">
      <ul className="list-group" id="maintab">
        {menu.map(props => <MenuItem key={props.id} level={0} {...props} />)}
      </ul>
    </div>
  </Grid>
);

MainMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.shape({
    ...menuProps,
    items: PropTypes.arrayOf(PropTypes.shape({
      ...menuProps,
      items: PropTypes.arrayOf(PropTypes.shape(RecursiveMenuProps())),
    })),
  })).isRequired,
};

export default MainMenu;
