module TaskDetailsHelper
  private

  def row_data_with_link(label, link, value)
    {:cells => {:label => label, :value => value, :link => link}}
  end

  def task_details_summary(miq_task, miq_server)
    rows = [
      row_data(_('Task ID'), miq_task.id),
      row_data(_('Task Name'), miq_task.name),
      row_data(_('State'), _(miq_task.state.titleize)),
      row_data(_('Status'), _(miq_task.status.titleize)),
      row_data(_('Message'), _(miq_task.message.titleize)),
      row_data(_('User'), miq_task.userid),
      row_data(_('Queued'), format_timezone(miq_task.created_on)),
      row_data(_('Updated'), format_timezone(miq_task.updated_on)),
    ]

    if miq_server
      rows.push(row_data(_('Server'), miq_server.name))
    else
      rows.push(row_data(_('Server'), ''))
    end

    miq_structured_list(
      :title => _('Task Details'),
      :mode  => "task_details_summary_attribute",
      :rows  => rows
    )
  end
end
