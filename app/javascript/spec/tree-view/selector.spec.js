import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import { FormTemplate, componentMapper } from '@data-driven-forms/pf3-component-mapper';
import TreeViewSelector from '../../components/tree-view/selector';

const RendererWrapper = ({ initialValue, onSubmit = () => {}, ...props }) => (
  <FormRenderer
    onSubmit={onSubmit}
    FormTemplate={FormTemplate}
    componentMapper={{
      ...componentMapper,
      'tree-selector': TreeViewSelector,
    }}
    schema={{
      fields: [{
        component: 'tree-selector',
        name: 'tree-selector',
        label: 'tree-selector',
        loadData: () => Promise.resolve([{
          key: 'root',
          icon: 'pficon pficon-folder-close',
          selectable: true,
          text: 'root node',
          tooltip: 'root node',
          state: {},
        }]),
        identifier: node => node.attr.key,
        isClearable: true,
        initialValue,
      }],
    }}
    {...props}
  />
);

describe('TreeSelector component', () => {
  it('should render correctly', async(done) => {
    const wrapper = mount(<RendererWrapper />);
    setImmediate(() => {
      expect(toJson(wrapper.find(TreeViewSelector))).toMatchSnapshot();
      done();
    });
  });

  it('should set the value upon selection in the modal', async(done) => {
    const wrapper = mount(<RendererWrapper />);

    await act(async() => {
      wrapper.find('button[name="tree-selector-toggle"]').simulate('click');
    });

    await act(async() => {
      wrapper.update();
      wrapper.find('Modal').find('li span').simulate('click');
    });

    await act(async() => {
      wrapper.update();
      wrapper.find('Modal').find('button.btn-primary').simulate('click');
    });

    wrapper.update();
    expect(wrapper.find(RendererWrapper).find('input').instance().value).toEqual('root');

    done();
  });

  it('should clear the value upon clicking the clear button', async(done) => {
    const wrapper = mount(<RendererWrapper initialValue="test" />);

    expect(wrapper.find(RendererWrapper).find('input').instance().value).toEqual('test');

    await act(async() => {
      wrapper.find('button[name="tree-selector-clear"]').simulate('click');
    });

    wrapper.update();
    expect(wrapper.find(RendererWrapper).find('input').instance().value).toEqual('');

    done();
  });
});
