module SettingsUsersHelper
  private

  def row_data_for_group_and_role(label, value, icon)
    {:cells => {:label => label, :value => value, :icon => icon}}
  end

  def row_data_for_groups_info(icon, link, value, style)
    {:cells => {:icon => icon, :link => link, :value => value, :style => style}}
  end

  def settings_users_summary(record)
    summary = [
      settings_users_basic_info(record),
      settings_users_groups_info(record)
    ]
    safe_join(summary)
  end

  def settings_user_onclick(tree_id)
    {
      :remote => true,
      :action => {
        :name   => "miqOnClickSelectRbacTreeNode",
        :treeId => tree_id,
      }
    }
  end

  def settings_users_basic_info(record)
    rows = [
      row_data(_('ID'), record.id),
      row_data(_('Full Name'), record.name),
      row_data(_('Username'), record.userid),
      row_data(_('E-mail Address'), record.email),
    ]
    if record.current_group
      row = row_data_for_group_and_role(_('Current Group'), record.current_group.description, "ff ff-group")
      if role_allows?(:feature => "rbac_group_show")
        row[:cells][:link] = record.current_group.description
        row[:cells][:onclick] = settings_user_onclick("g-#{record.current_group.id}")
        row[:cells][:title] = _("View this Group")
      else
        row[:cells][:link] = "#"
      end
      rows.push(row)
    else
      rows.push(row_data(_('Current Group'), ''))
    end

    if record.current_group&.miq_user_role
      row = row_data_for_group_and_role(_('Role'), record.miq_user_role_name, "ff ff-user-role")
      if role_allows?(:feature => "rbac_user_show")
        row[:cells][:link] = record.miq_user_role_name
        row[:cells][:onclick] = settings_user_onclick("ur-#{record.current_group.miq_user_role.id}")
        row[:cells][:title] = _("View this Role")
      else
        row[:cells][:link] = "#"
      end
      rows.push(row)
    else
      rows.push(row_data(_('Role'), record.miq_user_role_name))
    end

    miq_structured_list(
      :title => _('User Information'),
      :mode  => "settings_schedule_user_information",
      :rows  => rows
    )
  end

  def settings_users_groups_info(record)
    groups = record.present? && record.miq_groups.present? ? record.miq_groups.order(:description) : []
    rows = []
    if role_allows?(:feature => "rbac_group_show")
      groups.each do |group|
        row = row_data_for_groups_info("ff ff-group", group.description, group.description, "display_flex cursor_pointer")
        row[:cells][:onclick] = settings_user_onclick("g-#{group.id}")
        row[:cells][:title] = _("View this Group")
        rows.push(row)
      end
    else
      groups.each do |group|
        row = row_data_for_groups_info("ff ff-group", "#", group.description, "display_flex cursor_pointer")
        rows.push(row)
      end

    end

    miq_structured_list(
      :title => _('Groups'),
      :mode  => "settings_schedule_groups_information",
      :rows  => rows
    )
  end
end
