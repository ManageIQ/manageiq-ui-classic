module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def request_task_configuration_script_ids(miq_request)
    miq_request.miq_request_tasks.map { |task| task.options&.dig(:configuration_script_id) }.compact
  end

  def select_box_options(options)
    options.map { |item| { label: item, value: item } }
  end

  def dialog_field_values(dialog)
    transformed_data = dialog.transform_keys { |key| key.sub('Array::', '') }
    converted_data = transformed_data.transform_values do |value|
      if value.to_s.include?("\u001F")
        select_box_options(value.split("\u001F"))
      elsif value.to_s.include?("::")
        model, id = value.split("::")
        record = model.constantize.find_by(id: id)
        record ? [{label: record.description, value: record.id}] : value
      else
        value
      end
    end
    return converted_data
  end
end
