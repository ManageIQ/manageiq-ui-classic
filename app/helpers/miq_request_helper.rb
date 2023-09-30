module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def request_task_configuration_script_ids(miq_request)
    miq_request.miq_request_tasks.map { |task| task.options&.dig(:configuration_script_id) }.compact
  end
end
