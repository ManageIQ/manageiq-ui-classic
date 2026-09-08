import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import '../helpers/miqSparkle';
import { renderWithRedux } from '../helpers/mountForm';
import StorageServiceForm from '../../components/storage-service-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const STORAGE_MANAGER_NAME = 'Test Storage Manager';
const STORAGE_MANAGER_ID = '1';
const STORAGE_SERVICE_ID = '42';
const STORAGE_SERVICE_NAME = 'Test Storage Service';
const SUPPORTS_CREATE = 'supports_storage_service_create';
const SUPPORTS_EDIT = 'supports_storage_services';

// Mocked API response for the storage managers select
const storageManagersResponse = {
  resources: [
    {
      id: STORAGE_MANAGER_ID,
      name: STORAGE_MANAGER_NAME,
      [SUPPORTS_CREATE]: true,
    },
  ],
};

// Mocked API.options response: simulates the capability fields returned after
// selecting a storage manager (same shape loadSchema expects from the server)
const capabilitiesSchemaResponse = {
  data: {
    form_schema: {
      fields: [
        {
          component: 'sub-form',
          id: 'required_capabilities',
          name: 'required_capabilities',
          title: 'Required Capabilities',
          fields: [
            {
              component: 'select',
              id: 'compression',
              initialValue: '-1',
              name: 'compression',
              label: 'Compression',
              options: [
                { label: 'N/A', value: '-1' },
                { label: 'True', value: 'comp-true-001' },
                { label: 'False', value: 'comp-false-001' },
              ],
            },
            {
              component: 'select',
              id: 'thin_provision',
              initialValue: '-1',
              name: 'thin_provision',
              label: 'Thin provision',
              options: [
                { label: 'N/A', value: '-1' },
                { label: 'True', value: 'thin-true-001' },
                { label: 'False', value: 'thin-false-001' },
              ],
            },
          ],
        },
      ],
    },
  },
};

