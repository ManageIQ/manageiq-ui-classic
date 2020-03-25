class TreeBuilderClusters < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]
  has_kids_for EmsCluster, [:x_get_tree_cluster_kids]

  def initialize(name, sandbox, build = true)
    @clusters = EmsCluster.get_perf_collection_object_list
    @nc_hosts = ExtManagementSystem.in_my_region.map(&:non_clustered_hosts).flatten
    super(name, sandbox, build)
  end

  private

  def override(node, object)
    case object
    when EmsCluster
      node.checkable = @clusters[object.id][:ho_ids].any?
    when Host
      parent = @clusters[object.ems_cluster_id]
      node.checked = parent ? parent[:ho_enabled].include?(object) : object.perf_capture_enabled?
    end
    node.selectable = false
  end

  def tree_init_options
    {
      :full_ids     => false,
      :checkboxes   => true,
      :three_checks => true,
      :post_check   => true,
      :oncheck      => "miqOnCheckCUFilters",
      :check_url    => "/ops/cu_collection_field_changed/",
    }
  end

  def x_get_tree_roots
    nodes = @clusters.map { |_, cl| cl[:cl_rec] }.sort_by(&:name)

    if @nc_hosts.present?
      nodes.push(
        :id   => "NonCluster",
        :text => t = _("Non-clustered Hosts"),
        :icon => Host.decorate.fonticon,
        :tip  => t
      )
    end

    count_only_or_objects(false, nodes)
  end

  def x_get_tree_cluster_kids(parent, count_only)
    nodes = (@clusters[parent.id][:ho_enabled] + @clusters[parent.id][:ho_disabled]).sort_by(&:name)
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_hash_kids(_parent, count_only)
    count_only_or_objects(count_only, @nc_hosts)
  end
end
