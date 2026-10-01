import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import PolicyProfileForm from '../../components/policy-profile-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('PolicyProfileForm form component', () => {
  beforeAll(() => fetchMock.mockGlobal());

  it('should render adding form variant', async() => {
    fetchMock.get(
      '/api/policies?attributes=id,description,towhat&expand=resources',
      { resources: [] }
    );

    const { container } = renderWithRedux(<PolicyProfileForm />);

    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should render new form variant', async() => {
    const url = '/api/policies?attributes=id,description,towhat&expand=resources';
    fetchMock.get(url, { resources: [] });

    const { container } = renderWithRedux(<PolicyProfileForm />);

    await waitFor(() => {
      expect(fetchMock.callHistory.called(url)).toBe(true);
    });
    expect(container).toMatchSnapshot();
  });

  it('should render editing form variant', async() => {
    const url = '/api/policy_profiles/1?attributes=name,description,set_data,miq_policies&expand=miq_policies';
    fetchMock.get(url, { name: 'foo', miq_policies: [] });
    fetchMock.get(
      '/api/policies?attributes=id,description,towhat&expand=resources',
      { resources: [] }
    );

    const { container } = renderWithRedux(<PolicyProfileForm recordId="1" />);

    await waitFor(() => {
      expect(fetchMock.callHistory.called(url)).toBe(true);
    });
    expect(container).toMatchSnapshot();
  });
});
