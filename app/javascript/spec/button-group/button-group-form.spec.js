import React from 'react';
import fetchMock from 'fetch-mock';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import GroupForm from '../../components/button-group';

import '../helpers/miqAjaxButton';

describe('Button Group form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });

  it('should render the adding form', async() => {
    const { container } = renderWithRedux(<GroupForm availableFields={[]} fields={[]} />);

    await waitFor(() => {
      // Get all buttons with "Add" text and find the submit button
      const addButtons = screen.getAllByRole('button', { name: /^add$/i });
      const submitButton = addButtons.find((btn) => btn.getAttribute('type') === 'submit');
      expect(submitButton).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render the adding form for generic object button groups', async() => {
    // Mock the API calls that happen on mount for generic objects
    fetchMock.getOnce('/api/custom_buttons?expand=resources&filter[]=applies_to_class=GenericObjectDefinition&filter[]=applies_to_id=6', {
      resources: [],
    });
    fetchMock.getOnce('/api/custom_button_sets?expand=resources&filter[]=owner_type=GenericObjectDefinition&filter[]=owner_id=6', { resources: [] });

    const { container } = renderWithRedux(
      <GroupForm url="/generic_object_definition/" appliesToId={6} appliesToClass="GenericObjectDefinition" isGenericObject />
    );

    await waitFor(() => {
      // Get all buttons with "Add" text and find the submit button
      const addButtons = screen.getAllByRole('button', { name: /^add$/i });
      const submitButton = addButtons.find((btn) => btn.getAttribute('type') === 'submit');
      expect(submitButton).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render the editing form', async() => {
    const expectedResult = {
      description: 'OP VM Group',
      group_id: null,
      id: '42',
      mode: null,
      name: 'OP VM Group|Vm|',
      set_data: {
        button_color: '#ed1a21',
        button_icon: 'pficon pficon-cluster',
        button_order: [15],
        display: true,
        group_index: 3,
        set_type: 'CustomButtonSet',
        applies_to_class: '',
      },
    };
    fetchMock.getOnce('/api/custom_button_sets/42', expectedResult);
    fetchMock.postOnce('/api/custom_button_sets/42', expectedResult);

    const { container } = renderWithRedux(<GroupForm recId={42} availableFields={[]} fields={[]} url="" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.called('/api/custom_button_sets/42')).toBe(true);
    expect(container).toMatchSnapshot();
  });

  it('should render the editing form for generic object button group', async() => {
    const expectedResult = {
      description: 'test',
      group_id: null,
      id: '219',
      mode: null,
      name: 'test group form',
      set_data: {
        button_color: 'ffffff',
        button_icon: 'pficon pficon-applications',
        button_order: [105, 106, 107],
        display: true,
        applies_to_class: 'GenericObjectDefinition',
        applies_to_id: '6',
      },
      set_type: 'CustomButtonSet',
    };
    fetchMock.getOnce('/api/custom_button_sets/219', expectedResult);
    fetchMock.getOnce('/api/custom_buttons?expand=resources&filter[]=applies_to_class=GenericObjectDefinition&filter[]=applies_to_id=6', {
      resources: [],
    });
    fetchMock.getOnce('/api/custom_button_sets?expand=resources&filter[]=owner_type=GenericObjectDefinition&filter[]=owner_id=6', { resources: [] });
    fetchMock.postOnce('/api/custom_button_sets/219', expectedResult);

    const { container } = renderWithRedux(
      <GroupForm url="/generic_object_definition/" recId={219} appliesToId={6} appliesToClass="GenericObjectDefinition" isGenericObject />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(fetchMock.called('/api/custom_button_sets/219')).toBe(true);
    expect(container).toMatchSnapshot();
  });
});
