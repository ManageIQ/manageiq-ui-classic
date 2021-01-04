import { http, API } from '../http_api';

describe('http', () => {
  it('allows relative controller urls', () => {
    expect(() => http.get('/vm/show_list')).not.toThrow();
  });

  it('throws on relative API urls', () => {
    expect(() => http.get('/api')).toThrow();
    expect(() => http.get('/api/providers')).toThrow();
  });
});

describe('API', () => {
  it('throws on relative controller urls', () => {
    expect(() => API.get('/vm/show_list')).toThrow();
  });

  it('throws on external URLs', () => {
    expect(() => API.get('https://google.com')).toThrow();
  });

  it('allows relative API urls', () => {
    expect(() => API.get('/api')).not.toThrow();
    expect(() => API.get('/api/providers')).not.toThrow();
  });

  it('allows external API urls', () => {
    expect(() => API.get('http://localhost:3000/api')).not.toThrow();
    expect(() => API.get('https://example.com/api/providers')).not.toThrow();
  });
});
