import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import Service from '../../components/service';
import { ServiceType } from '../../components/service/constants';
import { serviceDialogResponse } from './data';

describe('Service component - Order Service', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('should render the Service component for orderServiceForm that renders all fields', async() => {
    const initialData = {
      dialogId: 118,
      params: {
        resourceActionId: 8732,
        targetId: 170,
        targetType: 'service_template',
        realTargetType: 'ServiceTemplate',
      },
      urls: {
        apiSubmitEndpoint: '/api/service_catalogs/7/service_templates/170',
        apiAction: 'order',
        cancelEndPoint: '/catalog/explorer',
        finishSubmitEndpoint: '/miq_request/show_list',
        openUrl: false,
      },
      requestDialogOptions: undefined,
    };
    const serviceType = ServiceType.order;
    const { resourceActionId, targetId, targetType } = initialData.params;
    const attributes = `?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`;

    fetchMock.getOnce(`/api/service_dialogs/${initialData.dialogId}${attributes}`, {
      body: { content: serviceDialogResponse },
      headers: { 'content-type': 'application/json' },
    });

    const { container } = renderWithRedux(<Service initialData={initialData} serviceType={serviceType} />);

    await waitFor(() => expect(screen.getByText(__('Submit'))).toBeInTheDocument());

    expect(screen.getByText(__('Cancel'))).toBeInTheDocument();
    expect(document.querySelector('.service-container')).toBeInTheDocument();
    expect(document.querySelector('.refresh-field-item button')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
