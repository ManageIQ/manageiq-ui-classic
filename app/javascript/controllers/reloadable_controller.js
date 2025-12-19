import { Controller } from "@hotwired/stimulus"
import { API } from '../http_api'
import { miqFetch, addSearchParams } from '../http_api/fetch'

export default class extends Controller {
  static targets = ["content"]
  static values = {url: String}

  async reload() {
    try {
      window.miqSparkleOn()

      // request the new content and get back a task id
      const data = await miqFetch({
        url: this.urlValue,
        method: 'POST',
        cookieAndCsrf: true
      })

      const task_id = data.task_id
      if (!task_id) {
        throw new Error('No task_id returned from server')
      }

      // poll for the task status
      await API.wait_for_task(task_id)

      // fetch the task content
      const resultsUrl = addSearchParams(this.urlValue, {task_id})
      const taskContent = await miqFetch({
        url: resultsUrl,
        method: 'POST',
        cookieAndCsrf: true,
        skipJsonParsing: true
      })

      if (taskContent && this.hasContentTarget) {
        if (typeof taskContent === 'string') {
          this.contentTarget.innerHTML = taskContent
        } else if (taskContent.text) {
          this.contentTarget.innerHTML = await taskContent.text()
        }
      }

      window.miqSparkleOff()
    } catch (error) {
      console.error('Error in reloadable#reload:', error)
      window.miqSparkleOff()

      if (window.add_flash) {
        window.add_flash(__('Error reloading content'), 'error')
      }
    }
  }
}
