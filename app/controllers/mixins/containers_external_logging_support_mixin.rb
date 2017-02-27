module ContainersExternalLoggingSupportMixin
  def launch_external_logging_support
    record = self.class.model.find(params[:id])
    ems = record.ext_management_system
    route_name = ems.external_logging_route_name
    logging_route = ContainerRoute.find_by(:name => route_name, :ems_id => ems.id) if route_name
    if logging_route
      url = "https://#{logging_route.host_name}#{record.external_logging_path}"
      javascript_open_window(url)
    else
      javascript_flash(:text        => _("A route named '#{route_name}' is configured to connect to the " \
                                          "external logging server but it doesn't exist"),
                       :severity    => :error,
                       :spinner_off => true)
    end
  end
end
