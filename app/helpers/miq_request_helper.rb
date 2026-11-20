module MiqRequestHelper
  include RequestInfoHelper
  include RequestDetailsHelper

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def request_task_configuration_script_ids(miq_request)
    miq_request.miq_request_tasks.filter_map { |task| task.options&.dig(:configuration_script_id) }
  end

  CLASSIFICATION_VALUE = /\AClassification::(\d+)\z/

  def select_box_options(options)
    options.filter_map do |item|
      classification = Classification.find_by(:id => item.to_s[/Classification::(\d+)/, 1] || item)
      {:label => classification.description, :value => classification.id.to_s} if classification
    end
  end

  # Tag values come as "Classification::<id>", multiple tags are separated by "\u001F". Any other value is passed through.
  def dialog_field_values(dialog)
    (dialog || {}).to_h.transform_keys { |key| key.to_s.sub('Array::', '') }.transform_values do |value|
      next value unless value.kind_of?(String)

      parts = value.split("\u001F")
      if parts.present? && parts.all? { |part| CLASSIFICATION_VALUE.match?(part) }
        select_box_options(parts)
      elsif parts.length > 1
        parts
      else
        value
      end
    end
  end

  def service_request_data(request_options)
    {
      :dialogId             => request_options.dig(:workflow_settings, :dialog_id),
      :requestDialogOptions => dialog_field_values(request_options[:dialog]),
    }
  end
end
