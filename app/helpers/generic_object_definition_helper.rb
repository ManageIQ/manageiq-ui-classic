module GenericObjectDefinitionHelper
  include TextualSummary

  def generic_object_definition_button_summary(button)
    style = button.options.key?(:button_color) ? button.options[:button_color].to_s : nil
    data = {:title => _('Basic Information')}
    data[:rows] = [
      row_data(_('Name'), button.name),
      row_data(_('Display in Catalog'), {:input => "checkbox", :name => "display", :checked => button.options[:display], :disabled => true, :label => ''}),
      row_data(_('Descrption'), button.description),
      row_data(_('Image'), button.options[:button_icon], style, :icon => true),
    ]
    miq_structured_list(data)
  end

  def generic_object_definition_button_group_summary(button_group)
    @custom_buttons_table_data = custom_buttons_table_data(button_group.set_data[:button_order].map { |id| CustomButton.find_by(:id => id) })
    style = button_group.set_data[:button_color] ? button_group.set_data[:button_color].to_s : nil
    icon = button_group.set_data[:button_icon].to_s == "" ? "pficon-folder-close" : button_group.set_data[:button_icon].to_s
    data = {:title => _('Basic Information')}
    data[:rows] = [
      row_data(_('Name'), button_group.name),
      row_data(_('Display in Catalog'), {:input => "checkbox", :name => "display", :checked => button_group.set_data[:display], :disabled => true, :label => ''}),
      row_data(_('Descrption'), button_group.description),
      row_data(_('Image'), icon, style, :icon => true),
    ]
    miq_structured_list(data)
  end

  private

  def row_data(label, value, style = "", icon: false)
    if icon
      data = {:cells => {:label => label, :icon => value, :color => style}}
    else
      data = {:cells => {:label => label, :value => value}}
      data[:style] = style if style.present?
    end
    data
  end

  def custom_buttons_table_data(button_group)
    rows = []
    button_group.each do |button|
      rows.push(
        {
          :name         => button.name,
          :id           => button.id,
          :description  => button.description,
          :button_icon  => button.options[:button_icon],
          :button_color => button.options[:button_color]
        }
      )
    end
    rows
  end
end
