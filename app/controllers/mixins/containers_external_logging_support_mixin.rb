module ContainersExternalLoggingSupportMixin
  def launch_external_logging
    assert_privileges('ems_container_launch_external_logging')
    record = self.class.model.find(params[:id])
    ems = record.ext_management_system
    route_name = ems.external_logging_route_name
    logging_route = ContainerRoute.find_by(:name => route_name, :ems_id => ems.id) if route_name
    if logging_route
      user_token = SecureRandom.base64(15)
      query_params = {'access_token' => ems.authentication_token,
                      'user_token'   => user_token,
                      'redirect'     => record.external_logging_path}
      url = URI::HTTPS.build(:host  => logging_route.host_name, :path => '/auth/sso-setup',
                             :query => URI.encode_www_form(query_params))
      begin
        res = Net::HTTP.start(url.hostname, url.port,
                              :use_ssl     => true,
                              :verify_mode => ems.verify_ssl_mode,
                              :cert_store  => ems.ssl_cert_store) do |http|
          http.request(Net::HTTP::Get.new(url.request_uri))
        end
      rescue Errno::ECONNREFUSED, SocketError => _e
        javascript_flash(:text        => _("Cannot access '%{hostname}. " \
                                           "Make sure that the logging route is accessible") %
                                          {:hostname => url.hostname},
                         :severity    => :error,
                         :spinner_off => true)
      rescue OpenSSL::SSL::SSLError => e
        javascript_flash(:text        => _("Cannot validate certificate to '%{hostname}. " \
                                           "Make sure that you use a certificate signed by the root Openshift Cert." \
                                           "error message: %{err}") %
                                            {:hostname => url.hostname, :err => e.message },
                         :severity    => :error,
                         :spinner_off => true)
      else
        if res.code_type == Net::HTTPOK
          query_params.delete('access_token')
          url = URI::HTTPS.build(:host  => logging_route.host_name, :path => '/auth/sso-login',
                                 :query => URI.encode_www_form(query_params))
        else
          scheme = URI.parse(logging_route.host_name).scheme || "https"
          url = "#{scheme}://#{logging_route.host_name}#{record.external_logging_path}"
        end
        javascript_open_window(url.to_s)
      end
    else
      javascript_flash(:text        => _("A route named '%{route_name}' is configured to connect to the " \
                                          "external logging server but it doesn't exist") %
                                         {:route_name => route_name},
                       :severity    => :error,
                       :spinner_off => true)
    end
  end
end
