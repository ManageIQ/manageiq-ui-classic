class TreeBuilderUtilization < TreeBuilder
  has_kids_for MiqRegion, [:x_get_tree_region_kids]
  has_kids_for ExtManagementSystem, [:x_get_tree_ems_kids]
  has_kids_for EmsCluster, [:x_get_tree_cluster_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def override(node, _object)
    if node[:key].split('-')[1].split('_')[0] == 'folder'
      node[:selectable] = false
      node[:class] = append_no_cursor(node[:class])
    end
  end

  def root_options
    {
      :text    => text = _("Enterprise"),
      :tooltip => text,
      :icon    => 'pficon pficon-enterprise'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    ent = MiqEnterprise.my_enterprise
    objects = ent.miq_regions.sort_by { |a| a.description.downcase }
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_region_kids(object, count_only)
    emses = Rbac.filtered(object.ems_infras)
    storages = Rbac.filtered(object.storages)
    if count_only
      emses.count + storages.count
    else
      objects = []
      if emses.count.positive?
        objects.push(:id   => "folder_e_xx-#{object.id}",
                     :text => _("Providers"),
                     :icon => "pficon pficon-folder-close",
                     :tip  => _("Providers (Click to open)"))
      end
      if storages.count.positive?
        objects.push(:id   => "folder_ds_xx-#{object.id}",
                     :text => _("Datastores"),
                     :icon => "pficon pficon-folder-close",
                     :tip  => _("Datastores (Click to open)"))
      end
      objects
    end
  end

  def x_get_tree_custom_kids(object, count_only)
    nodes = object[:id].split('_')
    id = nodes.last.split('-').last
    if object_ems?(nodes, object)
      rec = MiqRegion.find_by(:id => id)
      objects = rbac_filtered_sorted_objects(rec.ems_infras, "name")
      count_only_or_objects(count_only, objects)
    elsif object_ds?(nodes, object)
      rec = MiqRegion.find_by(:id => id)
      objects = rbac_filtered_sorted_objects(rec.storages, "name")
      count_only_or_objects(count_only, objects)
    elsif object_cluster?(nodes, object)
      rec = ExtManagementSystem.find_by(:id => id)
      objects = rbac_filtered_sorted_objects(rec.ems_clusters, "name") +
                rbac_filtered_sorted_objects(rec.non_clustered_hosts, "name")
      count_only_or_objects(count_only, objects)
    end
  end

  def object_ems?(nodes, object)
    (nodes.length > 1 && nodes[1] == "e") ||
      (object[:full_id] && object[:full_id].split('_')[1] == "e")
  end

  def object_ds?(nodes, object)
    (nodes.length > 1 && nodes[1] == "ds") ||
      (object[:full_id] && object[:full_id].split('_')[1] == "ds")
  end

  def object_cluster?(nodes, object)
    (nodes.length > 1 && nodes[1] == "c") ||
      (object[:full_id] && object[:full_id].split('_')[1] == "c")
  end

  def rbac_filtered_sorted_objects(records, sort_by, options = {})
    Rbac.filtered(records, options).sort_by { |o| o.deep_send(sort_by).to_s.downcase }
  end

  def x_get_tree_ems_kids(object, count_only)
    ems_clusters        = Rbac.filtered(object.ems_clusters)
    non_clustered_hosts = Rbac.filtered(object.non_clustered_hosts)

    total = ems_clusters.count + non_clustered_hosts.count

    return total if count_only
    return [] if total == 0

    [
      {
        :id   => "folder_c_xx-#{object.id}",
        :text => _("Cluster / Deployment Role"),
        :icon => "pficon pficon-folder-close",
        :tip  => _("Cluster / Deployment Role (Click to open)")
      }
    ]
  end

  def x_get_tree_cluster_kids(object, count_only)
    count_only_or_objects(count_only, rbac_filtered_sorted_objects(object.hosts, "name"))
  end
end
