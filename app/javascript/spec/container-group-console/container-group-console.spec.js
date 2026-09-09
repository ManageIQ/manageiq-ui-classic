import {
  render, screen, act, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from 'xterm';
import ContainerGroupConsole from '../../components/container-group-console/index';

const MockedTerminal = jest.mocked(Terminal);

// xterm mocks

let mockTerm;

const makeMockTerm = () => ({
  loadAddon: jest.fn(),
  open: jest.fn(),
  focus: jest.fn(),
  clear: jest.fn(),
  write: jest.fn(),
  writeln: jest.fn(),
  dispose: jest.fn(),
  onData: jest.fn(),
});

jest.mock('xterm', () => ({ Terminal: jest.fn() }));
jest.mock('xterm-addon-fit', () => ({ FitAddon: jest.fn(() => ({ fit: jest.fn() })) }));
jest.mock('xterm/css/xterm.css', () => {});

// Websocket mocks

let lastWs = null;

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.binaryType = '';
    this.readyState = MockWebSocket.OPEN;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.close = jest.fn();
    this.send = jest.fn();
    lastWs = this;
  }
}
MockWebSocket.OPEN = 1;
global.WebSocket = MockWebSocket;

// Stubs fetch to return each body in sequence; returns a safe {} for any extra call.
const mockFetch = (responses) => {
  let call = 0;
  global.fetch = jest.fn(() => {
    const body = call < responses.length ? responses[call++] : {};
    return Promise.resolve({ json: () => Promise.resolve(body) });
  });
};

beforeEach(() => {
  mockTerm = makeMockTerm();
  MockedTerminal.mockImplementation(() => mockTerm);

  lastWs = null;
  // Default: safe stub so .then() chains in any incidentally-triggered effect don't throw.
  mockFetch([]);
});

