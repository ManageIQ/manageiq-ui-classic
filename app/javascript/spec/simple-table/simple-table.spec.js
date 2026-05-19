import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataDrivenTable } from '../../components/simple-table/simple-table';

describe('Simple react table', () => {
  let initialProps;
  const clickSpy = jest.fn();
  beforeEach(() => {
    initialProps = {
      columns: [
        ['column-one', 'First label'],
        [
          'column-two',
          'Second label',
          { className: 'custom-className-of-cells' },
        ],
      ],
      rows: [
        {
          'column-one': 'Row 1 first column',
          'column-two': <span>Custom component for column 2 row 1</span>,
        },
        {
          'column-one': 'Row 2 second column',
          'column-two': (
            <button
              type="button"
              onClick={() => clickSpy('foo')}
              className="button pf-button"
            >
              Click me!
            </button>
          ),
        },
      ],
    };
  });

  afterEach(() => {
    clickSpy.mockReset();
  });

  it('should render correctly', () => {
    const { container } = render(<DataDrivenTable {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it('should call callback on custom button cell component', async() => {
    const user = userEvent.setup();
    render(<DataDrivenTable {...initialProps} />);
    const button = screen.getByRole('button', { name: 'Click me!' });
    await user.click(button);
    expect(clickSpy).toHaveBeenCalledWith('foo');
  });
});
