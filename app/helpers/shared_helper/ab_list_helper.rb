module SharedHelper::AbListHelper
  private

  def shared_button_list_summary(record)
    style = record.set_data.key?(:button_color) ? record.set_data[:button_color].to_s : nil
    data = {
      :title => _('Basic Information'),
      :mode  => "ab_list_basic_information",
      :rows  => [
        row_data(_('Name'), record.name.split('|').first),
        row_data(_('Display on button'), {:input => "checkbox", :name => "display", :checked => true, :disabled => true, :label => ''}),
        row_data(_('Description'), record.description),
        row_data(_('Image'), record.set_data[:button_icon], style, :icon => true)
      ]
    }
    miq_structured_list(data)
  end

  def row_data(label, value, style = "", icon: false)
    data = value.kind_of?(Array) ? [value[0], value[1]].join(', ') : value
    {:cells => {:label => label, (icon ? :icon : :value) => data, :color => style}}
  end
end
