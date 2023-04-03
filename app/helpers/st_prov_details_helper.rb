module StProvDetailsHelper
  private

  def row_data_with_title(label, title, value)
    {:cells => {:label => label, :value => value, :title => title}}
  end

  def tab_label(tab)
    {:name => tab.id, :text => _(tab.label)}
  end

  def st_prov_show_tab_configuration(work_flow)
    tab_labels = []
    work_flow.dialog.dialog_tabs.map do |tab|
      tab_label(tab)
    end
    tab_labels
  end

  def st_prov_show_tab_content(key_name, tab_index, &block)
    class_name = tab_index == 0 ? 'tab_content active' : 'tab_content'
    tag.div(:id => key_name, :class => class_name, &block)
  end

  def st_prov_show_tab_info(tab, work_flow)
    summary = []
    tab.dialog_groups.each do |group|
      rows = []
      unless group.dialog_fields.empty?
        group.dialog_fields.each do |field|
          rows.push(request_dialog_details(work_flow, field))
        end
      end
      summary.push(miq_structured_list(
                     :title => _(group.label),
                     :mode  => "request_st_prov_tab_details",
                     :rows  => rows
                   ))
    end
    safe_join(summary)
  end

  def request_dialog_details(work_flow, field)
    label = _(field.label)
    title = field.description
    value = ''
    case field.type
    when 'DialogFieldTextBox', 'DialogFieldTextAreaBox'
      value = field.protected? ? '********' : field.value
    when 'DialogFieldCheckBox'
      value = check_box_tag(field.name, "1", field.checked?, {:disabled => true})
    when 'DialogFieldDateControl'
      value = field.value
    when 'DialogFieldDateTimeControl'
      date_val, time_val = field.value.split
      hour_val, minute_val = time_val.split(":")
      value = "#{date_val} #{hour_val.rjust(2, '0')}:#{minute_val.rjust(2, '0')} #{session[:user_tz]}"
    when 'DialogFieldRadioButton'
      value = field.values.detect { |k, _v| k == work_flow.value(field.name) }.try(:last) || work_flow.value(field.name)
    when 'DialogFieldDropDownList'
      value = field.value.to_s.gsub("\x1F", ", ") || _("<None>")
    when 'DialogFieldTagControl'
      field_value = work_flow.value(field.name) || '' # it returns in format Clasification::id
      classifications = field_value.split(',').map { |c| Classification.find_by(:id => c.split('::').second).description }
      value = classifications.empty? ? '' : classifications.join(', ')
    end
    row_data_with_title(label, title, value)
  end
end
