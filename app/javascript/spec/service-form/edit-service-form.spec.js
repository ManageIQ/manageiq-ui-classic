import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import EditServiceForm from '../../components/edit-service-form';

import '../helpers/miqAjaxButton';

describe('Service form component', () => {
  beforeAll(() => fetchMock.mockGlobal());

  it('should request data after mount and set to state', async() => {
    const initialProps = {
      maxNameLen: 10,
      maxDescLen: 20,
      recordId: 3,
    };
    fetchMock.getOnce('/api/services/3', {
      foo: 'bar',
    });

    renderWithRedux(<EditServiceForm {...initialProps} />);
    await waitFor(() => {
      expect(fetchMock.callHistory.lastCall().url).toEqual('http://localhost/api/services/3');
    });
  });
});
