module RequestDetailsHelper
  private

  def row_data_with_link(label, link, value)
    {:cells => {:label => label, :value => value, :link => link}}
  end

  def request_details_summary(miq_request, user)
    rows = [
      row_data(_('Request ID'), miq_request.id),
      row_data(_('Status'), _(miq_request.status)),
      row_data(_('Request State'), _(miq_request.state.titleize))
    ]
    rows.push(row_data(_('Requester'), miq_request.requester_name)) if miq_request.requester
    rows.push(row_data(_('Request Type'), _(miq_request.request_type_display)))
    rows.push(row_data(_('Description'), _(miq_request.description)))
    rows.push(row_data(_('Last Message'), miq_request.message))
    rows.push(row_data(_('Created On'), format_timezone(miq_request.created_on)))
    rows.push(row_data(_('Last Update'), format_timezone(miq_request.updated_on)))
    rows.push(row_data_with_link(_("Parent Request"), "/miq_request/show/#{miq_request.parent_id}", "/miq_request/show/#{miq_request.parent_id}")) if miq_request.parent_id
    rows.push(row_data(_("Completed"), format_timezone(miq_request.fulfilled_on))) if miq_request.fulfilled_on
    rows.push(row_data(_('Approval State'), _(miq_request.approval_state.titleize)))
    rows.push(row_data(_("Approved/Denied by"), miq_request.stamped_by + (user && " (#{user.name})"))) if miq_request.stamped_by
    rows.push(row_data(_("Approved/Denied on"), format_timezone(miq_request.stamped_on)))
    rows.push(row_data(_("Reason"), _(miq_request.reason)))

    if miq_request.approval_state.downcase == "approved" && miq_request.resource_type == "MiqProvisionRequest" && !miq_request.resource.miq_provisions.empty?
      row = row_data_with_link(_("Provisioned VMs"), miq_request.resource.miq_provisions.length, miq_request.resource.miq_provisions.length)
      row[:cells][:onclick] = "DoNav('#{'/miq_request/show/' << miq_request.id.to_s << '?display=miq_provisions'}');"
      row[:cells][:title] = _("Click to view details")
      rows.push(row)
    end

    miq_structured_list(
      :title => _('Request Details'),
      :mode  => "request_details_summary_attribute",
      :rows  => rows
    )
  end
end
