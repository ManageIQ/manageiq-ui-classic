class TreeBuilderOps < TreeBuilder
  # common methods for OPS subclasses
  has_kids_for Zone, [:x_get_tree_zone_kids]

  private

  def active_node_set(_tree_nodes)
    @tree_state.x_node_set("svr-#{MiqServer.my_server(true).id}", @name) unless @tree_state.x_node(@name)
  end

  def x_get_tree_zone_kids(object, count_only)
    count_only_or_objects(count_only, object.miq_servers, "name")
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    region = MiqRegion.my_region
    objects = region.zones.visible.sort_by { |z| z.name.downcase }
    count_only_or_objects(count_only, objects)
  end
end
