class TreeBuilderTimelines < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  # Needs to be true only for first two levels. Move to better place later
  def override(node, object, _pid, _options)
    if object.kind_of?(MiqReport)
      node[:tooltip] = _("Report: %{name}") % {:name => object.name}
    end
    node[:expand] = object[:expand] if object[:expand].present?
  end

  # {'first level' => {'second level' => [MiqReports]}}
  def reports
    @rep = MiqReport.all.sort_by { |r| [r.rpt_type, r.filename.to_s, r.name] }
    @rep.reject! { |r| r.timeline.nil? }
    @rep.each_with_object({}) do |report, reports|
      next if report.template_type != "report" && report.template_type.present?
      first, second = if report.rpt_group == 'Custom'
                        [@title, 'Custom']
                      else
                        report.rpt_group.split('-').collect(&:strip)
                      end
      if reports.fetch_path(first, second)
        reports[first][second].push(report)
      else
        reports.store_path(first, second, [report])
      end
    end
  end

  def initialize(name, type, sandbox, build, params)
    @title = params[:title]
    @reports = reports
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options(_tree_name)
    {
      :lazy     => false,
      :add_root => false
    }
  end

  def root_options
    {}
  end

  def x_get_tree_roots(count_only, _options)
    kids = @reports.keys.sort.map do |item|
      {
        :text       => item,
        :id         => item,
        :icon       => 'pficon pficon-folder-close',
        :tip        => item,
        :selectable => false,
        :expand     => true,
      }
    end
    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_hash_kids(parent, count_only)
    kids = if @reports.fetch_path(parent[:text])
             @reports[parent[:text]].keys.map do |item|
               {
                 :text       => item,
                 :id         => item,
                 :icon       => 'pficon pficon-folder-close',
                 :tip        => _("Group: %{name}") % {:name => item},
                 :expand     => false,
                 :selectable => false,
               }
             end
           else
             @reports.values.select { |item| item.key?(parent[:text]) }.first[parent[:text]]
           end
    count_only_or_objects(count_only, kids)
  end
end
