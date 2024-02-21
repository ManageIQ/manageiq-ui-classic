module OpsHelper::SettingsTabHelper
  private

  def settings_company_tags_data(category)
    {
      :pageTitle  => "#{current_tenant.name} #{_('Tags')}",
      :categoryId => category.id
    }
  end

  def settings_company_tags_options(categories)
    categories.map do |item|
      {:label => item[0], :value => item[1], :key => "category_key_#{item[1]}"}
    end
  end

  def company_tag_headers
    [
      {:header => _("Name"), :key => 'name'},
      {:header => _("Description"), :key => 'descripton'},
      {:header => _("Actions"), :key => 'actions'},
    ]
  end

  def company_tag_rows(category)
    category.entries.sort_by(&:name).map do |entry|
      {
        :id        => entry[:id].to_s,
        :clickable => true,
        :cells     => [
          {:text => entry.name},
          {:text => entry.description},
          delete_tag_buton_data(entry)
        ]
      }
    end
  end

  def delete_tag_link(entry)
    {
      :remote  => true,
      :url     => "/ops/ce_delete/#{entry.id}",
      :confirm => _("Deleting the '%{entry_name}' entry will also unassign it from all items, are you sure?") % {:entry_name => entry.name}
    }
  end

  def delete_tag_buton_data(entry)
    {
      :alt             => 'Delete this entry',
      :is_button       => true,
      :onclick         => delete_tag_link(entry),
      :text            => _("Delete"),
      :kind            => 'danger',
      :title           => _("Click to delete this entry"),
      :buttonClassName => 'delete_category'
    }
  end

  def settings_company_tags_list(category)
    {
      :headers => company_tag_headers,
      :rows    => company_tag_rows(category),
    }
  end
end
