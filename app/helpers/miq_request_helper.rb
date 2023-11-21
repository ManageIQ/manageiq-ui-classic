require 'byebug'
module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper
  include OrderServiceHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def request_task_configuration_script_ids(miq_request)
    miq_request.miq_request_tasks.filter_map { |task| task.options&.dig(:configuration_script_id) }
  end

  def select_box_options(options)
    options.map do |item|
      if /Classification::(\d+)/.match?(item)
        classification_id = item.match(/Classification::(\d+)/)[1]
        classification = Classification.find_by(:id => classification_id)
        if classification
          {:label => classification.description, :value => classification.id.to_s}
        end
      else
        classification = Classification.find_by(:id => item)
        if classification
          {:label => classification.description, :value => classification.id.to_s}
        end
      end
    end
  end

  def dialog_field_values(dialog, wf)

    transformed_data = dialog.transform_keys { |key| key.sub('Array::', '') }
    transformed_data.transform_values do |value|
      if value.to_s.include?("\u001F")
        select_box_options(value.split("\u001F"))
      elsif value.to_s.include?("::")
        model, id = value.split("::")
        record = model.constantize.find_by(:id => id)
        record ? [{:label => record.description, :value => record.id}] : value
      else
        value
      end
    end
  end

  def service_request_data(request_options, wf)
    {
      :dialogId             => request_options[:workflow_settings][:dialog_id],
      :requestDialogOptions => dialog_field_values(request_options[:dialog], wf),
    }
  end
end
