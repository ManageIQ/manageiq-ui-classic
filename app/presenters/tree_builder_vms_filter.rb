class TreeBuilderVmsFilter < TreeBuilder
  include TreeBuilderFiltersMixin

  def initialize(*args)
    @root_class ||= 'ManageIQ::Providers::InfraManager::Vm'
    super(*args)
  end

  def tree_init_options
    {
      :open_all       => true,
      :allow_reselect => true
    }
  end

  def root_options
    {
      :text    => _("All VMs"),
      :tooltip => _("All of the VMs that I can see")
    }
  end

  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, FILTERS.values)
  end

  def x_get_tree_custom_kids(object, count_only)
    objects = MiqSearch.where(:db => @root_class).filters_by_type(object[:id])
    count_only_or_objects(count_only, objects, 'description')
  end
end
