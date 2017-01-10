class TreeBuilderStorage < TreeBuilder
  private

  def tree_init_options(_tree_name)
    {:leaf => "Storage"}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {
      :title   => t = _("All Datastores"),
      :tooltip => t
    }
  end

  def x_get_tree_roots(count_only, _options)
    objects =
      [
        {:id => "global", :text => _("Global Filters"), :icon => "pficon pficon-folder-close", :tip => _("Global Shared Filters"), :cfmeNoClick => true},
        {:id => "my",     :text => _("My Filters"),     :icon => "pficon pficon-folder-close", :tip => _("My Personal Filters"),   :cfmeNoClick => true}
      ]
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, options)
    return count_only ? 0 : [] if object[:id] != "global"
    objects = MiqSearch.where(:db => options[:leaf]).visible_to_all
    count_only_or_objects(count_only, objects, "description")
  end
end
