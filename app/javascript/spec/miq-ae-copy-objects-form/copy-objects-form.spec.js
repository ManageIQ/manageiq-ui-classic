import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import CopyObjectsForm from '../../components/miq-ae-class/copy-objects-form';
import '../helpers/miqSparkle';
import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('CopyObjectsForm Component', () => {
  let flashSpy;

  const mockEditDataClass = {
    domains: {
      1: 'Domain 1',
      2: 'Domain 2',
      3: 'Domain 3',
    },
    domain_name: 'Domain 1',
    domain_id: 1,
    fqname: '/Domain1/Namespace/TestClass',
    old_name: 'TestClass',
    selected_ids: [123],
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace',
      override_existing: false,
      new_name: '',
    },
    selected_items: {
      123: 'TestClass',
    },
    typ: 'MiqAeClass',
  };

  const mockEditDataInstance = {
    domains: {
      1: 'Domain 1',
      2: 'Domain 2',
    },
    domain_name: 'Domain 1',
    domain_id: 1,
    fqname: '/Domain1/Namespace/Class/TestInstance',
    old_name: 'TestInstance',
    selected_ids: [456],
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace/Class',
      override_existing: false,
      new_name: '',
    },
    selected_items: {
      456: 'TestInstance',
    },
    typ: 'MiqAeInstance',
  };

  const mockEditDataMethod = {
    domains: {
      1: 'Domain 1',
      2: 'Domain 2',
    },
    domain_name: 'Domain 1',
    domain_id: 1,
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace/Class',
      override_existing: false,
      new_name: '',
    },
    selected_items: {
      789: 'TestMethod',
    },
    typ: 'MiqAeMethod',
  };

  const mockEditDataMultipleItems = {
    domains: {
      1: 'Domain 1',
      2: 'Domain 2',
    },
    domain_name: 'Domain 1',
    domain_id: 1,
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace',
      override_existing: false,
      new_name: '',
    },
    selected_items: {
      123: 'Class1',
      124: 'Class2',
      125: 'Class3',
    },
    typ: 'MiqAeClass',
  };

  beforeEach(() => {
    window.__ = (str) => str;
    window.sprintf = (str, obj) => str.replace(/%{(\w+)}/g, (_, key) => obj[key]);
    window.add_flash = jest.fn();
    flashSpy = jest.spyOn(window, 'add_flash');

    // Mock window.http.post to return a resolved promise by default
    window.http = {
      post: jest.fn().mockResolvedValue({
        message: 'Operation completed successfully',
        redirect_url: '/miq_ae_class/explorer',
      }),
    };
  });

  afterEach(() => {
    flashSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Copy Class', () => {
    it('should render with copy to same path checked, namespace hidden, and Copy disabled', async() => {
      const { container } = renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Copy to same path/i)).toBeChecked();
        expect(screen.queryByRole('textbox', { name: /Namespace/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^copy$/i })).toBeDisabled();
      });
      expect(container).toMatchSnapshot();
    });

    it('should keep Copy disabled when copy to same path is unchecked and namespace is empty', async() => {
      const user = userEvent.setup();
      const dataWithEmptyNamespace = {
        ...mockEditDataClass,
        new: { ...mockEditDataClass.new, namespace: '' },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={dataWithEmptyNamespace} />
      );

      await user.click(screen.getByLabelText(/Copy to same path/i));

      // Namespace field appears but is empty — Copy must stay disabled
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /Namespace/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^copy$/i })).toBeDisabled();
      });
    });

    it('should keep Copy disabled for multiple classes when copy to same path is checked', async() => {
      const dataWithEmptyNamespace = {
        ...mockEditDataMultipleItems,
        new: { ...mockEditDataMultipleItems.new, namespace: '' },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={dataWithEmptyNamespace} />
      );

      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /Namespace/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^copy$/i })).toBeDisabled();
      });
    });

    it('should submit copy class form to a different namespace', async() => {
      const user = userEvent.setup();

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      // Uncheck "Copy to same path" — field appears with namespace already set from initialValues, Copy enables
      await user.click(screen.getByLabelText(/Copy to same path/i));

      await waitFor(() => expect(screen.getByRole('button', { name: /^copy$/i })).not.toBeDisabled());
      await user.click(screen.getByRole('button', { name: /^copy$/i }));

      await waitFor(() => {
        expect(window.http.post).toHaveBeenCalledWith(
          '/miq_ae_class/copy_objects_save/123',
          expect.objectContaining({
            fqname: '/Domain1/Namespace/TestClass',
            old_name: 'TestClass',
            selected_ids: [123],
          }),
          expect.any(Object)
        );
      });
    });

    it('should show new name field for single item copying to same domain', async() => {
      const singleItemSameDomain = {
        ...mockEditDataClass,
        new: { ...mockEditDataClass.new, domain: 1 },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={singleItemSameDomain} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/New Name/i)).not.toBeDisabled();
      });
    });

    it('should not show new name field for multiple items', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataMultipleItems} />
      );

      await waitFor(() => {
        expect(screen.queryByLabelText(/New Name/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy Instance', () => {
    it('should render with instance name and override existing checkbox', async() => {
      const { container } = renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(screen.getByText('TestInstance')).toBeInTheDocument();
        expect(screen.getByLabelText(/Replace items if they already exist/i)).toBeInTheDocument();
      });
      expect(container).toMatchSnapshot();
    });

    it('should submit copy instance form to a different namespace', async() => {
      const user = userEvent.setup();

      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      // Uncheck "Copy to same path" — field appears with namespace already set from initialValues, Copy enables
      await user.click(screen.getByLabelText(/Copy to same path/i));

      await waitFor(() => expect(screen.getByRole('button', { name: /^copy$/i })).not.toBeDisabled());
      await user.click(screen.getByRole('button', { name: /^copy$/i }));

      await waitFor(() => {
        expect(window.http.post).toHaveBeenCalledWith(
          '/miq_ae_class/copy_objects_save/456',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Copy Method', () => {
    it('should submit copy method form to a different namespace', async() => {
      const user = userEvent.setup();

      renderWithRedux(
        <CopyObjectsForm recordId="789" editData={mockEditDataMethod} />
      );

      await waitFor(() => {
        expect(screen.getByText('TestMethod')).toBeInTheDocument();
        expect(screen.getByLabelText(/Replace items if they already exist/i)).toBeInTheDocument();
      });

      // Uncheck "Copy to same path" — field appears with namespace already set from initialValues, Copy enables
      await user.click(screen.getByLabelText(/Copy to same path/i));

      await waitFor(() => expect(screen.getByRole('button', { name: /^copy$/i })).not.toBeDisabled());
      await user.click(screen.getByRole('button', { name: /^copy$/i }));

      await waitFor(() => {
        expect(window.http.post).toHaveBeenCalledWith(
          '/miq_ae_class/copy_objects_save/789',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Namespace Selection', () => {
    it('should hide namespace selector when copy to same path is checked', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.queryByLabelText(/Namespace/i)).not.toBeInTheDocument();
      });
    });

    it('should show namespace selector when copy to same path is unchecked', async() => {
      const user = userEvent.setup();
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await user.click(screen.getByLabelText(/Copy to same path/i));

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /Namespace/i })).toBeInTheDocument();
      });
    });

    it('should hide new name field when copying to a different domain', async() => {
      const user = userEvent.setup();
      // Start on the same domain so new_name is visible
      const sameDomainData = {
        ...mockEditDataInstance,
        new: {
          ...mockEditDataInstance.new,
          domain: '1',
        },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={sameDomainData} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Name/i)).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText(/To Domain/i), '2');

      await waitFor(() => {
        expect(screen.queryByLabelText(/New Name/i)).not.toBeInTheDocument();
      });
    });

    it('should clear namespace field when To Domain changes', async() => {
      const user = userEvent.setup();
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await user.click(screen.getByLabelText(/Copy to same path/i));

      // Namespace field appears with its seeded value
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /Namespace/i })).toHaveValue('Domain2/Namespace');
      });

      await user.selectOptions(screen.getByLabelText(/To Domain/i), '3');

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /Namespace/i })).toHaveValue('');
      });
    });
  });

  describe('Form Actions', () => {
    it('should handle cancel action', async() => {
      const user = userEvent.setup();
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await user.click(screen.getByRole('button', { name: /^cancel$/i }));

      await waitFor(() => {
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.any(String),
          'warning',
          '/miq_ae_class/explorer'
        );
      });
    });

    it('should have reset button disabled when form is pristine', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
      });
    });

    it('should enable reset button after a change and restore values on reset', async() => {
      const user = userEvent.setup();
      // Use same-domain data so new_name field is visible
      const sameDomainData = {
        ...mockEditDataInstance,
        new: {
          ...mockEditDataInstance.new,
          domain: '1',
        },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={sameDomainData} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Name/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/New Name/i), 'will_be_reset');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).not.toBeDisabled();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/New Name/i)).toHaveValue('');
        expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
      });

      expect(flashSpy).toHaveBeenCalledWith('All changes have been reset', 'warning');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async() => {
      const user = userEvent.setup();
      window.http.post.mockRejectedValue({ data: { error: 'Copy operation failed' }, status: 400 });

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });

      // Make the form dirty and ensure canCopy is true:
      const overrideCheckbox = screen.getByLabelText(/Copy to same path/i);
      await user.click(overrideCheckbox);

      const submitButton = screen.getByRole('button', { name: /copy/i });
      await waitFor(() => expect(submitButton).not.toBeDisabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Copy operation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Override Options', () => {
    it('should show override source checkbox', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Copy to same path/i)).toBeInTheDocument();
      });
    });

    it('should toggle override source checkbox', async() => {
      const user = userEvent.setup();
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      const overrideCheckbox = screen.getByLabelText(/Copy to same path/i);
      expect(overrideCheckbox).toBeChecked();

      await user.click(overrideCheckbox);

      expect(overrideCheckbox).not.toBeChecked();
    });

    it('should show override existing for instances', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Replace items if they already exist/i)).toBeInTheDocument();
      });
    });
  });

  describe('Domain Selection', () => {
    it('should list available domains in the To Domain selector', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        const domainSelect = screen.getByLabelText(/To Domain/i);
        expect(domainSelect).toBeInTheDocument();
        expect(domainSelect).toHaveValue('2');
      });
    });

    it('should show the source domain in the From Domain field', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/From Domain/i)).toHaveValue('Domain 1');
      });
    });
  });
});

