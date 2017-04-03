class TreeBuilderTimelines < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  # Needs to be true only for first two levels. Move to better place later
  def override(node, object, _pid, _options)
    node[:expand] = object[:expand] if object[:expand].present?
  end

  def initialize(name, type, sandbox, build = true, menu:)
    @menu = menu
    super(name, type, sandbox, build)
  end

  private

  def set_locals_for_render
    super.merge!(
      :id_prefix  => 'timelines_',
      :onclick    => "miqOnClickTimelineSelection",
      :click_url  => "/dashboard/show_timeline/",
      :tree_state => true
    )
  end

  def tree_init_options(_tree_name)
    {
      :full_ids => true,
      :lazy     => false,
      :add_root => false
    }
  end

  def root_options
    {}
  end

  def x_get_tree_roots(count_only, _options)
    menus = @menu.map do |item|
      title = item.first
      {
        :text        => title,
        :id          => "r__#{title}",
        :icon        => 'pficon pficon-folder-close',
        :tip         => title,
        :cfmeNoClick => true,
        :expand      => true,
        :subsections => item.last
      }
    end
    count_only_or_objects(count_only, menus.compact)
  end

  def x_get_tree_hash_kids(parent, count_only)
    subsections = parent[:subsections].map do |item|
      if item.kind_of?(Array)
        title = item.first
        {
          :text        => title,
          :id          => "p__#{title}",
          :icon        => 'pficon pficon-folder-close',
          :tip         => _("Group: %{:name}" % {:name => title}),
          :expand      => false,
          :cfmeNoClick => true,
          :subsections => item.last
        }
      else
        report = MiqReport.find_by(:name => item)
        if report.present?
          {
            :text        => item,
            :id          => "#{report.id}__#{item}",
            :icon        => "fa fa-arrow-circle-o-right",
            :tip         => _("Report: %{:name}" % {:name => item}),
            :subsections => []
          }
        end
      end
    end
    count_only_or_objects(count_only, subsections.compact)
  end
end
