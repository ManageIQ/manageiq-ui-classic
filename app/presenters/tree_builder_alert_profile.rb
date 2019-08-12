class TreeBuilderAlertProfile < TreeBuilder
  has_kids_for MiqAlertSet, [:x_get_tree_ap_kids]

  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def alert_profile_kinds
    MiqAlert.base_tables.sort_by { |a| ui_lookup(:model => a) }
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Alert Profiles"),
      :tooltip => t
    }
  end

  # level 1 - * alert profiles
  def x_get_tree_roots(count_only)
    objects = alert_profile_kinds.map do |db|
      # Set alert profile folder nodes to open so we pre-load all children
      open_node("xx-#{db}")
      text = _("%{model} Alert Profiles") % {:model => ui_lookup(:model => db)}
      {:id => db, :text => text, :tip => text, :icon => db.constantize.decorate.fonticon}
    end

    count_only_or_objects(count_only, objects)
  end

  # level 2 - alert profiles
  def x_get_tree_custom_kids(parent, count_only)
    objects = MiqAlertSet.where(:mode => parent[:id].split('-'))

    count_only_or_objects(count_only, objects, :description)
  end

  # level 3 - alerts
  def x_get_tree_ap_kids(parent, count_only)
    count_only_or_objects(count_only,
                          parent.miq_alerts,
                          :description)
  end
end
