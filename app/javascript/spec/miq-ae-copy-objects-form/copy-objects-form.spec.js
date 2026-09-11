import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import CopyObjectsForm from '../../components/miq-ae-class/copy-objects-form';
import '../helpers/miqSparkle';
import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('CopyObjectsForm Component', () => {
  let sparkleOnSpy;
  let sparkleOffSpy;
  let flashSpy;

  const mockEditDataClass = {
    domains: {
      1: 'Domain 1',
      2: 'Domain 2',
      3: 'Domain 3',
    },
    domain_name: 'Domain 1',
    domain_id: 1,
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace',
      override_source: false,
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
    new: {
      domain: '2',
      namespace: 'Domain2/Namespace/Class',
      override_source: false,
      override_existing: false,
      new_name: '',
    },
    selected_items: {
      456: 'TestInstance',
    },
    typ: 'MiqAeInstance',
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
      override_source: false,
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
    sparkleOnSpy = jest.spyOn(window, 'miqSparkleOn');
    sparkleOffSpy = jest.spyOn(window, 'miqSparkleOff');
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
    sparkleOnSpy.mockRestore();
    sparkleOffSpy.mockRestore();
    flashSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Copy Class', () => {
    it('should render copy class form correctly', async() => {
      const { container } = renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should display selected class name', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByText('TestClass')).toBeInTheDocument();
      });
    });

    it('should show domain selector', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/To Domain/i)).toBeInTheDocument();
      });
    });

    it('should submit copy class form', async() => {
      const user = userEvent.setup();
      window.http.post.mockResolvedValue({
        message: 'Copy selected Automate Class was saved',
        redirect_url: '/miq_ae_class/explorer',
      });

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });

      // Make a change to enable the button (form is pristine initially)
      const domainSelect = screen.getByLabelText(/to domain/i);
      await user.selectOptions(domainSelect, '3');

      const submitButton = screen.getByRole('button', { name: /copy/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.http.post).toHaveBeenCalledWith(
          '/miq_ae_class/copy_objects_save/123',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });

    it('should allow copying with new name for single item', async() => {
      // Create test data where domain matches domain_id (same domain)
      const singleItemSameDomain = {
        ...mockEditDataClass,
        domain_id: 1,
        new: {
          ...mockEditDataClass.new,
          domain: 1, // Same as domain_id - must be same type (number)
        },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={singleItemSameDomain} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/New Name/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      const newNameInput = screen.getByLabelText(/New Name/i);
      expect(newNameInput).not.toBeDisabled();
    });

    it('should disable new name field for multiple items', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataMultipleItems} />
      );

      await waitFor(() => {
        const newNameInput = screen.queryByLabelText(/New Name/i);
        // New name field should not be shown for multiple items
        expect(newNameInput).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy Instance', () => {
    it('should render copy instance form correctly', async() => {
      const { container } = renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should display selected instance name', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(screen.getByText('TestInstance')).toBeInTheDocument();
      });
    });

    it('should show override existing checkbox for instances', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Replace items if they already exist/i)).toBeInTheDocument();
      });
    });

    it('should submit copy instance form', async() => {
      const user = userEvent.setup();
      window.http.post.mockResolvedValue({
        message: 'Copy selected Automate Instance was saved',
        redirect_url: '/miq_ae_class/explorer',
      });

      renderWithRedux(
        <CopyObjectsForm recordId="456" editData={mockEditDataInstance} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
      });

      // Make a change to enable the button (form is pristine initially)
      // Select a different domain to make form dirty without showing new_name field
      const domainSelect = screen.getByLabelText(/to domain/i);
      await user.selectOptions(domainSelect, '1');

      await waitFor(() => {
        expect(screen.getByLabelText(/new name/i)).toBeInTheDocument();
      });

      const newNameInput = screen.getByLabelText(/new name/i);
      await user.type(newNameInput, 'new_copy_name');

      const submitButton = screen.getByRole('button', { name: /copy/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.http.post).toHaveBeenCalledWith(
          '/miq_ae_class/copy_objects_save/456',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Namespace Selection', () => {
    it('should hide namespace selector when copy to same path is checked', async() => {
      const dataWithOverrideSource = {
        ...mockEditDataClass,
        new: {
          ...mockEditDataClass.new,
          override_source: true,
        },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={dataWithOverrideSource} />
      );

      await waitFor(() => {
        expect(screen.queryByLabelText(/Namespace/i)).not.toBeInTheDocument();
      });
    });

    it('should show namespace selector when copy to same path is unchecked', async() => {
      const dataWithNamespace = {
        ...mockEditDataClass,
        new: {
          ...mockEditDataClass.new,
          override_source: false,
        },
      };

      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={dataWithNamespace} />
      );

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
  });

  describe('Form Actions', () => {
    it('should handle cancel action', async() => {
      const user = userEvent.setup();
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        // Get all cancel buttons and use the last one (the main form cancel button)
        const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
        expect(cancelButtons.length).toBeGreaterThan(0);
      });

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      const mainCancelButton = cancelButtons[cancelButtons.length - 1];
      expect(mainCancelButton).toBeInTheDocument();

      // Click cancel button
      await user.click(mainCancelButton);

      // Verify miqRedirectBack was called
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

      // Make a change to enable the button (form is pristine initially)
      const domainSelect = screen.getByLabelText(/to domain/i);
      await user.selectOptions(domainSelect, '3');

      const submitButton = screen.getByRole('button', { name: /copy/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(flashSpy).toHaveBeenCalledWith(
          expect.stringContaining('Copy operation failed'),
          'error'
        );
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

      await waitFor(() => {
        expect(screen.getByLabelText(/Copy to same path/i)).toBeInTheDocument();
      });

      const overrideCheckbox = screen.getByLabelText(/Copy to same path/i);
      expect(overrideCheckbox).not.toBeChecked();

      await user.click(overrideCheckbox);

      expect(overrideCheckbox).toBeChecked();
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
    it('should list available domains', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        const domainSelect = screen.getByLabelText(/To Domain/i);
        expect(domainSelect).toBeInTheDocument();
      });
    });

    it('should show source domain information', async() => {
      renderWithRedux(
        <CopyObjectsForm recordId="123" editData={mockEditDataClass} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Domain 1/i)).toBeInTheDocument();
      });
    });
  });
});

