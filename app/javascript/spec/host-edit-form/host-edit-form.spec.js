import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import HostEditForm from '../../components/host-edit-form/host-edit-form';
import {
  sampleInitialValues,
  sampleSingleResponse,
  sampleMultiResponse,
} from './helper-data';

import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';

describe('Show Edit Host Form Component', () => {
  const id = [1];
  const ids = [1, 2, 3];

  beforeAll(() => fetchMock.mockGlobal());

  /** Render Form */
  it('should render form for *one* host', async() => {
    fetchMock
      .get(
        `/api/hosts/${id[0]}?expand=resources&attributes=authentications`,
        sampleInitialValues
      )
      .route({ method: 'OPTIONS', url: `http://localhost/api/hosts/${id[0]}` }, sampleSingleResponse);

    const { container } = renderWithRedux(<HostEditForm ids={id} />);

    await waitFor(() => {
      expect(
        fetchMock.callHistory.called(
          `/api/hosts/${id[0]}?expand=resources&attributes=authentications`
        )
      ).toBe(true);
    });

    expect(container).toMatchSnapshot();
  });

  it('should render form for multiple hosts', async() => {
    fetchMock.get(
      `/api/hosts?expand=resources&attributes=id,name&filter[]=id=[${ids}]`,
      sampleMultiResponse
    );

    const { container } = renderWithRedux(<HostEditForm ids={ids} />);

    await waitFor(() => {
      expect(
        fetchMock.callHistory.called(
          `/api/hosts?expand=resources&attributes=id,name&filter[]=id=[${ids}]`
        )
      ).toBe(true);
    });

    expect(container).toMatchSnapshot();
  });
});
