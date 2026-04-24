import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { TaggingWithButtonsConnected } from '../containers/tagging';
import TaggingWithButtons from '../components/TaggingWithButtons/TaggingWithButtons';

// TODO: move this to Jest setup if it shows up more often
// Mock scrollIntoView which is not implemented in jsdom
Element.prototype.scrollIntoView = jest.fn();

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
      { label: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons', id: 52 },
    ],
  },
];

const assignedTags = [{ label: 'Name', id: 1, values: [{ label: 'Pepa', id: 11 }] }];

const initialState = {
  tagging: {
    appState: {
      tags,
      assignedTags,
      selected: {
        tagCategory: tags[0], // Use the full tag object which includes values
        tagValue: {},
      },
    },
  },
};
const initialProps = {
  selectedTagCategory: {},
  selectedTagValue: {},
  tags: [],
  assignedTags: [],
  onTagDeleteClick: jest.fn(),
  onTagCategoryChange: jest.fn(),
  onTagValueChange: jest.fn(),
  onTagMultiValueChange: jest.fn(),
  showReset: true,
  cancelButton: {},
  resetButton: {},
  saveButton: {},
};
const mockStore = configureStore();
let store;

describe('Test connected Tagging component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('+++ render the connected(SMART) component', () => {
    render(
      <Provider store={store}>
        <TaggingWithButtonsConnected />
      </Provider>
    );

    const nameElements = screen.getAllByText('Name');
    expect(nameElements.length).toBeGreaterThan(0);
  });

  it('calls right function', async() => {
    const user = userEvent.setup();
    const onTagCategoryChange = jest.fn();

    const { container } = render(
      <TaggingWithButtons
        {...initialProps}
        tags={tags}
        multiValuelabel
        selectedTagCategory={{ label: 'Name', id: 1, values: tags[0].values }}
        onTagCategoryChange={onTagCategoryChange}
      />
    );
    const dropdownButton = container.querySelector('#dropdown-tag-select button');
    await user.click(dropdownButton);

    // Wait for the dropdown menu to appear and click on "Number" option
    await waitFor(() => {
      expect(screen.getByText('Number')).toBeInTheDocument();
    });

    const numberOption = screen.getByText('Number');
    await user.click(numberOption);

    expect(onTagCategoryChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'Number', id: 2 }));
  });
});
