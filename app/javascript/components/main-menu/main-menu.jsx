import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'patternfly-react';
import { useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
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

export const HoverContext = React.createContext();

const MainMenu = ({ menu }) => {
  const [activeIds, setActiveIds] = useState({});
  const isVerticalMenuCollapsed = useSelector(store => store.menuReducer.isVerticalMenuCollapsed);

  const handleSetActiveIds = (value) => {
    if (!isEqual(activeIds, { ...activeIds, ...value })) {
      setActiveIds(prevState => ({ ...prevState, ...value }));
    }
  };

  return (
    <Grid>
      <div
        onMouseLeave={() => handleSetActiveIds({ topLevelId: undefined, secondLevelId: undefined })}
        className={`nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-collapsible-menus ${activeIds.topLevelId ? 'hover-secondary-nav-pf' : ''} ${activeIds.secondLevelId ? 'hover-tertiary-nav-pf' : ''} ${isVerticalMenuCollapsed ? 'collapsed' : ''}`}
      >
        <ul className="list-group" id="maintab">
          <HoverContext.Provider value={activeIds}>
            {menu.map(props => (
              <MenuItem key={props.id} level={0} handleSetActiveIds={handleSetActiveIds} {...props} />
            ))}
          </HoverContext.Provider>
        </ul>
      </div>
    </Grid>
  );
};

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
