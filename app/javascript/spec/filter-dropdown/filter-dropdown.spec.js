import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import FilterDropDown from '../../components/filter-dropdown';

import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import { renderWithRedux } from '../helpers/mountForm';

describe('Filter Dropdown form', () => {
  const DefSearch = [
    {
      db: null,
      description: 'ALL (Default)',
      filter: null,
      id: 0,
      name: 'ALL',
    },
    {
      db: null,
      description: 'ALL (Default)',
      filter: null,
      id: 1,
      name: 'filter1',
    },
    {
      db: null,
      description: 'ALL (Default)',
      filter: null,
      id: 2,
      name: 'filter2',
    },
  ];
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

  it('should handle cancel', async() => {
    const { container } = renderWithRedux(
      <FilterDropDown
        defSearches={DefSearch}
        mySearches={[]}
        filterSelected="aaa"
        defaultSelected="bbb"
      />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
