import { render, screen, fireEvent } from '@testing-library/react';

import MiqToolbar from '../../components/miq-toolbar';
import { sendDataWithRx } from '../../miq_observable';

jest.mock('../../miq_observable', () => ({
  sendDataWithRx: jest.fn(),
  listenToRx: jest.fn(() => ({ unsubscribe: jest.fn() })),
}));

const dashboardData = [
  [
    {
      custom: true,
      name: 'dashboard',
      props: {
        allowAdd: true,
        allowReset: true,
        locked: false,
        items: [
          {
            id: 31,
            type: 'button',
            text: 'add',
            image: 'fa fa-pie-chart fa-lg',
            title: 'Add',
          },
        ],
      },
    },
  ],
];

const genericData = [
  [
    {
      id: 'summary_reload',
      type: 'button',
      icon: 'fa fa-refresh fa-lg',
      name: 'summary_reload',
      title: 'Refresh this page',
    },
  ],
];

const toolbarWithFunction = (fnString, fnData) => [[{
  id: 'test_button',
  type: 'button',
  icon: 'fa fa-refresh fa-lg',
  name: 'test_button',
  title: 'Test',
  enabled: true,
  data: { function: fnString, 'function-data': fnData },
}]];

describe('<MiqToolbar />', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn();
    sendDataWithRx.mockClear();
  });

  it('renders DashboardToolbar', () => {
    render(<MiqToolbar kebabLimit={3} toolbars={dashboardData} />);
    expect(screen.getByTitle('Add widget')).toBeInTheDocument();
  });

  it('renders Toolbar', () => {
    render(<MiqToolbar kebabLimit={3} toolbars={genericData} />);
    expect(screen.getByTitle('Refresh this page')).toBeInTheDocument();
  });

  describe('onClick with data.function', () => {
    it('calls a dot-path global function with the correct this and function-data', () => {
      const mockFn = jest.fn();
      window.myNamespace = { myAction: mockFn };

      render(<MiqToolbar kebabLimit={3} toolbars={toolbarWithFunction('myNamespace.myAction', { foo: 'bar' })} />);
      fireEvent.click(screen.getByTitle('Test'));

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn.mock.instances[0]).toBe(window.myNamespace);
      expect(mockFn).toHaveBeenCalledWith({ foo: 'bar' });

      delete window.myNamespace;
    });

    it('calls a nested function with the parent as this', () => {
      const mockFn = jest.fn();
      window.testNs = { nested: { action: mockFn } };

      render(<MiqToolbar kebabLimit={3} toolbars={toolbarWithFunction('testNs.nested.action', undefined)} />);
      fireEvent.click(screen.getByTitle('Test'));

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn.mock.instances[0]).toBe(window.testNs.nested);

      delete window.testNs;
    });

    it('falls back to sendDataWithRx when function name does not resolve', () => {
      const payload = { controller: 'someController' };
      render(<MiqToolbar kebabLimit={3} toolbars={toolbarWithFunction('nonExistentFunction', payload)} />);
      fireEvent.click(screen.getByTitle('Test'));

      expect(sendDataWithRx).toHaveBeenCalledWith(payload);
    });
  });
});
