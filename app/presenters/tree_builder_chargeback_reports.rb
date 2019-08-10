class TreeBuilderChargebackReports < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("Saved Chargeback Reports"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    items = MiqReportResult.with_saved_chargeback_reports
                           .select_distinct_results
                           .group("miq_report_results.miq_report_id, miq_reports.name, miq_report_results.id, \
                                   miq_reports.id")
    if count_only
      items.length
    else
      objects = []
      items.each_with_index do |item, idx|
        objects.push(
          :id   => "#{item.miq_report_id}-#{idx}",
          :text => item.miq_report.name,
          :icon => "fa fa-file-text-o",
          :tip  => item.name
        )
      end
      objects
    end
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(object, count_only, _options)
    objects = MiqReportResult.with_saved_chargeback_reports(object[:id].split('-').first)
                             .select(:id, :miq_report_id, :name, :last_run_on, :miq_task_id)
                             .order(:last_run_on => :desc)

    count_only_or_objects(count_only, objects)
  end
end
