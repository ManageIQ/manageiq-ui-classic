class TreeBuilderVmsFilter < TreeBuilder
  def tree_init_options(_tree_name)
    {
      :open_all => true,
      :leaf     => 'ManageIQ::Providers::InfraManager::Vm'
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:tree_id => "vms_filter_treebox", :tree_name => "vms_filter_tree", :allow_reselect => true)
  end

  def root_options
    {
      :text    => _("All VMs"),
      :tooltip => _("All of the VMs that I can see")
    }
  end

  def x_get_tree_roots(count_only, _options)
    objects =
      [
        {:id => "global", :text => _("Global Filters"), :icon => "pficon pficon-folder-close", :tip => _("Global Shared Filters"), :selectable => false},
        {:id => "my",     :text => _("My Filters"),     :icon => "pficon pficon-folder-close", :tip => _("My Personal Filters"),   :selectable => false}
      ]
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, options)
    objects = MiqSearch.where(:db => options[:leaf]).filters_by_type(object[:id])
    count_only_or_objects(count_only, objects, 'description')
  end
end
