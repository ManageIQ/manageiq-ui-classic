module SettingsRbacTagHelper
  private

  def row_data_with_icon(label, value, icon)
    {:cells => {:label => label, :value => value, :icon => icon}}
  end

  def settings_rbac_tag_summary
    data = {:title => "#{current_tenant.name} #{_("Tags")}", :mode => "settings_rbac_tag_details", :rows => []}
    if session[:assigned_filters].empty?
      data[:message] = _("No %{tenant_name} Tags have been assigned") % {:tenant_name => current_tenant.name}
    else
      data[:rows] = session[:assigned_filters].keys.sort.map do |filter|
        {:cells => {
          :label => filter,
          :value => session[:assigned_filters][filter].sort.join(' | '),
          :icon  => "fa fa-tag",
          :style => "display_flex"
        }}
      end
    end
    miq_structured_list(data)
  end
end
