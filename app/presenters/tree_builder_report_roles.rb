class TreeBuilderReportRoles < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    text = if User.current_user.super_admin_user?
             _("All EVM Groups")
           else
             _("My EVM Groups")
           end
    {
      :text    => text,
      :tooltip => text,
      :icon    => 'ff ff-group'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    user  = User.current_user
    roles = user.super_admin_user? ? MiqGroup.non_tenant_groups_in_my_region : [user.current_group]
    count_only_or_objects(false, roles, 'name')
  end
end
