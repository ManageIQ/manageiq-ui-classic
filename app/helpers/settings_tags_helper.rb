module SettingsTagsHelper

  SETTINGS_TAGS_TABS_IDS = %w[
  settings_my_company_categories
  settings_my_company_tags
  settings_import_tags
  settings_import_variables
  settings_map_tags
]

  def settings_tags_configuration
    [:my_company_categories, :my_company_tags, :import_tags, :import_variables, :map_tags]
  end

  def settings_tags_content(key_name, active_tab: nil, &)
    if settings_tags_types[key_name]
      css_class = 'tab-pane tab_content'
      css_class += ' active' if active_tab == "settings_#{key_name}"
      tag.div(:id => key_name, :class => css_class, &)
    end
  end

  def settings_tags_tab_index_by_name(name)
    SETTINGS_TAGS_TABS_IDS.index(name) || -1
  end

  private

  def settings_tags_types
    {
      :my_company_categories => _('My Company Categories'),
      :my_company_tags       => _('My Company Tags'),
      :import_tags           => _('Import Tags'),
      :import_variables      => _('Import Variables'),
      :map_tags              => _('Map Tags'),
    }
  end
end
