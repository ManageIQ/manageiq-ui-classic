class TreeBuilderReportSchedules < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Schedules"),
      :tooltip => t,
      :icon    => 'fa fa-clock-o'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    objects = if User.current_user.current_group.miq_user_role.name.split('-').last == 'super_administrator'
                # Super admins see all report schedules
                MiqSchedule.where(:resource_type => 'MiqReport')
              else
                MiqSchedule.where(:resource_type => 'MiqReport', :userid => User.current_user.userid)
              end
    count_only_or_objects(false, objects, 'name')
  end
end
