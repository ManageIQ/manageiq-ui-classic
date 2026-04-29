import React from 'react';
import { TaggingConnected } from '../containers/tagging';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

describe('Test connected Tagging component', () => {
  const tags = [
    {
      label: 'Name',
      id: 1,
      values: [
        { label: 'Pepa', id: 11 },
        { label: 'Franta', id: 12 },
      ],
    },
    {
      label: 'Number',
      id: 2,
      values: [
        { label: '1', id: 21 },
        { label: '2', id: 22 },
      ],
    },
    {
      label: 'Animal',
      id: 3,
      values: [
        { label: 'Duck', id: 31 },
        { label: 'Cat', id: 32 },
        { label: 'Dog', id: 33 },
      ],
    },
    {
      label: 'Food',
      id: 4,
      values: [
        { label: 'Steak', id: 41 },
        { label: 'Duck', id: 42 },
        { label: 'Salad', id: 43 },
      ],
    },
    {
      label: 'Something',
      id: 5,
      values: [
        { label: 'Knedlik', id: 51 },
        {
          label:
            'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons',
          id: 52,
        },
      ],
    },
  ];

  const assignedTags = [
    {
      id: 1,
      label: 'Name',
      tagCategory: { label: 'Name', id: 1 },
      tagValues: [{ label: 'Pepa', id: 11 }],
      values: [{ label: 'Pepa', id: 11 }],
    },
  ];
  const initialState = {
    tagging: {
      appState: {
        tags,
        assignedTags,
        selected: {
          tagCategory: { label: 'Name', id: 1 },
          tagValue: null,
        },
      },
    },
  };
  const mockStore = configureStore();
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('should render the connected component', () => {
    const { container } = render(
      <Provider store={store}>
        <TaggingConnected />
      </Provider>
    );

    expect(container.querySelector('.tagging-row-wrapper')).toBeInTheDocument();
  });
});
