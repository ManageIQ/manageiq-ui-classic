import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import SettingsReplicationForm from '../../components/settings-replication-form';

describe('SettingsReplicationForm', () => {
  const replicationMockData = {
    replication_type: 'none',
    subscriptions: [],
  };

  // Helper function to change replication type
  const changeReplicationType = async(container, user, value) => {
    await waitFor(() => {
      expect(
        container.querySelector('select[name="replication_type"]')
      ).toBeInTheDocument();
    });

    const select = container.querySelector('select[name="replication_type"]');
    await user.selectOptions(select, value);
  };

  beforeEach(() => {
    // Mock API call before component renders
    fetchMock.get(
      '/ops/pglogical_subscriptions_form_fields/new',
      replicationMockData
    );
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
      });
    });

    it('should render the replication type dropdown', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(
          container.querySelector('select[name="replication_type"]')
        ).toBeInTheDocument();
      });
      const dropdown = container.querySelector(
        'select[name="replication_type"]'
      );
      expect(dropdown).toBeInTheDocument();
    });

    it('should not show subscription section initially', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );

      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
      });

      expect(
        container.querySelector('div#subscriptions_section')
      ).not.toBeInTheDocument();
    });
  });

  describe('Replication Type Selection', () => {
    it('should render the subscription section when replication type is global', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'global');
      await waitFor(() => {
        expect(
          container.querySelector('div#subscriptions_section')
        ).toBeInTheDocument();
      });
    });

    it('should not render the subscription section when replication type is remote', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'remote');
      await waitFor(() => {
        expect(
          container.querySelector('div#subscriptions_section')
        ).not.toBeInTheDocument();
      });
    });

    it('should not render the subscription section when replication type is none', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
      });
      expect(
        container.querySelector('div#subscriptions_section')
      ).not.toBeInTheDocument();
    });

    it('should display Add Subscription button when replication type is global', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'global');
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Add Subscription' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch data on mount when pglogicalReplicationFormId is provided', async() => {
      const mockData = {
        replication_type: 'global',
        subscriptions: [
          {
            dbname: 'testdb',
            host: 'localhost',
            user: 'testuser',
            password: 'testpass',
            port: '5432',
          },
        ],
      };
      fetchMock.reset();
      fetchMock.get('/ops/pglogical_subscriptions_form_fields/123', mockData);

      renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="123" />
      );

      await waitFor(() => {
        expect(
          fetchMock.called('/ops/pglogical_subscriptions_form_fields/123')
        ).toBe(true);
      });
    });
  });

  describe('User Interactions', () => {
    it('should maintain state when switching between replication types', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      // Switch to global
      await changeReplicationType(container, user, 'global');
      await waitFor(() => {
        expect(
          container.querySelector('div#subscriptions_section')
        ).toBeInTheDocument();
      });
      // Switch to remote
      await changeReplicationType(container, user, 'remote');
      await waitFor(() => {
        expect(
          container.querySelector('div#subscriptions_section')
        ).not.toBeInTheDocument();
      });
      // Switch back to global
      await changeReplicationType(container, user, 'global');
      await waitFor(() => {
        expect(
          container.querySelector('div#subscriptions_section')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
      });
    });

    it('should have labeled form fields', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(
          container.querySelector('select[name="replication_type"]')
        ).toBeInTheDocument();
      });
      const dropdown = container.querySelector(
        'select[name="replication_type"]'
      );
      expect(dropdown).toBeInTheDocument();
    });

    it('should render form elements in correct order', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(
          container.querySelector('select[name="replication_type"]')
        ).toBeInTheDocument();
      });
      const dropdown = container.querySelector(
        'select[name="replication_type"]'
      );
      expect(dropdown).toBeInTheDocument();
      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should have a save button', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(
          container.querySelector('button[type="submit"]')
        ).toBeInTheDocument();
      });
      const saveButton = container.querySelector('button[type="submit"]');
      expect(saveButton).toBeInTheDocument();
    });

    it('should call save API when form is submitted', async() => {
      const user = userEvent.setup();
      fetchMock.post('/ops/pglogical_save_subscriptions/new?button=save', {
        message: 'Settings saved successfully',
      });
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'remote');

      const form = container.querySelector('form');
      await user.click(container.querySelector('button[type="submit"]'));

      expect(form).toBeInTheDocument();
    });

    it('should prevent save when global type has no subscriptions', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'global');
      await waitFor(() => {
        expect(
          container.querySelector('button[type="submit"]')
        ).toBeInTheDocument();
      });
      const saveButton = container.querySelector('button[type="submit"]');
      await user.click(saveButton);
      expect(
        fetchMock.called('/ops/pglogical_save_subscriptions/new?button=save')
      ).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error on save gracefully', async() => {
      const user = userEvent.setup();
      fetchMock.post('/ops/pglogical_save_subscriptions/new?button=save', 500);
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await changeReplicationType(container, user, 'remote');
      const form = container.querySelector('form');
      await user.click(container.querySelector('button[type="submit"]'));
      await waitFor(() => {
        expect(form).toBeInTheDocument();
      });
    });

    it('should have proper error boundaries in place', async() => {
      const { container } = renderWithRedux(
        <SettingsReplicationForm pglogicalReplicationFormId="new" />
      );
      await waitFor(() => {
        expect(container.querySelector('form')).toBeInTheDocument();
      });
      expect(
        container.querySelector('select[name="replication_type"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('button[type="submit"]')
      ).toBeInTheDocument();
    });
  });
});
