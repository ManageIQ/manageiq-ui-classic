import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import SearchBar from '../../components/search-bar';

describe('Search Bar component', () => {
  it('should render the search bar component', () => {
    const wrapper = shallow(<SearchBar searchText="" action="" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the search bar component with advanced search', () => {
    const wrapper = shallow(<SearchBar searchText="" action="" advancedSearch />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render the search bar component with search text and advanced search', () => {
    const wrapper = shallow(<SearchBar searchText="nameSearch" action="" advancedSearch />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
