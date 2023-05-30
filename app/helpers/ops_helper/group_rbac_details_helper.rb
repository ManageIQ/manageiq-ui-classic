module OpsHelper::GroupRbacDetailsHelper
  private

  def row_data_for_role(label, value, icon)
    {:cells => {:label => label, :value => value, :icon => icon}}
  end

  def row_data_for_users(icon, value, style)
    {:cells => {:icon => icon, :value => value, :style => style}}
  end

  def group_rbac_details_summary(group)
    summary = [
      group_information_summary(group),
      users_summary_info(group),
    ]
    safe_join(summary)
  end

  def group_information_summary(group)
    rows = [
      row_data(_('ID'), group.id),
      row_data(_('Description'), group.description),
      row_data(_('Detailed Description'), group.detailed_description),
    ]

    if group.miq_user_role
      row = row_data_for_role(_('Role'), group.miq_user_role.name, "ff ff-user-role")
      if role_allows?(:feature => "rbac_group_show")
        row[:cells][:link] = group.miq_user_role.name
        row[:cells][:onclick] = "miqOnClickSelectRbacTreeNode('ur-#{group.miq_user_role.id}')"
        row[:cells][:title] = _("View this Role")
      else
        row[:cells][:link] = "#"
      end
      rows.push(row)
    else
      rows.push(row_data(_('Role'), ''))
    end

    if group.tenant
      row = row_data_for_role(_('Project/Tenant'), group.tenant.name, "pficon pficon-#{group.tenant.divisible ? "tenant" : "project"}")
      if role_allows?(:feature => "rbac_tenant_view")
        row[:cells][:link] = group.tenant.name
        row[:cells][:onclick] = "miqTreeActivateNode('rbac_tree', 'tn-#{group.tenant.id}');"
        row[:cells][:title] = group.tenant.divisible ? _("View this Tenant") : _("View this Project")
      end
      rows.push(row)
    else
      rows.push(row_data(_('Project/Tenant'), ''))
    end

    miq_structured_list({
                          :title => _("Group Information"),
                          :mode  => "group_information_summary",
                          :rows  => rows
                        })
  end

  def users_summary_info(group)
    rows = []
    group.users.sort_by { |a| a.name.downcase }.each do |u|
      if role_allows?(:feature => "rbac_group_show")
        row = row_data_for_users("pficon pficon-user", u.name, "display_flex cursor_pointer")
        row[:cells][:link] = u.name
        row[:cells][:onclick] = "miqOnClickSelectRbacTreeNode('u-#{u.id}')"
        row[:cells][:title] = _("View this User")
      else
        row[:cells][:link] = u.name, "#"
      end
      rows.push(row)
    end

    miq_structured_list({
                          :title => _("Users in this Group"),
                          :mode  => "users_summary_info",
                          :rows  => rows
                        })
  end
end
