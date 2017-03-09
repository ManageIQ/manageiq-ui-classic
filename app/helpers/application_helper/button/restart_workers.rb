class ApplicationHelper::Button::RestartWorkers < ApplicationHelper::Button::RefreshWorkers
  def disabled?
    @error_message = _('Select a worker to restart') if @sb[:selected_worker_id].nil?
    @error_message.present?
  end
end
