module SettingsTagsTabsHelper
  private

  def company_category_headers
    [
      {:header => _("Name"), :key => 'name'},
      {:header => _("Description"), :key => 'descripton'},
      {:header => _("Show in Console"), :key => 'show'},
      {:header => _("Single Value"), :key => 'single_value'},
      {:header => _("Capture C & U Data"), :key => 'perf_by_tag'},
      {:header => _("Default"), :key => 'default'},
      {:header => _("Actions"), :key => 'actions'},
    ]
  end

  def company_category_rows(categories)
    categories.map do |category|
      {
        :id        => category[:id].to_s,
        :clickable => true,
        :cells => [
          {:text => category[:name]},
          {:text => category[:descripton]},
          {:text => category[:show]},
          {:text => category[:single_value] ? 'true' : 'false'},
          {:text => category[:perf_by_tag] ? 'true' : 'false'},
          {:text => category[:default] ? 'true' : 'false'},
          delete_category_buton_data(category)
        ]
      }
    end
  end

  def settings_company_categories_list(categories)
    {
      :headers   => company_category_headers,
      :rows      => company_category_rows(categories),
      :pageTitle => "#{current_tenant.name} #{_("Categories")}"
    }
  end

  def default_category(category)
    category[:default] == "t" || category[:default].to_s == "1"
  end

  def delete_category_buton_data(category)
    {
      :alt             => _('Delete this category'),
      :disabled        => default_category(category),
      :is_button       => true,
      :onclick         => delete_category_link(category),
      :text            => _("Delete"),
      :kind            => 'danger',
      :title           => !default_category(category) ? _("Click to delete this category") : _("Category '%{category_name}' cannot be deleted") % {:category_name => category[:name]},
      :buttonClassName => 'delete_category'
    }
  end

  # This method can be removed when we change the logic in miq-table-cell.jsx's cellButton function
  def delete_category_link(category)
    remote_function(:url     => {
                      :action => 'category_delete',
                      :id     => category[:id]
                    },
                    :confirm => _("Are you sure you want to delete category '%{category_name}'?") % {:category_name => category[:name]})
  end
end
