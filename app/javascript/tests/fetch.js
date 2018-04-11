/**
 * Class which helps you to mock fetch requests.
 * To mock request which works with some data set and then filter trough them use this:
 *     const fetchResponse = new GenericResponse([...], functionCallback);
 *     fetchResponse.build(url, options);
 * This way you will have data set and option to filter trough these data.
 * You have to assign return value to your fetch object (window.fetch, window.$.get, ...).
 */
export class GenericResponse {
  filterFunction;
  dataSet;

  constructor(dataSet, filterCallback) {
    this.filterFunction = filterCallback || this.defaultFilter;
    this.dataSet = dataSet;
  }

  generateResponse(url, options) {
    options.body = JSON.parse(options.body);

    return new Promise(
      resolveData => resolveData({
        url,
        options,
        results: this.defaultFilter(),
      })
    );
  }

  build(url, options) {
    return new Promise(resolve => {
      process.nextTick(() => resolve(
        {
          json: () => this.generateResponse(url, options),
        }
      ));
    });
  }

  defaultFilter() {
    return [{ success: true, message: 'some message', dataSet: this.dataSet }];
  }
}

export default function fetch(url, options) {
  const fetchResponse = new GenericResponse();
  return fetchResponse.build(url, options);
}

window.Headers = window.Headers || require("fetch-headers");

window.fetch = fetch;
window.localStorage = {
  miq_token: 'mocked-token',
};
