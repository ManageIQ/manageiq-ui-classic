import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiqErrorModal from '../../components/miq-error-modal/miq-error-modal';

describe('MiqErrorModal', () => {
  let emitRx;

  beforeEach(() => {
    window.listenToRx = (callback) => {
      emitRx = callback;
      return { unsubscribe: jest.fn() };
    };
  });

  afterEach(() => {
    delete window.listenToRx;
  });

  it('renders nothing initially', () => {
    const { container } = render(<MiqErrorModal />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Rails controller JSON error with message property', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: { success: false, message: 'Report was not saved due to validation errors' },
          status: 422,
          statusText: 'Unprocessable Content',
          url: 'http://localhost:3000/report/save/590',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json; charset=utf-8' : undefined),
          },
        },
        source: 'fetch',
        backendName: 'http',
      });
    });

    expect(screen.getByText('Server Error (http)')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3000/report/save/590')).toBeInTheDocument();
    expect(screen.getByText('422 Unprocessable Content')).toBeInTheDocument();
    expect(screen.getByText('application/json; charset=utf-8')).toBeInTheDocument();
    expect(screen.getByText('Report was not saved due to validation errors')).toBeInTheDocument();
  });

  it('renders REST API error format with data.error.message', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: { error: { message: 'Record not found', kind: 'not_found' } },
          status: 404,
          statusText: 'Not Found',
          url: 'http://localhost:3000/api/vms/1',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json' : undefined),
          },
        },
        source: 'fetch',
        backendName: 'API',
      });
    });

    expect(screen.getByText('Server Error (API)')).toBeInTheDocument();
    expect(screen.getByText('Record not found')).toBeInTheDocument();
  });

  it('renders error object with data.error as a string', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: { error: 'Unauthorized access' },
          status: 403,
          statusText: 'Forbidden',
          url: 'http://localhost:3000/api/custom',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json' : undefined),
          },
        },
        source: 'fetch',
      });
    });

    expect(screen.getByText('Unauthorized access')).toBeInTheDocument();
  });

  it('renders error object with data.errors array', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: { errors: ['Name is required', 'Category is missing'] },
          status: 422,
          statusText: 'Unprocessable Entity',
          url: 'http://localhost:3000/api/items',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json' : undefined),
          },
        },
        source: 'fetch',
      });
    });

    expect(screen.getByText('Name is required, Category is missing')).toBeInTheDocument();
  });

  it('renders stringified JSON for unrecognized JSON objects', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: { customField: 'customValue', code: 123 },
          status: 500,
          statusText: 'Internal Server Error',
          url: 'http://localhost:3000/custom',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json' : undefined),
          },
        },
        source: 'fetch',
      });
    });

    expect(screen.getByText(/"customField": "customValue"/)).toBeInTheDocument();
  });

  it('parses JSON string data if passed as a string with json content-type', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: JSON.stringify({ message: 'Parsed from JSON string' }),
          status: 400,
          statusText: 'Bad Request',
          url: 'http://localhost:3000/api/test',
          headers: {
            get: (name) => (name === 'content-type' ? 'application/json' : undefined),
          },
        },
        source: 'fetch',
      });
    });

    expect(screen.getByText('Parsed from JSON string')).toBeInTheDocument();
  });

  it('extracts error from HTML string response', () => {
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: '<html><body><h2>Error text:</h2><br><h3>Something crashed</h3></body></html>',
          status: 500,
          statusText: 'Internal Server Error',
          url: 'http://localhost:3000/crash',
          headers: {
            get: (name) => (name === 'content-type' ? 'text/html' : undefined),
          },
        },
        source: 'fetch',
      });
    });

    expect(screen.getByText('Something crashed')).toBeInTheDocument();
  });

  it('closes modal on close button click', async() => {
    const user = userEvent.setup();
    render(<MiqErrorModal />);

    act(() => {
      emitRx({
        serverError: {
          data: 'Simple error',
          url: 'http://localhost:3000/simple',
        },
        source: 'server',
      });
    });

    expect(screen.getByText('Simple error')).toBeInTheDocument();
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);
    expect(screen.queryByText('Simple error')).not.toBeInTheDocument();
  });
});
