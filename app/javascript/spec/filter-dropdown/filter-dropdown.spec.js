import { waitFor } from '@testing-library/react';
import FilterDropDown from '../../components/filter-dropdown';

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
