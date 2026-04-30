import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { componentTypes } from '@@ddf';

import MiqFormRenderer from '../../forms/data-driven-form';

describe('DataDrivenForm', () => {
  let initialProps;

  beforeEach(() => {
    const schema = {
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'name',
          labelText: 'label',
        },
      ],
    };
    initialProps = {
      schema,
      store: ManageIQ.redux.store,
    };
  });

  it('should render correctly', () => {
    const { container } = render(<MiqFormRenderer {...initialProps} />);

    expect(container.querySelector('form')).toBeInTheDocument();
    expect(container.querySelector('input')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should set pristine in reducer when changing state', async() => {
    const user = userEvent.setup();

    const { container } = render(<MiqFormRenderer {...initialProps} />);

    const input = container.querySelector('input');

    await user.type(input, 'changed-value');
    expect(ManageIQ.redux.store.getState().FormButtons.pristine).toEqual(false);

    await user.clear(input);
    expect(ManageIQ.redux.store.getState().FormButtons.pristine).toEqual(true);
  });
});
