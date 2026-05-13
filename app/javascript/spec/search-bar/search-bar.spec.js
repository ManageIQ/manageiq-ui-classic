import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchBar from '../../components/search-bar';

describe('Search Bar component', () => {
  it('should render the search bar component', () => {
    const { container } = render(<SearchBar searchText="" action="" />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(container.querySelector('.search_button')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render the search bar component with advanced search', () => {
    const { container } = render(
      <SearchBar searchText="" action="" advancedSearch />
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(container.querySelector('.search_button')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /advanced search/i })
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render the search bar component with search text and advanced search', () => {
    const { container } = render(
      <SearchBar searchText="nameSearch" action="" advancedSearch />
    );

    expect(screen.getByDisplayValue('nameSearch')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    expect(container.querySelector('.search_button')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /advanced search/i })
    ).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
