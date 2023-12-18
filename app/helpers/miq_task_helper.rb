module MiqTaskHelper
  include TaskDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def request_task_configuration_script_ids(miq_task)
    workflow_instance_id = miq_task.context_data&.dig(:workflow_instance_id)
    return if workflow_instance_id.nil?

    [workflow_instance_id]
  end

  TASK_TIME_PERIODS = {
    0 => N_("Today"),
    1 => N_("1 Day Ago"),
    2 => N_("2 Days Ago"),
    3 => N_("3 Days Ago"),
    4 => N_("4 Days Ago"),
    5 => N_("5 Days Ago"),
    6 => N_("6 Days Ago")
  }.freeze
end
