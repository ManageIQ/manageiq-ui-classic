class TreeBuilderReportSavedReports < TreeBuilderReportReportsClass
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Saved Reports"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    u = User.current_user
    user_groups = u.report_admin_user? ? nil : u.miq_groups
    having_report_results(user_groups).sort
  end

  # Scope on reports that have report results.
  def having_report_results(miq_groups)
    miq_group_relation = MiqReport.joins(:miq_report_results).distinct
    if miq_groups.nil? # u.report_admin_user?
      miq_group_relation.where.not(:miq_report_results => {:miq_group_id => nil})
    else
      miq_group_relation.where(:miq_report_results => {:miq_group_id => miq_groups})
    end
  end
end
