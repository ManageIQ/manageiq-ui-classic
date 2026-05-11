import React from 'react';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import VmResizeForm from '../../components/vm-resize-form/vm-resize-form';

describe('vm resize form component', () => {
  const response = {
    data: {
      form_schema: {
        fields: [
          {
            component: 'text-field',
            name: 'memory',
            id: 'memory',
            label: _('Memory (GiB)'),
            initialValue: 2,
            isRequired: true,
            validate: [{ type: 'required' }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    fetchMock.once('/api/vms/1?option_action=resize', response);
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render form', async() => {
    const { container } = renderWithRedux(<VmResizeForm recordId="1" />);
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render a resize form', async() => {
    const { container } = renderWithRedux(
      <VmResizeForm recordId="1" vmCloudResizeFormId="53" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should submit resize API call', async() => {
    const submitData = {
      action: 'resize',
      resource: {
        resizeValues: { flavor: 'bh1-16x1600' },
      },
      resizeFormId: '53',
    };
    fetchMock.postOnce('/api/vms/1', submitData);

    const { container } = renderWithRedux(
      <VmResizeForm recordId="1" vmCloudResizeFormId="53" />
    );
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });
});
