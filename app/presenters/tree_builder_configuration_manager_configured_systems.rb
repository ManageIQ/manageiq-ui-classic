class TreeBuilderConfigurationManagerConfiguredSystems < TreeBuilder
  attr_reader :tree_nodes

  private

  def tree_init_options(_tree_name)
    {:leaf => "ManageIQ::Providers::ForemanProvider::ConfigurationManager::ConfiguredSystem"}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true, :allow_reselect => true)
  end

  def root_options
    {
      :title   => t = _("All Configured Systems"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    objects = []
    objects.push(:id            => "csf",
                 :text          => _("%{name} Configured Systems") % {:name => ui_lookup(:ui_title => 'foreman')},
                 :icon          => "pficon pficon-folder-close",
                 :tip           => _("%{name} Configured Systems") % {:name => ui_lookup(:ui_title => 'foreman')},
                 :load_children => true)
    objects.push(:id          => "global",
                 :text        => _("Global Filters"),
                 :icon        => "pficon pficon-folder-close",
                 :tip         => _("Global Shared Filters"),
                 :cfmeNoClick => true)
    objects.push(:id          => "my",
                 :text        => _("My Filters"),
                 :icon        => "pficon pficon-folder-close",
                 :tip         => _("My Personal Filters"),
                 :cfmeNoClick => true)
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, options)
    count_only_or_objects(count_only, x_get_search_results(object, options[:leaf]))
  end

  def x_get_search_results(object, leaf)
    case object[:id]
    when "global" # Global filters
      x_get_global_filter_search_results(leaf)
    when "my"     # My filters
      x_get_my_filter_search_results(leaf)
    end
  end

  def x_get_global_filter_search_results(leaf)
    MiqSearch.where(:db => leaf).visible_to_all.sort_by { |a| a.description.downcase }
  end

  def x_get_my_filter_search_results(leaf)
    MiqSearch.where(:db => leaf, :search_type => "user", :search_key => User.current_user.userid)
      .sort_by { |a| a.description.downcase }
  end
end
