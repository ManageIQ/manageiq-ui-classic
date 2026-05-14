/* eslint-disable no-await-in-loop */
import { Controller } from '@hotwired/stimulus';
import { miqFetch } from '../http_api/fetch';

export default class extends Controller {
  static targets = ['content']

  static values = { url: String }

  async reload() {
    try {
      window.miqSparkleOn();

      // request the new content and get back a task reference
      const data = await miqFetch({
        url: this.urlValue,
        method: 'POST',
        cookieAndCsrf: true,
      });

      const pollUrl = data.url;
      if (!pollUrl) {
        throw new Error(__('No task returned from server'));
      }

      const taskContent = await this.waitForTask(pollUrl);

      if (taskContent && this.hasContentTarget) {
        // Safe to use innerHTML: Content is server-rendered safe HTML
        this.contentTarget.innerHTML = taskContent;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in reloadable#reload:', error);
      if (window.add_flash) {
        window.add_flash(sprintf(__('Error loading content: %s'), error.message), 'error');
      }
    } finally {
      window.miqSparkleOff();
    }
  }

  async waitForTask(pollUrl) {
    const maxAttempts = 100;
    let asyncInterval = 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      this.application.logDebugActivity('reloadable', 'waitForTask', { attempt, pollUrl });
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await new Promise((resolve) => setTimeout(resolve, asyncInterval));

      const response = await miqFetch({
        url: pollUrl,
        method: 'POST',
        cookieAndCsrf: true,
        skipJsonParsing: true,
        skipErrors: true,
      });

      if (response.status === 200) {
        const content = await response.text();

        // HACK: Handle a 200 response that contains an error. We should fix the server to return
        // proper error codes, but this code path is used all over the place, so I don't know what
        // that will break.
        if (content.includes('throw "error"')) {
          throw new Error(__('Task failed with server error'));
        }

        return content;
      }
      if (response.status === 202) {
        // 202 Accepted means the task is still running, so try again
        const data = await response.json();

        // eslint-disable-next-line no-param-reassign
        pollUrl = data.url;
        if (!pollUrl) {
          throw new Error(__('Invalid task response: missing URL'));
        }

        asyncInterval = data.async_interval || asyncInterval;
      } else {
        throw new Error(sprintf(__('Task failed with status: %s'), response.status));
      }
    }

    throw new Error(sprintf(__('Task did not complete after %d attempts'), maxAttempts));
  }
}
