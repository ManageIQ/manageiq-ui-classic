import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import { renderWithRedux } from '../helpers/mountForm';
import SettingsHelpMenuTab from '../../components/settings-help-menu-form';

const regionId = 42;
const settingsUrl = `/api/regions/${regionId}/settings`;
const docsUrl = '/api/settings/docs';

const docsDefaults = {
  docs: {
    product_documentation_website: 'https://www.manageiq.org/docs/',
    product_documentation_direct_link: true,
    product_support_website: 'https://www.manageiq.org',
    product_support_website_text: 'ManageIQ.org',
  },
};

const helpMenuSettings = {
  help_menu: {
    documentation: { title: 'Documentation', url: 'https://www.manageiq.org/docs/', type: 'default' },
    product: { title: 'ManageIQ.org', url: 'https://www.manageiq.org', type: 'new_window' },
    about: { title: 'About', url: '/about', type: 'modal' },
  },
};

const mockBothApis = () => {
  fetchMock.getOnce(settingsUrl, helpMenuSettings);
  fetchMock.getOnce(docsUrl, docsDefaults);
};

describe('SettingsHelpMenuTab', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('renders the form after loading settings', async() => {
    mockBothApis();

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(fetchMock.called(settingsUrl)).toBe(true));
    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());
    expect(container).toMatchSnapshot();
  });

  it('shows a success notification after a successful save', async() => {
    const user = userEvent.setup();
    mockBothApis();
    fetchMock.patchOnce(settingsUrl, { help_menu: helpMenuSettings.help_menu });

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    await user.type(container.querySelector('[name="documentation_title"]'), ' updated');
    await user.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(3));
    await waitFor(() => expect(container.querySelector('.cds--inline-notification--success')).toBeInTheDocument());
  });

  it('shows an error notification on a failed save', async() => {
    const user = userEvent.setup();
    mockBothApis();
    fetchMock.patchOnce(settingsUrl, { status: 500, body: {} });

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    await user.type(container.querySelector('[name="documentation_title"]'), ' updated');
    await user.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(3));
    await waitFor(() => expect(container.querySelector('.cds--inline-notification--error')).toBeInTheDocument());
  });

  it('submits the placeholder default when a title field is left blank', async() => {
    const user = userEvent.setup();
    mockBothApis();
    fetchMock.patchOnce(settingsUrl, 200);

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    // Clear the documentation title to make the form dirty
    const docTitleInput = container.querySelector('[name="documentation_title"]');
    await user.tripleClick(docTitleInput);
    await user.keyboard('[Backspace]');

    await user.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(3));
    const patchBody = JSON.parse(fetchMock.calls()[2][1].body);
    // Blank field should fall back to the hardcoded placeholder, not null.
    expect(patchBody.help_menu.documentation.title).toBe('Documentation');
  });

  it('blocks submission when about_url is empty', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce(settingsUrl, {
      help_menu: {
        ...helpMenuSettings.help_menu,
        about: { title: 'About', url: '/about', type: 'default' },
      },
    });
    fetchMock.getOnce(docsUrl, docsDefaults);

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    // Clear the about url
    const aboutUrlInput = container.querySelector('[name="about_url"]');
    await user.tripleClick(aboutUrlInput);
    await user.keyboard('[Backspace]');

    // Submit button should be disabled due to validation
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeDisabled();
  });

  it('sends an empty string for about_url when about_type is About Modal', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce(settingsUrl, {
      help_menu: {
        ...helpMenuSettings.help_menu,
        about: { title: 'About', url: '/about', type: 'default' },
      },
    });
    fetchMock.getOnce(docsUrl, docsDefaults);
    fetchMock.patchOnce(settingsUrl, 200);

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);

    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    // Switch to About Modal — url field should become disabled
    const aboutTypeSelect = container.querySelector('[name="about_type"]');
    await user.selectOptions(aboutTypeSelect, 'modal');

    // The url field should be disabled
    await waitFor(() => expect(container.querySelector('[name="about_url"]')).toBeDisabled());

    await user.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(fetchMock.calls()).toHaveLength(3));
    const patchBody = JSON.parse(fetchMock.calls()[2][1].body);
    expect(patchBody.help_menu.about.url).toBe('');
    expect(patchBody.help_menu.about.type).toBe('modal');
  });

  it('clears the about_url validation error when switching back to About Modal', async() => {
    const user = userEvent.setup();
    fetchMock.getOnce(settingsUrl, {
      help_menu: {
        ...helpMenuSettings.help_menu,
        about: { title: 'About', url: '/about', type: 'default' },
      },
    });
    fetchMock.getOnce(docsUrl, docsDefaults);
    fetchMock.patchOnce(settingsUrl, 200);

    const { container } = renderWithRedux(<SettingsHelpMenuTab regionId={regionId} />);
    await waitFor(() => expect(container.querySelector('form')).toBeInTheDocument());

    const aboutTypeSelect = container.querySelector('[name="about_type"]');
    const aboutUrlInput = container.querySelector('[name="about_url"]');

    // Dirty the form via a title field so pristine is never the blocker.
    await user.type(container.querySelector('[name="documentation_title"]'), ' x');

    // Switch to a non-modal type and clear the URL to produce a validation error.
    await user.selectOptions(aboutTypeSelect, 'new_window');
    await user.tripleClick(aboutUrlInput);
    await user.keyboard('[Backspace]');
    await waitFor(() => expect(container.querySelector('button[type="submit"]')).toBeDisabled());

    // Switch back to About Modal — the validation error must clear and allow submit.
    await user.selectOptions(aboutTypeSelect, 'modal');
    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeDisabled());

    await user.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(fetchMock.calls()).toHaveLength(3));
    const patchBody = JSON.parse(fetchMock.calls()[2][1].body);
    expect(patchBody.help_menu.about.url).toBe('');
    expect(patchBody.help_menu.about.type).toBe('modal');
  });
});
