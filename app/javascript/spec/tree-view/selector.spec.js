import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormRenderer } from '@data-driven-forms/react-form-renderer';
import {
  FormTemplate,
  componentMapper,
} from '@data-driven-forms/carbon-component-mapper';
import TreeViewSelector from '../../components/tree-view/selector';

// eslint-disable-next-line react/prop-types
const RendererWrapper = ({ initialValue, onSubmit = () => {}, ...props }) => (
  <FormRenderer
    onSubmit={onSubmit}
    FormTemplate={FormTemplate}
    componentMapper={{
      ...componentMapper,
      'tree-selector': TreeViewSelector,
    }}
    schema={{
      fields: [
        {
          component: 'tree-selector',
          name: 'tree-selector',
          label: 'tree-selector',
          loadData: () =>
            Promise.resolve([
              {
                key: 'root',
                icon: 'pficon pficon-folder-close',
                selectable: true,
                text: 'root node',
                tooltip: 'root node',
                state: {},
              },
            ]),
          identifier: (node) => node.attr.key,
          isClearable: true,
          initialValue,
        },
      ],
    }}
    {...props}
  />
);

describe('TreeSelector component', () => {
  it('should render correctly', async() => {
    const { container } = render(<RendererWrapper />);
    await waitFor(() => {
      expect(
        container.querySelector('.tree-selector-toggle')
      ).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should set the value upon selection in the modal', async() => {
    const user = userEvent.setup();
    const { container } = render(<RendererWrapper />);

    await waitFor(() => {
      expect(
        container.querySelector('button.tree-selector-toggle')
      ).toBeInTheDocument();
    });

    const toggleButton = container.querySelector('button.tree-selector-toggle');
    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        container.querySelector('.cds--modal-content .react-tree-view')
      ).toBeInTheDocument();
    });

    const treeNode = container.querySelector(
      '.cds--modal-content .react-tree-view li span'
    );
    await user.click(treeNode);
    await waitFor(() => {
      expect(
        container.querySelector('.cds--modal-footer button.cds--btn--primary')
      ).toBeInTheDocument();
    });

    const submitButton = container.querySelector(
      '.cds--modal-footer button.cds--btn--primary'
    );
    await user.click(submitButton);
    await waitFor(() => {
      const input = container.querySelector('input');
      expect(input.value).toEqual('root');
    });
  });

  it('should clear the value upon clicking the clear button', async() => {
    const user = userEvent.setup();
    const { container } = render(<RendererWrapper initialValue="test" />);

    await waitFor(() => {
      const input = container.querySelector('input');
      expect(input.value).toEqual('test');
    });

    const clearButton = container.querySelector('button.tree-selector-clear');
    await user.click(clearButton);
    await waitFor(() => {
      const input = container.querySelector('input');
      expect(input.value).toEqual('');
    });
  });
});