const verifyCommonFields = async() => {
  await waitFor(() => {
    expect(screen.getByLabelText(/storage manager/i)).toBeInTheDocument();
  });
  expect(screen.getByLabelText(/service name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
};

const verifyCapabilityFields = async(container) => {
  await waitFor(() => {
    expect(screen.getByLabelText(/compression/i)).toBeInTheDocument();
  });
  expect(screen.getByLabelText(/thin provision/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/compression/i)).toHaveValue('-1');
  expect(screen.getByLabelText(/thin provision/i)).toHaveValue('-1');
  expect(
    container.querySelector('#storage_resource_id')
  ).not.toBeInTheDocument();
};

const storageResource1 = {
  id: '1',
  name: 'Storage Resource 1',
  ems_ref: 'sr-001',
  capabilities: { compression: ['True'], thin_provision: ['True'] },
};
const storageResource2 = {
  id: '2',
  name: 'Storage Resource 2',
  ems_ref: 'sr-002',
  capabilities: { compression: ['False'], thin_provision: ['True'] },
};
const storageResourcesResponse = {
  resources: [storageResource1, storageResource2],
};

describe('StorageServiceForm', () => {
  beforeEach(() => {
    fetchMock.mock(
      `/api/providers/${STORAGE_MANAGER_ID}?attributes=capabilities`,
      {
        capabilities: {
          compression: [
            { uuid: 'comp-true-001', value: 'True' },
            { uuid: 'comp-false-001', value: 'False' },
          ],
          thin_provision: [
            { uuid: 'thin-true-001', value: 'True' },
            { uuid: 'thin-false-001', value: 'False' },
          ],
        },
      }
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    jest.clearAllMocks();
  });

  describe('Add (create) mode', () => {
    beforeEach(() => {
      fetchMock.mock(
        `/api/providers?expand=resources&attributes=id,name,${SUPPORTS_CREATE}&filter[]=${SUPPORTS_CREATE}=true`,
        storageManagersResponse
      );
      fetchMock.mock(
        `/api/storage_services?ems_id=${STORAGE_MANAGER_ID}`,
        capabilitiesSchemaResponse
      );
      fetchMock.mock(
        '/api/storage_resources?expand=resources&attributes=id,name,capabilities',
        storageResourcesResponse
      );
    });

    it('Verify UI elements & cancel action', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<StorageServiceForm />);

      await verifyCommonFields();
      const emsSelect = screen.getByLabelText(/storage manager/i);
      expect(emsSelect).toBeEnabled();
      expect(emsSelect).toHaveValue('-1');
      expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
      expect(
        screen.queryByText(/required capabilities/i)
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('#storage_resource_id')
      ).not.toBeInTheDocument();
      // Select a storage manager then capabilities appear
      await user.selectOptions(emsSelect, STORAGE_MANAGER_ID);
      await verifyCapabilityFields(container);
      expect(
        screen.queryByRole('button', { name: /check compliant resources/i })
      ).not.toBeInTheDocument();
      // Set compression then storage resource select appears
      await user.selectOptions(
        screen.getByLabelText(/compression/i),
        'comp-true-001'
      );
      await waitFor(() => {
        expect(
          container.querySelector('#storage_resource_id')
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(/select storage resources to attach/i)
      ).toBeInTheDocument();
      // Open multiselect and verify options are populated
      await user.click(container.querySelector('#storage_resource_id button'));
      await waitFor(() => {
        const optionTexts = Array.from(
          container
            .querySelector('#storage_resource_id')
            .querySelectorAll('[role="option"]')
        ).map((option) => option.textContent.trim());
        expect(optionTexts).toContain(storageResource1.name);
      });
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('cancelled'),
        'warning',
        '/storage_service/show_list'
      );
    });

    it('Verify duplicate storage service creation is restricted', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<StorageServiceForm />);

      await waitFor(() => {
        expect(container.querySelector('.cds--form')).toBeInTheDocument();
      });
      // Seed the names endpoint so validateName finds a duplicate
      fetchMock.mock(
        '/api/storage_services?expand=resources&attributes=name',
        { resources: [{ name: STORAGE_SERVICE_NAME }] }
      );

      await user.type(screen.getByLabelText(/service name/i), STORAGE_SERVICE_NAME);
      await user.tab(); // blur triggers async validation
      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => {
      fetchMock.mock(
        `/api/providers?expand=resources&attributes=id,name,${SUPPORTS_EDIT}&filter[]=${SUPPORTS_EDIT}=true`,
        storageManagersResponse
      );
      fetchMock.mock(
        `/api/storage_services/${STORAGE_SERVICE_ID}?attributes=storage_resources`,
        {
          id: STORAGE_SERVICE_ID,
          name: STORAGE_SERVICE_NAME,
          ems_id: STORAGE_MANAGER_ID,
          storage_resources: [],
        }
      );
      fetchMock.mock(
        `/api/storage_services/${STORAGE_SERVICE_ID}?ems_id=${STORAGE_MANAGER_ID}`,
        capabilitiesSchemaResponse
      );
      fetchMock.mock(
        '/api/storage_resources?expand=resources&attributes=id,name,ems_ref,capabilities',
        storageResourcesResponse
      );
      fetchMock.mock(
        '/api/storage_resources?expand=resources&attributes=id,name,capabilities',
        storageResourcesResponse
      );
    });

    it('Verify UI elements, reset & cancel actions', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <StorageServiceForm recordId={STORAGE_SERVICE_ID} />
      );

      await verifyCommonFields();
      expect(screen.getByLabelText(/storage manager/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
      await verifyCapabilityFields(container);
      // Set compression then compliance check button appears
      await user.selectOptions(
        screen.getByLabelText(/compression/i),
        'comp-true-001'
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /check compliant resources/i })
        ).toBeInTheDocument();
      });
      expect(
        screen.getByRole('button', { name: /check compliant resources/i })
      ).toBeEnabled();
      expect(
        screen.getByText(
          /run the compliance check above, then select storage resources/i
        )
      ).toBeInTheDocument();
      // Storage Resource select is rendered but has no options until compliance check runs
      await user.click(container.querySelector('#storage_resource_id button'));
      expect(
        container
          .querySelector('#storage_resource_id')
          .querySelectorAll('[role="option"]')
      ).toHaveLength(0);
      // Edit any field then reset becomes enabled
      await user.type(
        screen.getByLabelText(/description/i),
        'some description'
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeEnabled();
      });
      const addFlashSpy = jest.spyOn(window, 'add_flash');
      await user.click(screen.getByRole('button', { name: /reset/i }));
      expect(addFlashSpy).toHaveBeenCalledWith(
        expect.stringContaining('reset'),
        'warn'
      );
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('canceled'),
        'warning',
        '/storage_service/show_list'
      );
    });

    it('Verify compliance check failure behavior', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <StorageServiceForm recordId={STORAGE_SERVICE_ID} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
      });
      // Set compression, save should stay disabled, compliance button appears
      await user.selectOptions(
        screen.getByLabelText(/compression/i),
        'comp-true-001'
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /check compliant resources/i })
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

      fetchMock.mock('/api/storage_services/', {
        results: [{ task_id: '404', success: true }],
      });
      const mockTaskResultsResponse = {
        id: '404',
        state: 'Finished',
        status: 'Error',
        message: "Authentication error occured. : Couldn't connect to server",
        task_results: null,
      };
      fetchMock.mock(
        '/api/tasks/404?attributes=task_results',
        mockTaskResultsResponse
      );

      await user.click(
        screen.getByRole('button', { name: /check compliant resources/i })
      );
      await waitFor(() => {
        expect(
          container.querySelector('.ddorg__carbon-error-helper-text')
        ).toHaveTextContent(mockTaskResultsResponse.message);
      });
      // Storage Resource select is rendered but has no options since compliance check failed
      await user.click(container.querySelector('#storage_resource_id button'));
      expect(
        container
          .querySelector('#storage_resource_id')
          .querySelectorAll('[role="option"]')
      ).toHaveLength(0);
      // Save remains disabled after failed compliance check
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('Verify resources dropdown remains empty when there are no compliance results', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <StorageServiceForm recordId={STORAGE_SERVICE_ID} />
      );

      // Set compression, compliance button appears
      await waitFor(() => {
        expect(container.querySelector('.cds--form')).toBeInTheDocument();
      });
      await user.selectOptions(
        screen.getByLabelText(/compression/i),
        'comp-true-001'
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /check compliant resources/i })
        ).toBeInTheDocument();
      });

      fetchMock.mock('/api/storage_services/', {
        results: [{ task_id: '404', success: true }],
      });
      fetchMock.mock('/api/tasks/404?attributes=task_results', {
        state: 'Finished',
        status: 'Ok',
        task_results: { compliant_resources: [] },
      });

      await user.click(
        screen.getByRole('button', { name: /check compliant resources/i })
      );
      // Warning shown: no resources match selected capabilities
      await waitFor(() => {
        expect(
          container.querySelector('.ddorg__carbon-warning-helper-text')
        ).toHaveTextContent('No currently attached storage resource');
      });
      // Storage Resource select has no options
      expect(
        container.querySelector('#storage_resource_id')
      ).toBeInTheDocument();
      expect(
        container
          .querySelector('#storage_resource_id')
          .querySelectorAll('[role="option"]')
      ).toHaveLength(0);
      // Save remains disabled
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });
  });
});
