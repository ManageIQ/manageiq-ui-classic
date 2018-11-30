import { API, mock } from '../../http_api';

describe('fetch mock', () => {
  it('mock.ok resolves right', () => {
    mock.ok('/api/vms/1', {
      id: "1",
      href: "whatever",
    });

    expect(API.get('/api/vms/1')).resolves.toHaveProperty('href', 'whatever');
  });

  it('mock.err rejects right', () => {
    mock.err('/api/vms/999', {
      error: {
        kind: "unknown",
        message: "foobar",
      }
    });

    expect(API.get('/api/vms/999')).rejects.toHaveProperty('data.error.kind', 'unknown');
  });
});
