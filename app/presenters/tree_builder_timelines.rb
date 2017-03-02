class TreeBuilderTimelines < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, type, sandbox, build = true, **params)
    @menu = params[:menu]
    super(name, type, sandbox, build)
  end

  private

  def set_locals_for_render
    super.merge!(:id_prefix         => 'timelines_',
                 :onclick     => "miqOnClickTimelineSelection",
                 :click_url => "/dashboard/show_timeline/",
                 :tree_state  => true)
  end

  def tree_init_options(_tree_name)
    {:full_ids             => true,
     :lazy => false,
     :add_root             => false}
  end

  def root_options
    {}
  end

  def x_get_tree_roots(count_only, _options)
    menus = @menu.map do |item|
      {
        :id          => "r__#{item.first}",
        :text => t = item.first,
        :icon        => 'pficon pficon-folder-close',
        :tip         => t,
        :cfmeNoClick => true,
        :expand => true,
        :subsections => item.last
      }
    end
    count_only_or_objects(count_only, menus)
  end

  def x_get_tree_hash_kids(parent, count_only)
    subsections = parent[:subsections].map do |item|
      if item.kind_of?(Array)
        {
          :id          => "p__#{item.first}",
          :text => t = item.first,
          :icon        => 'pficon pficon-folder-close',
          :tip         => _("Group: %{t}"),
          :cfmeNoClick => true,
          :expand => true,
          :subsections => item.last
        }
      else
        report = MiqReport.find_by_name(item)
        if report.present?
          {
            :id          => "#{report.id}__#{item}",
            :text => t = item,
            :image        => "100/link_internal.gif",
            :tip         => _("Report: %{t}"),
            :cfmeNoClick => false,
            :expand => true,
            :subsections => []
          }
        end
      end
    end
    count_only_or_objects(count_only, subsections)
  end

end