describe('ContainerGroupConsole', () => {
  describe('initial render', () => {
    it('mounts the xterm terminal and writes the initial prompt', () => {
      render(<ContainerGroupConsole podId="pod-1" containers={[]} />);
      expect(MockedTerminal).toHaveBeenCalledWith({ cursorBlink: true });
      expect(mockTerm.open).toHaveBeenCalled();
      expect(mockTerm.writeln).toHaveBeenCalledWith('Select a container and click Connect.');
    });

    it('hides the toolbar for 0 or 1 containers', () => {
      const { rerender } = render(<ContainerGroupConsole podId="pod-1" containers={[]} />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

      rerender(<ContainerGroupConsole podId="pod-1" containers={['web']} />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('renders the toolbar with options and buttons for multiple containers', () => {
      render(<ContainerGroupConsole podId="pod-1" containers={['web', 'sidecar']} />);
      expect(screen.getByRole('option', { name: 'web' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'sidecar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeDisabled();
    });
  });

  describe('connecting flow', () => {
    // Click Connect and wait until both fetch calls have resolved.
    const clickConnect = async(fetchResponses = [{ task_id: 'task-1' }, { url: 'ws-path' }]) => {
      mockFetch(fetchResponses);
      const user = userEvent.setup();
      render(<ContainerGroupConsole podId="pod-1" containers={['web', 'sidecar']} />);
      await user.selectOptions(screen.getByRole('combobox'), 'web');
      await user.click(screen.getByRole('button', { name: /connect/i }));
      // Wait for all fetch chains to settle.
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(fetchResponses.length);
      });
      return user;
    };

    it('auto-connects when there is exactly one container', async() => {
      mockFetch([{ task_id: 'task-1' }, { url: 'ws-path' }]);
      render(<ContainerGroupConsole podId="pod-1" containers={['web']} />);
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('container=web'),
          expect.any(Object)
        );
      });
    });

    it('writes "Connecting to …" and disables controls while fetching', async() => {
      // Stall fetch indefinitely — we only care about the mid-flight UI state.
      // Leaving the promise pending avoids scheduling a pollTask retry timer.
      global.fetch = jest.fn().mockReturnValueOnce(new Promise(() => {}));
      const user = userEvent.setup();
      render(<ContainerGroupConsole podId="pod-1" containers={['web', 'sidecar']} />);
      await user.selectOptions(screen.getByRole('combobox'), 'web');
      await user.click(screen.getByRole('button', { name: /connect/i }));

      expect(mockTerm.writeln).toHaveBeenCalledWith('Connecting to web...');
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('button', { name: /connect/i })).toBeDisabled();
    });

    it('opens a WebSocket and updates the UI once connected', async() => {
      await clickConnect();
      await act(async() => {
        lastWs.onopen();
      });

      expect(lastWs.url).toMatch(/ws-path/);
      expect(mockTerm.writeln).toHaveBeenCalledWith('Connected to web');
      expect(screen.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).not.toBeDisabled();
    });

    it('retries polling after 1 s when the task is still pending', async() => {
      jest.useFakeTimers();
      mockFetch([{ task_id: 'task-1' }, {}, { url: 'ws-path' }]);
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ContainerGroupConsole podId="pod-1" containers={['web', 'sidecar']} />);
      await user.selectOptions(screen.getByRole('combobox'), 'web');
      await user.click(screen.getByRole('button', { name: /connect/i }));

      // Let startConsole + first poll settle.
      await act(async() => {
        await Promise.resolve(); await Promise.resolve();
      });
      // Fire the 1-second retry timer and let the third fetch settle.
      await act(async() => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(fetch).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    it('shows a server error from startConsole and re-enables controls', async() => {
      await clickConnect([{ error: 'pod not found' }]);
      expect(mockTerm.writeln).toHaveBeenCalledWith('pod not found');
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });

    it('shows a poll error and re-enables controls', async() => {
      await clickConnect([{ task_id: 'task-1' }, { error: 'exec failed' }]);
      expect(mockTerm.writeln).toHaveBeenCalledWith('\r\n[error] exec failed');
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });
  });

  describe('WebSocket message handling', () => {
    let user;
    let unmount;

    beforeEach(async() => {
      mockFetch([{ task_id: 'task-1' }, { url: 'ws-path' }]);
      user = userEvent.setup();
      ({ unmount } = render(<ContainerGroupConsole podId="pod-1" containers={['web', 'sidecar']} />));
      await user.selectOptions(screen.getByRole('combobox'), 'web');
      await user.click(screen.getByRole('button', { name: /connect/i }));
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
      await act(async() => {
        lastWs.onopen();
      });
    });

    it('writes text messages to the terminal', async() => {
      await act(async() => {
        lastWs.onmessage({ data: 'hello' });
      });
      expect(mockTerm.write).toHaveBeenCalledWith('hello');
    });

    it('writes ArrayBuffer messages as Uint8Array', async() => {
      const buf = new ArrayBuffer(4);
      await act(async() => {
        lastWs.onmessage({ data: buf });
      });
      expect(mockTerm.write).toHaveBeenCalledWith(new Uint8Array(buf));
    });

    it('forwards keyboard input to the socket', async() => {
      const onDataCallback = mockTerm.onData.mock.calls[0][0];
      await act(async() => {
        onDataCallback('ls\r');
      });
      expect(lastWs.send).toHaveBeenCalledWith('ls\r');
    });

    it('shows "[connection error]" and resets on onerror', async() => {
      await act(async() => {
        lastWs.onerror();
      });
      expect(mockTerm.writeln).toHaveBeenCalledWith('\r\n[connection error]');
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });

    it('Close button tears down the socket and resets to "Connect"', async() => {
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(lastWs.close).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
    });

    it('closes the socket and disposes the terminal on unmount', () => {
      lastWs.onclose = null; // prevent state updates on the unmounted tree
      unmount();
      expect(lastWs.close).toHaveBeenCalled();
      expect(mockTerm.dispose).toHaveBeenCalled();
    });
  });
});
