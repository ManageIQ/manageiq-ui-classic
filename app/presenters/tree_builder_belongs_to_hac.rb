class TreeBuilderBelongsToHac < TreeBuilder
  has_kids_for Datacenter, [:x_get_tree_datacenter_kids]
  has_kids_for EmsCluster, [:x_get_tree_cluster_kids]
  has_kids_for EmsFolder, [:x_get_tree_folder_kids]
  has_kids_for ExtManagementSystem, [:x_get_provider_kids]
  has_kids_for ResourcePool, [:x_get_resource_pool_kids]

  def override(node, object)
    node.checked = @selected_nodes&.include?("#{object.class.name}_#{object[:id]}")
    node.hide_checkbox = true if object.kind_of?(Host) && object.ems_cluster_id.present?
    node.selectable = false
    node.checkable = @edit.present?
  end

  def initialize(name, sandbox, build, **params)
    @edit = params[:edit]
    @group = params[:group]
    @selected_nodes = params[:selected_nodes]
    # need to remove tree info
    TreeState.new(sandbox).remove_tree(name)
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids   => true,
      :checkboxes => true,
      :oncheck    => @edit ? "miqOnCheckUserFilters" : nil,
      :check_url  => "/ops/rbac_group_field_changed/#{group_id}___"
    }
  end

  def x_get_tree_roots
    count_only_or_objects(false, ExtManagementSystem.assignable)
  end

  def x_get_provider_kids(parent, count_only)
    kids = []
    parent.children.each do |child|
      # this node (child) is not added to a tree
      kids.concat(child.folders_only)
      kids.concat(child.datacenters_only)
    end
    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_datacenter_kids(parent, count_only)
    children = parent.folders.each_with_object([]) do |child, arr|
      next unless child.kind_of?(EmsFolder)

      case child.name
      when 'datastore'
        arr.push(child)
      when 'host'
        [:folders_only, :clusters, :hosts].each { |m| arr.concat(child.send(m)) }
      end
    end
    count_only_or_objects(count_only, children)
  end

  def x_get_tree_cluster_kids(parent, count_only)
    count_only_or_objects(count_only, parent.hosts) + count_only_or_objects(count_only, parent.resource_pools)
  end

  def x_get_resource_pool_kids(parent, count_only)
    count_only_or_objects(count_only, parent.is_default? ? parent.resource_pools : [])
  end

  def x_get_tree_folder_kids(parent, count_only = false)
    count_only_or_objects(count_only, parent.folders_only) +
      count_only_or_objects(count_only, parent.datacenters_only) +
      count_only_or_objects(count_only, parent.clusters) +
      count_only_or_objects(count_only, parent.hosts)
  end
end
