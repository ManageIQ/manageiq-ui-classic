export default (graphQLParams) => {
  return fetch('/graphql', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': localStorage.miq_token
    },
    body: JSON.stringify(graphQLParams),
  }).then(function (response) {
    return response.text();
  }).then(function (responseBody) {
    try {
      return JSON.parse(responseBody);
    } catch (error) {
      return responseBody;
    }
  });
}
