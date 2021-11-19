import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import toJson from 'enzyme-to-json';
import FilterDropDown from '../../components/filter-dropdown';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import { mount } from '../helpers/mountForm';

describe('Filter Dropdown form', () => {
  const DefSearch = [{
    db: null, description: 'ALL (Default)', filter: null, id: 0, name: 'ALL',
  },
  {
    db: null, description: 'ALL (Default)', filter: null, id: 1, name: 'filter1',
  },
  {
    db: null, description: 'ALL (Default)', filter: null, id: 2, name: 'filter2',
  }];
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.restore();

    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should handle cancel', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<FilterDropDown defSearches={DefSearch} mySearches={[]} filterSelected="aaa" defaultSelected="bbb" />);
    });
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
