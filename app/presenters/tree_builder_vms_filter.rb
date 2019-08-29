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

  def x_get_tree_roots
    count_only_or_objects(false, FILTERS.values)
  end

  def x_get_tree_custom_kids(object, count_only)
    count_only_or_filter_kids(@root_class, object, count_only)
  end
end
