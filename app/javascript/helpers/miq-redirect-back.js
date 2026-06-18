/* global miqFlashLater */
import { setLocationHref } from "./window-location";

const miqRedirectBack = (message, flashType, redirectUrl) => {
  miqFlashLater({ message, level: flashType });
  setLocationHref(redirectUrl);
};

export default miqRedirectBack;
