class TreeBuilderServices < TreeBuilder
  # Services are returned in a tree - kids are discovered automatically

  private

  def tree_init_options(_tree_name)
    {
      :leaf     => "Service",
      :add_root => false
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {}
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    objects = [
      {
        :id            => "asrv",
        :text          => _("Active Services"),
        :icon          => "pficon pficon-folder-close",
        :load_children => true,
        :tip           => _("Active Services")
      }, {
        :id            => "rsrv",
        :text          => _("Retired Services"),
        :icon          => "pficon pficon-folder-close",
        :load_children => true,
        :tip           => _("Retired Services")
      }, {
        :id         => "global",
        :text       => _("Global Filters"),
        :icon       => "pficon pficon-folder-close",
        :selectable => false,
        :tip        => _("Global Shared Filters")
      }, {
        :id         => "my",
        :text       => _("My Filters"),
        :icon       => "pficon pficon-folder-close",
        :selectable => false,
        :tip        => _("My Personal Filters")
      }
    ]
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, options)
    case object[:id]
    when 'my', 'global'
      # Get My Filters and Global Filters
      count_only_or_objects(count_only, x_get_search_results(object, options[:leaf]))
    when 'asrv', 'rsrv'
      retired = object[:id] != 'asrv'
      services = Rbac.filtered(Service.where(:retired => retired, :display => true))
      return sevices.size if count_only

      MiqPreloader.preload(services.to_a, :picture)
      Service.arrange_nodes(services.sort_by { |n| [n.ancestry.to_s, n.name.downcase] })
    end
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
