module SharedHelper::AbShowHelper
  private

  def shared_button_summary(record, sb_items, resolve, custom_button)
    summary = [
      shared_button_basic_info(record, sb_items, custom_button),
      object_details(record, resolve),
      object_attribute(record, resolve),
      visibility_expression(record),
      attribute_value_pair(resolve),
      visibility(custom_button, sb_items)
    ]
    safe_join(summary)
  end

  def shared_button_basic_info(record, sb_items, custom_button)
    style = record&.options&.[](:button_color)&.to_s
    display_for = record&.options&.[](:display_for)
    display_how_map = {'single' => _('Single entity'), 'list' => _('List'), 'both' => _('Single and list')}
    display_for_value = display_how_map[display_for] if display_for.present?

    submit_how = record&.options&.[](:submit_how)

    submit_how_map = {'all' => _('Submit all'), 'one' => _('One by one')}
    submit_for_value = submit_how_map[submit_how] if submit_how.present?
    rows = [
      row_data(_('Button Type'), record&.options&.[](:button_type)&.capitalize),
      row_data(_('Name'), record&.name),
      row_data(_('Display on button'), {:input => "checkbox", :name => "display", :checked => true, :disabled => true, :label => ''}),
      row_data(_('Description'), record&.description),
      row_data(_('Image'), record&.options&.[](:button_icon), style, :icon => true),
      row_data(_('Dialog'), sb_items[:dialog_label]),
      row_data(_('Open URL'), record&.options&.[](:open_url)),
      row_data(_('Display for'), display_for_value&.capitalize),
      row_data(_('Submit'), submit_for_value&.capitalize),
    ]
    service_template_name = custom_button.uri_attributes[:service_template_name]
    uri_attributes_hosts = custom_button.uri_attributes[:hosts]
    rows.insert(2, row_data(_('Ansible Playbook'), service_template_name)) if service_template_name.present?
    rows.insert(3, row_data(_('Target'), uri_attributes_hosts)) if uri_attributes_hosts.present?

    miq_structured_list({
                          :title => _('Basic Information'),
                          :mode  => _('run_button_summary'),
                          :rows  => rows
                        })
  end

  def object_details(_custom_button, resolve)
    data = {
      :title => _('Object Details'),
      :mode  => _('object_details'),
      :rows  => [
        row_data(_('System/Process/'), resolve[:new][:instance_name]),
        row_data(_('Message'), resolve[:new][:object_message]),
        row_data(_('Request'), resolve[:new][:object_request])
      ]
    }
    miq_structured_list(data)
  end

  def object_attribute(record, resolve)
    record&.enablement_expression
    data = {
      :title => _('Object Attribute'),
      :mode  => _('object_attribute'),
      :rows  => [
        row_data(_('Type'), ui_lookup(:model =>resolve[:new][:target_class])),
      ]
    }

    data[:rows] << row_data(_('Selection'), resolve[:new][:target_id]) if resolve[:new][:target_class].present?

    enablement_text = if record&.enablement_expression.kind_of?(MiqExpression)
                        custom_button_info_text(record, :enablement_expression, record&.enablement_expression&.to_human)
                      else
                        custom_button_info_text(record, :enablement_expression, _('No Enablement Expression defined, this button will be always enabled'))
                      end

    data[:rows] << row_data(_('Enablement expression'), enablement_text)
    data[:rows] << row_data(_('Disabled Button Text'), record&.disabled_text)
    miq_structured_list(data)
  end

  def visibility_expression(record)
    data = {
      :title => _('Visibility Expression'),
      :mode  => _('visibility_expression'),
      :rows  => []
    }
    visibility_expression_text = if record && !record.visibility_expression.nil? && record.visibility_expression.kind_of?(MiqExpression)
                                   record.visibility_expression.to_human
                                 else
                                   custom_button_info_text(record, :visibility_expression, _('No Visibility Expression defined, this button will be always visible'))
                                 end
    data[:rows] << row_data(_('Visibility Expression'), visibility_expression_text)
    miq_structured_list(data)
  end

  def custom_button_info_text(record, attribute, default_message)
    value = record&.send(attribute)
    value.nil? ? _(default_message) : value
  end

  def attribute_value_pair(resolve)
    data = {
      :title => _('Attribute/Value Pairs'),
      :mode  => _('attribute_value_pair'),
      :rows  => []
    }
    if resolve[:new][:attrs].empty?
      data[:rows] << row_data(_('Attribute/Value Pairs'), _('No Attribute/Value Pairs found.'))
    else
      resolve[:new][:attrs].each_with_index do |attr, i|
        data[:rows] << row_data(_(i + 1).to_s, [attr[0], attr[1]])
      end
    end
    miq_structured_list(data)
  end

  def visibility(custom_button, sb_items)
    show_to = custom_button.visibility.nil? || (custom_button.visibility && custom_button.visibility[:roles] && custom_button.visibility[:roles][0] == "_ALL_") ? _("To All") : _("By Role")
    data = {
      :title => _('Visibility'),
      :mode  => _('visibility'),
      :rows  => [
        row_data(_('Show'), custom_button&.visibility&.empty? || (custom_button&.visibility&.fetch(:roles, [])&.first == "_ALL_") ? _("To All") : _("By Role"))
      ]
    }

    data[:rows] << row_data(_('User Roles'), sb_items[:user_roles].join(", ")) if show_to == "By Role" && sb_items[:user_roles].present?

    miq_structured_list(data)
  end

  def row_data(label, value, style = "", icon: false)
    if value.kind_of?(Array)
      {:cells => {:label => label, (icon ? :icon : :value) => [value[0], value[1]].join(', '), :color => style}}
    else
      {:cells => {:label => label, (icon ? :icon : :value) => value, :color => style}}
    end
  end
end
