class TreeBuilderCatalogItems < TreeBuilderCatalogsClass
  has_kids_for ServiceTemplateCatalog, [:x_get_tree_stc_kids]
  has_kids_for ServiceTemplate, %i[x_get_tree_st_kids]

  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Catalog Items"),
      :tooltip => t
    }
  end

  def x_get_tree_stc_kids(object, count_only)
    templates = if object.id.nil?
                  Rbac.filtered(ServiceTemplate, :named_scope => %i[public_service_templates without_service_template_catalog_id])
                else
                  Rbac.filtered(object.service_templates, :named_scope => :public_service_templates)
                end
    count_only_or_objects_filtered(count_only, templates, 'name')
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(object, count_only, _options)
    # build node showing any button groups or buttons under selected CatalogItem
    @resolve ||= {}
    st = ServiceTemplate.find_by(:id => object[:id])
    items = st.custom_button_sets + st.custom_buttons
    objects = []
    if st.options && st.options[:button_order]
      st.options[:button_order].each do |item_id|
        items.each do |g|
          rec_id = "#{g.kind_of?(CustomButton) ? 'cb' : 'cbg'}-#{g.id}"
          objects.push(g) if item_id == rec_id
        end
      end
    end
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_st_kids(object, count_only)
    count = object.custom_button_sets.count + object.custom_buttons.count
    objects = count > 0 ? [{:id => object.id.to_s, :text => 'Actions', :icon => 'pficon pficon-folder-close', :tip => 'Actions'}] : []
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_roots(count_only)
    return super + 1 if count_only

    # FIXME: adding gettext here would break the tree_select for languages other than English
    super.unshift(ServiceTemplateCatalog.new(:name => 'Unassigned', :description => 'Unassigned Catalogs'))
  end
end
