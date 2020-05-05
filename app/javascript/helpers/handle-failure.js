import miqFlash from './miq-flash';

const handleFailure = (e) => {
  miqSparkleOff();

  let message = __('Unknown error');
  if (e.data && e.data.error && e.data.error.message) {
    message = e.data.error.message;
  } else if (e.error && e.error.message) {
    message = e.error.message;
  } else if (e.message) {
    message = e.message;
  }

  console.error(message);
  miqFlash('error', message);

  return Promise.reject(e);
};

export default handleFailure;
