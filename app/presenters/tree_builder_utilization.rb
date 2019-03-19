class TreeBuilderUtilization < TreeBuilder
  has_kids_for MiqRegion, [:x_get_tree_region_kids]
  has_kids_for ExtManagementSystem, [:x_get_tree_ems_kids]
  has_kids_for Datacenter, %i(x_get_tree_datacenter_kids type)
  has_kids_for EmsFolder, %i(x_get_tree_folder_kids type)
  has_kids_for EmsCluster, [:x_get_tree_cluster_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def override(node, _object, _pid, _options)
    node[:selectable] = node[:key].split('-')[1].split('_')[0] != 'folder'
  end

  def root_options
    {
      :text    => text = _("Enterprise"),
      :tooltip => text,
      :icon    => 'pficon pficon-enterprise'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    ent = MiqEnterprise.my_enterprise
    objects = ent.miq_regions.sort_by { |a| a.description.downcase }
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_region_kids(object, count_only)
    emstype = if %i(bottlenecks utilization).include?(@type)
                object.ems_infras
              else
                object.ext_management_systems
              end
    emses = Rbac.filtered(emstype)
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

  def x_get_tree_datacenter_kids(object, count_only, type)
    objects =
      case type
      when :vandt then x_get_tree_vandt_datacenter_kids(object)
      when :handc then x_get_tree_handc_datacenter_kids(object)
      end
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_vandt_datacenter_kids(object)
    # Count clusters directly in this folder
    objects = rbac_filtered_sorted_objects(object.clusters, "name", :match_via_descendants => VmOrTemplate)
    object.folders.each do |f|
      if f.name == "vm"                 # Count vm folder children
        objects += rbac_filtered_sorted_objects(f.folders, "name", :match_via_descendants => VmOrTemplate)
        objects += rbac_filtered_sorted_objects(f.vms_and_templates, "name")
      elsif f.name == "host"            # Don't count host folder children
      else                              # add in other folders
        f = Rbac.filtered_object(f, :match_via_descendants => VmOrTemplate)
        objects << f if f
      end
    end
  end

  def x_get_tree_handc_datacenter_kids(object)
    objects = rbac_filtered_sorted_objects(object.clusters, "name")
    object.folders.each do |f|
      if f.name == "vm"                 # Don't add vm folder children
      elsif f.name == "host"            # Add host folder children
        objects += rbac_filtered_sorted_objects(f.folders, "name")
        objects += rbac_filtered_sorted_objects(f.clusters, "name")
        objects += rbac_filtered_sorted_objects(f.hosts, "name")
      else                              # add in other folders
        f = Rbac.filtered_object(f)
        objects << f if f
      end
    end
  end

  def x_get_tree_folder_kids(object, count_only, type)
    objects = []
    case type
    when :vandt, :handc, :storage_pod
      objects =  rbac_filtered_sorted_objects(object.folders_only, "name", :match_via_descendants => VmOrTemplate)
      objects += rbac_filtered_sorted_objects(object.datacenters_only, "name", :match_via_descendants => VmOrTemplate)
      objects += rbac_filtered_sorted_objects(object.clusters, "name", :match_via_descendants => VmOrTemplate)
      objects += rbac_filtered_sorted_objects(object.hosts, "name", :match_via_descendants => VmOrTemplate)
      objects += rbac_filtered_sorted_objects(object.vms_and_templates, "name")
    end
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_cluster_kids(object, count_only)
    objects = rbac_filtered_sorted_objects(object.hosts, "name")
    # FIXME: is the condition below ever false?
    unless %i(bottlenecks utilization).include?(@type)
      objects += rbac_filtered_sorted_objects(object.resource_pools, "name")
      objects += rbac_filtered_sorted_objects(object.vms, "name")
    end
    count_only_or_objects(count_only, objects)
  end
end
