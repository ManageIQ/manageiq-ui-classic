module EmsInfraHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'

  def scaling_field_label(param_name)
    field_name = param_name.dup
    case field_name
    when 'BlockStorageCount'
      _('Number of Block Storage Hosts')
    when 'ObjectStorageCount'
      _('Number of Object Storage Hosts')
    when 'CephStorageCount'
      _('Number of Ceph Storage Hosts')
    when 'ComputeCount'
      _('Number of Compute Hosts')
    when 'ControllerCount'
      _('Number of Controller Hosts')
    else
      field_name.sub!("Count", "")
      field_name.sub!("::count", "")
      _("Number of %{host_type} Hosts") % {:host_type => field_name.underscore.humanize.titleize}
    end
  end

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_infras_path : ems_infra_path(ems)
  end
end
