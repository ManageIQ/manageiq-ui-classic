class TreeBuilderInfraNetworking < TreeBuilder
  has_kids_for ManageIQ::Providers::Vmware::InfraManager, [:x_get_tree_provider_kids]
  has_kids_for EmsCluster, [:x_get_tree_cluster_kids]
  has_kids_for Switch, [:x_get_tree_switch_kids]
  has_kids_for EmsFolder, [:x_get_tree_folder_kids]

  def override(node, object)
    node[:selectable] = false if object.kind_of?(Lan)
  end

  private

  def tree_init_options
    {:open_all => true}
  end

  def root_options
    {
      :text    => t = _("All Distributed Switches"),
      :tooltip => t,
    }
  end

  def x_get_tree_roots(count_only, _options)
    objects = Rbac.filtered(ManageIQ::Providers::Vmware::InfraManager.order("lower(name)"))
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_provider_kids(object, count_only)
    count_only_or_objects(count_only,
                          Rbac.filtered(EmsCluster.where(:ems_id => object[:id])),
                          "name")
  end

  def x_get_tree_cluster_kids(object, count_only)
    hosts = object.hosts
    switch_ids = hosts.collect { |host| host.switches.pluck(:id) }

    objects = Rbac.filtered(Switch, :named_scope => [:shareable, [:with_id, switch_ids.flatten.uniq]])
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_host_kids(object, count_only)
    count_only_or_objects(count_only,
                          Rbac.filtered(object.switches.where(:shared => 'true')).sort,
                          "name")
  end

  def x_get_tree_switch_kids(object, count_only)
    count_only_or_objects(count_only,
                          object.lans.sort,
                          "name")
  end
end
