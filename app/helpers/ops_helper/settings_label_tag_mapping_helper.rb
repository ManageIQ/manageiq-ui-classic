module OpsHelper::SettingsLabelTagMappingHelper
  private

  def settings_label_tab_mapping_list(warning, mappings)
    {
      :headers => settings_label_tab_mapping_headers,
      :rows    => settings_label_tab_mapping_rows(mappings),
      :warning => warning,
    }
  end

  def settings_label_tab_mapping_headers
    [
      {:header => _("Resource Entity"), :key => 'resource_entity'},
      {:header => _("Resource Label"),  :key => 'resource_label'},
      {:header => _("Tag Category"),    :key => 'tag_category'},
      {:header => _("Actions"),         :key => 'actions'},
    ]
  end

  def delete_mapping_button_data(mapping)
    {
      :alt             => _('Delete this mapping'),
      :is_button       => true,
      :onclick         => delete_mapping_link(mapping),
      :text            => _("Delete"),
      :kind            => 'danger',
      :title           => _("Are you sure you want to delete mapping '%{label_name}'?") % {:label_name => mapping[:label_name]},
      :buttonClassName => 'delete_category'
    }
  end

  def delete_mapping_link(mapping)
    {
      :remote  => true,
      :url     => "/ops/label_tag_mapping_delete/#{mapping[:id]}",
      :confirm => _("Are you sure you want to delete mapping '%{label_name}'?") % {:label_name => mapping[:label_name]},
    }
  end

  def settings_label_tab_mapping_rows(mappings)
    mappings.map do |mapping|
      {
        :id        => mapping[:id].to_s,
        :clickable => true,
        :cells     => [
          {:text => mapping[:entity]},
          {:text => mapping[:label_name]},
          {:text => mapping[:category]},
          delete_mapping_button_data(mapping),
        ]
      }
    end
  end
end
