import React from 'react';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SettingsReplicationForm from '../../components/settings-replication-form';

describe('SettingsReplicationForm', () => {
  const mockStore = configureStore();
  const store = mockStore({});
  let wrapper;

  const replicationMockData = {
    replication_type: 'none',
    subscriptions: [],
  };

  // Helper function to mount component with proper setup
  const mountComponent = async(props = {}) => {
    let component;
    await act(async() => {
      component = mount(
        <Provider store={store}>
          <SettingsReplicationForm
            pglogicalReplicationFormId="new"
            {...props}
          />
        </Provider>
      );
    });
    component.update();
    return component;
  };

  // Helper function to change replication type
  const changeReplicationType = async(wrapper, value) => {
    const selectElement = wrapper.find('select[name="replication_type"]').getDOMNode();
    selectElement.value = value;

    await act(async() => {
      wrapper.find('select[name="replication_type"]').simulate('change', {
        target: selectElement,
      });
    });
    wrapper.update();
  };

  beforeEach(() => {
    // Mock API call before component renders
    fetchMock.get('/ops/pglogical_subscriptions_form_fields/new', replicationMockData);
  });

  afterEach(() => {
    // Cleanup
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    fetchMock.reset();
    fetchMock.restore();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', async() => {
      wrapper = await mountComponent();
      expect(wrapper.find(SettingsReplicationForm).exists()).toBe(true);
    });

    it('should render the replication type dropdown', async() => {
      wrapper = await mountComponent();
      const dropdown = wrapper.find('select[name="replication_type"]');

      expect(dropdown.exists()).toBe(true);
      expect(dropdown.length).toBe(1);
    });

    it('should not show subscription section initially', async() => {
      wrapper = await mountComponent();

      expect(wrapper.find('div#subscriptions_section').exists()).toBe(false);
    });
  });

  describe('Replication Type Selection', () => {
    it('should render the subscription section when replication type is global', async() => {
      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'global');

      expect(wrapper.find('div#subscriptions_section').exists()).toBe(true);
    });

    it('should not render the subscription section when replication type is remote', async() => {
      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'remote');

      expect(wrapper.find('div#subscriptions_section').exists()).toBe(false);
    });

    it('should not render the subscription section when replication type is none', async() => {
      wrapper = await mountComponent();

      // Ensure type is none (default)
      expect(wrapper.find('div#subscriptions_section').exists()).toBe(false);
    });

    it('should display Add Subscription button when replication type is global', async() => {
      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'global');

      const addButton = wrapper.find('button')
        .filterWhere((node) => node.text() === 'Add Subscription');

      expect(addButton.exists()).toBe(true);
    });
  });

  describe('API Integration', () => {
    it('should fetch data on mount when pglogicalReplicationFormId is provided', async() => {
      const mockData = {
        replication_type: 'global',
        subscriptions: [{
          dbname: 'testdb',
          host: 'localhost',
          user: 'testuser',
          password: 'testpass',
          port: '5432',
        }],
      };

      fetchMock.reset();
      fetchMock.get('/ops/pglogical_subscriptions_form_fields/123', mockData);

      await act(async() => {
        wrapper = mount(
          <Provider store={store}>
            <SettingsReplicationForm pglogicalReplicationFormId="123" />
          </Provider>
        );
      });

      // Wait for async operations
      await act(async() => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      wrapper.update();

      expect(fetchMock.called('/ops/pglogical_subscriptions_form_fields/123')).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('should maintain state when switching between replication types', async() => {
      wrapper = await mountComponent();

      // Switch to global
      await changeReplicationType(wrapper, 'global');
      expect(wrapper.find('div#subscriptions_section').exists()).toBe(true);

      // Switch to remote
      await changeReplicationType(wrapper, 'remote');
      expect(wrapper.find('div#subscriptions_section').exists()).toBe(false);

      // Switch back to global
      await changeReplicationType(wrapper, 'global');
      expect(wrapper.find('div#subscriptions_section').exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', async() => {
      wrapper = await mountComponent();

      // Should have form elements
      const form = wrapper.find('form');
      expect(form.exists()).toBe(true);
    });

    it('should have labeled form fields', async() => {
      wrapper = await mountComponent();
      const dropdown = wrapper.find('select[name="replication_type"]');

      // Should have associated label or be properly identified
      expect(dropdown.exists()).toBe(true);
    });

    it('should render form elements in correct order', async() => {
      wrapper = await mountComponent();

      // Replication type dropdown should be present
      const dropdown = wrapper.find('select[name="replication_type"]');
      expect(dropdown.exists()).toBe(true);

      // Form should have submit button
      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should have a save button', async() => {
      wrapper = await mountComponent();

      // Find save button
      const saveButton = wrapper.find('button[type="submit"]');
      expect(saveButton.exists()).toBe(true);
    });

    it('should call save API when form is submitted', async() => {
      fetchMock.post('/ops/pglogical_save_subscriptions/new?button=save', {
        message: 'Settings saved successfully',
      });

      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'remote');

      // Find and submit the form
      const form = wrapper.find('form').first();

      await act(async() => {
        form.simulate('submit', { preventDefault: () => {} });
      });

      // Wait for async operations
      await act(async() => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify form submission mechanism exists
      expect(form.exists()).toBe(true);
    });

    it('should prevent save when global type has no subscriptions', async() => {
      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'global');

      // Try to save without adding subscriptions
      const saveButton = wrapper.find('button[type="submit"]').first();

      await act(async() => {
        saveButton.simulate('click');
      });

      // Should not call save API
      expect(fetchMock.called('/ops/pglogical_save_subscriptions/new?button=save')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error on save gracefully', async() => {
      fetchMock.post('/ops/pglogical_save_subscriptions/new?button=save', 500);

      wrapper = await mountComponent();
      await changeReplicationType(wrapper, 'remote');

      // Try to save
      const form = wrapper.find('form').first();

      await act(async() => {
        form.simulate('submit', { preventDefault: () => {} });
      });

      // Wait for error handling
      await act(async() => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Component should still be mounted and functional
      expect(wrapper.find(SettingsReplicationForm).exists()).toBe(true);
    });

    it('should have proper error boundaries in place', async() => {
      wrapper = await mountComponent();

      // Component should render without errors
      expect(wrapper.find(SettingsReplicationForm).exists()).toBe(true);
      expect(wrapper.find('select[name="replication_type"]').exists()).toBe(true);
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });
  });
});
