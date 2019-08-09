class TreeBuilderClusters < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, sandbox, build = true, **params)
    @root = params[:root]
    @data = EmsCluster.get_perf_collection_object_list
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids     => false,
      :checkboxes   => true,
      :three_checks => true,
      :oncheck      => "miqOnCheckCUFilters",
      :check_url    => "/ops/cu_collection_field_changed/"
    }
  end

  def non_cluster_selected
    checked = @root[:non_cl_hosts].count { |item| item[:capture] }
    if @root[:non_cl_hosts].size == checked
      true
    elsif checked == 0
      false
    else
      'undefined'
    end
  end

  def x_get_tree_roots(count_only)
    nodes = @root[:clusters].map do |node|
      { :id         => node[:id].to_s,
        :text       => node[:name],
        :icon       => 'pficon pficon-cluster',
        :tip        => node[:name],
        :select     => node[:capture],
        :nodes      => @data[node[:id]][:ho_enabled] + @data[node[:id]][:ho_disabled],
        :selectable => false}
    end
    if @root[:non_cl_hosts].present?
      node = {:id         => "NonCluster",
              :text       => _("Non-clustered Hosts"),
              :icon       => 'pficon pficon-container-node',
              :tip        => _("Non-clustered Hosts"),
              :select     => non_cluster_selected,
              :nodes      => @root[:non_cl_hosts],
              :selectable => false}
      nodes.push(node)
    end
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_hash_kids(parent, count_only)
    hosts = parent[:nodes]
    nodes = hosts.map do |node|
      if @data[parent[:id].to_i]
        value = @data[parent[:id].to_i][:ho_disabled].include?(node)
      end
      {:id         => "#{parent[:id]}_#{node[:id]}",
       :text       => node[:name],
       :tip        => _("Host: %{name}") % {:name => node[:name]},
       :icon       => 'pficon pficon-container-node',
       :select     => node.kind_of?(Hash) ? node[:capture] : !value,
       :selectable => false,
       :nodes      => []}
    end
    count_only_or_objects(count_only, nodes)
  end
end
