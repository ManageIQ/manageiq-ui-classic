import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CatalogForm from '../../components/catalog-form/catalog-form';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import { renderWithRedux } from '../helpers/mountForm';

describe('Catalog form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;

  const resources = [
    { href: 'http://localhost:3000/api/service_templates/44', name: 'template 44' },
    { href: 'http://localhost:3000/api/service_templates/10', name: 'template 10' },
  ];

  const assignedResources = {
    name: 'DROGO',
    description: 'This is a DROGO!',
    service_templates: {
      resources: [
        { href: 'http://localhost:3000/api/service_templates/2', name: 'template 2' },
        { href: 'http://localhost:3000/api/service_templates/6', name: 'template 6' },
      ],
    },
  };

  const urlFreeTemplates = '/api/service_templates?expand=resources&filter[]=service_template_catalog_id=null';
  const urlTemplates = '/api/service_catalogs/1001?expand=service_templates';

  // Helper function to get the submit button (filters "Add" buttons to find the submit type)
  const getSubmitButton = () => {
    const addButtons = screen.getAllByRole('button', { name: /^add$/i });
    return addButtons.find((btn) => btn.getAttribute('type') === 'submit');
  };

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render add variant form', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    // Mock any additional API calls that might be triggered
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });

    const { container } = renderWithRedux(<CatalogForm />);

    await waitFor(() => {
      expect(getSubmitButton()).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit variant form', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources }).getOnce(urlTemplates, assignedResources);
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });

    const { container } = renderWithRedux(<CatalogForm catalogId="1001" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should call cancel callback', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources }).getOnce(urlTemplates, assignedResources);
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });

    renderWithRedux(<CatalogForm catalogId="1001" />);
    const url = '/catalog/st_catalog_edit/1001?button=cancel';

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(spyMiqAjaxButton).toHaveBeenCalledWith(url);
  });

  it('should request data after mount and stop loading when creating new catalog', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });

    renderWithRedux(<CatalogForm />);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(fetchMock.called(urlFreeTemplates)).toBe(true);

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /^add$/i });
      const submitButton = addButtons.find((btn) => btn.getAttribute('type') === 'submit');
      expect(submitButton).toBeInTheDocument();
    });

    expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
  });

  it('should request data after mount and set to state when editing catalog', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources }).getOnce(urlTemplates, assignedResources);
    renderWithRedux(<CatalogForm catalogId="1001" />);

    expect(submitSpyMiqSparkleOn).toHaveBeenCalled();
    expect(fetchMock.called(urlFreeTemplates)).toBe(true);
    expect(fetchMock.called(urlTemplates)).toBe(true);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
  });

  it('should not submit values when form is not valid', async() => {
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });
    const urlCreate = '/api/service_catalogs';
    fetchMock.postOnce(urlCreate, {});

    renderWithRedux(<CatalogForm />);

    // Wait for form to load
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

    await userEvent.click(getSubmitButton());

    // Form should not submit without required fields
    expect(fetchMock.called(urlCreate)).toBe(false);
  });

  it('submit post data to API when adding new form', async() => {
    const urlCreate = '/api/service_catalogs';
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });
    fetchMock.postOnce(urlCreate, {});

    renderWithRedux(<CatalogForm />);

    // Wait for form to load
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

    // Fill in the form fields
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Some name');

    // Wait for debounced validation to complete (250ms debounce + API call)
    const submitButton = getSubmitButton();
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called(urlCreate)).toBe(true);
    });

    expect(spyMiqAjaxButton).toHaveBeenCalledWith('/catalog/st_catalog_edit?button=add', { name: 'Some name' });
  });

  it('submit post data to API when adding new form and get error back', async() => {
    const urlCreate = '/api/service_catalogs';
    const spyAddFlash = jest.spyOn(window, 'add_flash');
    const returnObject = {
      status: 400,
      body: {
        error: { message: 'something' },
      },
    };
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });
    fetchMock.postOnce(urlCreate, returnObject);

    renderWithRedux(<CatalogForm />);

    // Wait for form to load
    await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

    // Fill in the form fields
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Some name');

    // Wait for debounced validation to complete
    const submitButton = getSubmitButton();
    await waitFor(() => expect(submitButton).not.toBeDisabled());

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called(urlCreate)).toBe(true);
    });

    // Verify error was handled
    await waitFor(() => {
      expect(spyAddFlash).toHaveBeenCalledWith('something', 'error');
    });

    spyAddFlash.mockRestore();
  });

  it('submit post data to API when editing form and get error back', async() => {
    const spyAddFlash = jest.spyOn(window, 'add_flash');
    const returnObject = {
      status: 500,
      body: {
        error: { message: 'something' },
      },
    };
    const apiBase = '/api/service_catalogs/1001';

    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.getOnce('/api/service_catalogs/1001?expand=service_templates', assignedResources);
    fetchMock.get('begin:/api/service_catalogs', { resources: [] });
    fetchMock.postOnce(apiBase, returnObject);

    renderWithRedux(<CatalogForm catalogId="1001" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    // Fill in the form fields
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Some name');

    // Wait for debounced validation to complete
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called(apiBase)).toBe(true);
    });

    // Verify error was handled
    await waitFor(() => {
      expect(spyAddFlash).toHaveBeenCalledWith('something', 'error');
    });

    spyAddFlash.mockRestore();
  });

  it('submit post data to API when editing form and switching items in lists', async() => {
    const apiBase = '/api/service_catalogs/1001';
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.getOnce(urlTemplates, assignedResources);
    // Mock validation API to return the current catalog with matching ID (as string to match catalogId prop)
    fetchMock.get('begin:/api/service_catalogs?expand=resources&filter', {
      resources: [{ id: '1001', name: 'DROGO' }],
    });
    fetchMock.postOnce(apiBase, { id: '1001' });
    fetchMock.post(`${apiBase}/service_templates`, {});

    renderWithRedux(<CatalogForm catalogId="1001" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    // Wait for form validation to complete (validateOnMount is true)
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).toBeInTheDocument();
    });

    // Modify the form to enable submit button (form is pristine until changed)
    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated description');

    // Wait for form to recognize changes
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called(apiBase)).toBe(true);
    });
  });

  it('submit post data to API when editing form without switching items in lists', async() => {
    const apiBase = '/api/service_catalogs/1001';
    fetchMock.getOnce(urlFreeTemplates, { resources });
    fetchMock.getOnce(urlTemplates, assignedResources);
    // Mock validation API to return the current catalog
    fetchMock.get('begin:/api/service_catalogs?expand=resources&filter', {
      resources: [{ id: '1001', name: 'DROGO' }],
    });
    fetchMock.postOnce(apiBase, { id: '1001' });
    fetchMock.post(`${apiBase}/service_templates`, {});

    renderWithRedux(<CatalogForm catalogId="1001" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    // Change description but not service templates
    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated description');

    // Wait for form to recognize changes
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock.called(apiBase)).toBe(true);
    });

    // Verify service_templates endpoint was not called (no changes to service templates)
    expect(fetchMock.called(`${apiBase}/service_templates`)).toBe(false);
  });

  describe('#handleError', () => {
    it('should display generic error message', async() => {
      const spyAddFlash = jest.spyOn(window, 'add_flash');
      const urlCreate = '/api/service_catalogs';
      const returnObject = {
        status: 400,
        body: {
          error: { message: 'This is some nice error' },
        },
      };
      fetchMock.getOnce(urlFreeTemplates, { resources });
      fetchMock.get('begin:/api/service_catalogs', { resources: [] });
      fetchMock.postOnce(urlCreate, returnObject);

      renderWithRedux(<CatalogForm />);

      // Wait for form to load
      await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'Some name');

      // Wait for debounced validation to complete
      const submitButton = getSubmitButton();
      await waitFor(() => expect(submitButton).not.toBeDisabled());

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(spyAddFlash).toHaveBeenCalledWith('This is some nice error', 'error');
      });

      spyAddFlash.mockRestore();
    });

    it('should parse duplicate name error', async() => {
      const spyAddFlash = jest.spyOn(window, 'add_flash');
      const urlCreate = '/api/service_catalogs';
      const returnObject = {
        status: 400,
        body: {
          error: { message: 'Service catalog: Name has already been taken' },
        },
      };
      fetchMock.getOnce(urlFreeTemplates, { resources });
      fetchMock.get('begin:/api/service_catalogs', { resources: [] });
      fetchMock.postOnce(urlCreate, returnObject);

      renderWithRedux(<CatalogForm />);

      // Wait for form to load
      await waitFor(() => expect(screen.getByLabelText(/name/i)).toBeInTheDocument());

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'Some name');

      // Wait for debounced validation to complete
      const submitButton = getSubmitButton();
      await waitFor(() => expect(submitButton).not.toBeDisabled());

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(spyAddFlash).toHaveBeenCalledWith('Name has already been taken', 'error');
      });

      spyAddFlash.mockRestore();
    });
  });
});
