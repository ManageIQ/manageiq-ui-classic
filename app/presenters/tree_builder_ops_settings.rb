class TreeBuilderOpsSettings < TreeBuilderOps
  private

  def tree_init_options
    {:open_all => true}
  end

  def root_options
    region = MiqRegion.my_region
    text = _("%{product} Region: %{region_description} [%{region}]") % {:region_description => region.description,
                                                                        :region             => region.region,
                                                                        :product            => Vmdb::Appliance.PRODUCT_NAME}
    {
      :text    => text,
      :tooltip => text,
      :icon    => 'pficon pficon-regions'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    objects = [
      {:id => "sis", :text => _("Analysis Profiles"), :icon => "fa fa-search", :tip => _("Analysis Profiles")},
      {:id => "z", :text => _("Zones"), :icon => "pficon pficon-zone", :tip => _("Zones")}
    ]
    objects.push(:id => "msc", :text => _("Schedules"), :icon => "fa fa-clock-o", :tip => _("Schedules"))
    objects
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(object, count_only)
    case object[:id]
    when "msc"
      objects = MiqSchedule.where("(prod_default != 'system' or prod_default is null) AND adhoc is null")
      count_only_or_objects(count_only, objects, "name")
    when "sis"
      count_only_or_objects(count_only, ScanItemSet.all, "name")
    when "z"
      region = MiqRegion.my_region
      count_only_or_objects(count_only, region.zones.visible, "name")
    end
  end
end
