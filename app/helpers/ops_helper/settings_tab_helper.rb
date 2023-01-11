module OpsHelper::SettingsTabHelper
  def settings_tags_tab_labels
    settings_tab_types.keys.map { |item| settings_tag_tab_label(item) }
  end

  def settings_tab_types
    {
      :settings_co_categories     => "#{current_tenant.name} #{_('Categories')}",
      :settings_co_tags           => "#{current_tenant.name} #{_('Tags')}",
      :settings_import_tags       => _('Import Tags'),
      :settings_import            => _('Import Variables'),
      :settings_label_tag_mapping => _('Map Tags')
    }
  end

  def settings_tags_tab_content(key_name, &block)
    if settings_tab_types[key_name]
      params[:tab_id] = params[:tab_id] || 'settings_co_categories'
      class_name = key_name.to_s == params[:tab_id] ? 'tab_content active' : 'tab_content'
      content_tag(:div, :id => key_name, :class => class_name, &block)
    end
  end

  def settings_tag_tab_label(item)
    {:name => item, :text => settings_tab_types[item]}
  end
end
