module RequestDialogOptionsHelper
  def request_dialog_options(workflow)
    data = workflow.dialog.dialog_tabs.map do |tab, _tab_index|
      {
        :label   => _(tab.label),
        :content => request_dialog_options_groups(tab.dialog_groups, workflow)
      }
    end
    react('RequestDialogOptions', {:data => data})
  end

  private

  def request_dialog_options_groups(dialog_groups, workflow)
    dialog_groups.map do |group|
      {
        :title => _(group.label),
        :rows  => request_dialog_options_fields(group.dialog_fields, workflow),
        :mode  => "miq_summary request_dialog_options"
      }
    end
  end

  def request_dialog_options_fields(dialog_fields, workflow)
    dialog_fields.map do |field|
      row_data(_(field.label), request_dialog_options_field_content(field, workflow))
    end
  end

  def request_dialog_options_field_content(field, workflow)
    case field.type
    when 'DialogFieldTextBox', 'DialogFieldTextAreaBox'
      if field.protected?
        "********"
      else
        field.value
      end

    when 'DialogFieldCheckBox'
      {:input => "checkbox", :name => field.name, :checked => field.checked?, :disabled => true, :label => ''}

    when 'DialogFieldDateControl'
      field.value

    when 'DialogFieldDateTimeControl'
      date_val, time_val = field.value.split
      hour_val, minute_val = time_val.split(":")
      "#{date_val} at #{hour_val.rjust(2, '0')}:#{minute_val.rjust(2, '0')} #{session[:user_tz]}"

    when "DialogFieldRadioButton"
      field.values.detect { |k, _v| k == workflow.value(field.name) }.try(:last) || workflow.value(field.name)

    when "DialogFieldDropDownList"
      field.value.blank? ? _("<None>") : field.value.to_s.gsub("\x1F", ", ")

    when 'DialogFieldTagControl'
      value = workflow.value(field.name) || '' # it returns in format Clasification::id
      classifications = value.split(',').map { |c| Classification.find_by(:id => c.split('::').second).description }
      if classifications.empty?
        ''
      else
        classifications.join(', ')
      end
    end
  end
end
