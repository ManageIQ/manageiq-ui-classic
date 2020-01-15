require 'openssl'
require 'webrick/httputils'

module Mixins
  module EmsCommon
    module Angular
      extend ActiveSupport::Concern

      OPENSTACK_PARAMS = %i[name provider_region api_version default_security_protocol keystone_v3_domain_id default_hostname default_api_port default_userid event_stream_selection].freeze
      OPENSTACK_AMQP_PARAMS = %i[name provider_region api_version amqp_security_protocol keystone_v3_domain_id amqp_hostname amqp_api_port amqp_userid event_stream_selection].freeze

      included do
        include Mixins::GenericFormMixin
      end

      def update
        assert_privileges("#{permission_prefix}_edit")
        case params[:button]
        when "cancel"   then update_ems_button_cancel
        when "save"     then update_ems_button_save
        when "validate" then update_ems_button_validate
        end
      end

      def update_ems_button_cancel
        update_ems = find_record_with_rbac(model, params[:id])
        flash_to_session(_("Edit of %{model} \"%{name}\" was cancelled by the user") %
          {:model => ui_lookup(:model => model.to_s), :name => update_ems.name})
        url_args = {
          :action  => @lastaction == 'show_dashboard' ? 'show' : @lastaction,
          :id      => update_ems.id,
          :display => session[:ems_display],
          :record  => update_ems
        }

        begin
          javascript_redirect(javascript_process_redirect_args(url_args))
        rescue ActionController::UrlGenerationError
          # if the target URL does not exist, redirect to 'show'
          url_args[:action] = 'show'
          javascript_redirect(javascript_process_redirect_args(url_args))
        end
      end

      def update_ems_button_save
        update_ems = find_record_with_rbac(model, params[:id])
        set_ems_record_vars(update_ems)
        if update_ems.save
          update_ems.reload
          add_flash(
            _("%{model} \"%{name}\" was saved") % {:model => ui_lookup(:model => model.to_s), :name => update_ems.name}
          )
          construct_edit_for_audit(update_ems)
          AuditEvent.success(build_saved_audit(update_ems, @edit))
          update_ems.authentication_check_types_queue(update_ems.authentication_for_summary.pluck(:authtype),
                                                      :save => true)
          flash_to_session
          javascript_redirect(@lastaction == 'show_list' ? ems_path('show_list') : ems_path(update_ems))
        else
          update_ems.errors.each do |field, msg|
            add_flash("#{field.to_s.capitalize} #{msg}", :error)
          end
          drop_breadcrumb(:name => _("Edit %{table} '%{name}'") %
            {:table => ui_lookup(:table => table_name), :name => update_ems.name},
                          :url  => "/#{table_name}/edit/#{update_ems.id}")
          @in_a_form = true
          render_flash
        end
      end

      def update_ems_button_validate
        result, details = realtime_authentication_check
        render_validation_result(result, details)
      end

      def realtime_authentication_check(verify_ems = nil)
        verify_ems ||= find_record_with_rbac(model, params[:id])
        set_ems_record_vars(verify_ems, :validate)
        @in_a_form = true
        verify_ems.authentication_check(params[:cred_type], :save => false, :database => params[:metrics_database_name])
      end

      def create_ems_button_validate
        @in_a_form = true
        ems_type = model.model_from_emstype(params[:emstype])
        result, details = if %w[ems_cloud ems_infra].include?(params[:controller])
                            ems_type.validate_credentials_task(get_task_args(ems_type), session[:userid], params[:zone])
                          else
                            realtime_authentication_check(ems_type.new)
                          end
        render_validation_result(result, details)
      end

      def render_validation_result(result, details)
        if result
          msg = if details.blank?
                  _("Credential validation was successful")
                else
                  _("Credential validation was successful: %{details}") % {:details => strip_tags(details)}
                end
        else
          msg = _("Credential validation was not successful: %{details}") % {:details => strip_tags(details)}
          level = :error
        end

        render_flash_json(msg, level, :long_alert => true)
      end

      def create
        assert_privileges("#{permission_prefix}_new")

        case params[:button]
        when "add" then create_ems_button_add
        when "validate" then create_ems_button_validate
        when "cancel" then create_ems_button_cancel
        end
      end

      def get_task_args(ems)
        user, password = params[:default_userid], ManageIQ::Password.encrypt(params[:default_password])
        case ems.to_s
        when 'ManageIQ::Providers::Openstack::CloudManager', 'ManageIQ::Providers::Openstack::InfraManager'
          case params[:cred_type]
          when 'default'
            [password, params.to_unsafe_h.slice(*OPENSTACK_PARAMS)]
          when 'amqp'
            [ManageIQ::Password.encrypt(params[:amqp_password]), params.to_unsafe_h.slice(*OPENSTACK_AMQP_PARAMS)]
          end
        when 'ManageIQ::Providers::Amazon::CloudManager'
          uri = URI.parse(WEBrick::HTTPUtils.escape(params[:default_url]))
          [
            user,
            password,
            :EC2,
            params[:provider_region],
            ems.http_proxy_uri,
            true,
            uri,
            {:assume_role => params[:default_assume_role].presence},
          ]
        when 'ManageIQ::Providers::Azure::CloudManager'
          uri = URI.parse(WEBrick::HTTPUtils.escape(params[:default_url]))
          [user, password, params[:azure_tenant_id], params[:subscription], ems.http_proxy_uri, params[:provider_region], uri]
        when 'ManageIQ::Providers::AzureStack::CloudManager'
          base_url = "#{params[:default_security_protocol] == 'non-ssl' ? 'http' : 'https'}://#{params[:default_hostname]}:#{params[:default_api_port]}"
          [base_url, params[:azure_tenant_id], user, password, params[:subscription], :Resources, params[:api_version], { :validate => true }]
        when 'ManageIQ::Providers::Vmware::CloudManager'
          case params[:cred_type]
          when 'amqp'
            [params[:amqp_hostname], params[:amqp_api_port], params[:amqp_userid], ManageIQ::Password.encrypt(params[:amqp_password]), params[:api_version], true]
          when 'default'
            [params[:default_hostname], params[:default_api_port], user, password, params[:api_version], true]
          end
        when 'ManageIQ::Providers::Google::CloudManager'
          [params[:project], ManageIQ::Password.encrypt(params[:service_account]), {:service => "compute"}, ems.http_proxy_uri, true]
        when 'ManageIQ::Providers::Microsoft::InfraManager'
          connect_opts = {
            :hostname          => params[:default_hostname],
            :user              => user,
            :password          => password,
            :port              => params[:default_api_port],
            :realm             => params[:realm],
            :security_protocol => params[:default_security_protocol],
          }

          [ems.build_connect_params(connect_opts), true]
        when 'ManageIQ::Providers::Redhat::InfraManager'
          metrics_user, metrics_password = params[:metrics_userid], ManageIQ::Password.encrypt(params[:metrics_password])
          [{
            :username         => user,
            :password         => password,
            :server           => params[:default_hostname],
            :port             => params[:default_api_port],
            :verify_ssl       => params[:default_tls_verify] == 'on' ? OpenSSL::SSL::VERIFY_PEER : OpenSSL::SSL::VERIFY_NONE,
            :ca_certs         => params[:default_tls_ca_certs],
            :metrics_username => metrics_user,
            :metrics_password => metrics_password,
            :metrics_server   => params[:metrics_hostname],
            :metrics_port     => params[:metrics_api_port],
            :metrics_database => params[:metrics_database_name],
          }]
        when 'ManageIQ::Providers::Kubevirt::InfraManager'
          [{
            :password   => params[:kubevirt_password],
            :server     => params[:kubevirt_hostname],
            :port       => params[:kubevirt_api_port],
            :verify_ssl => params[:kubevirt_tls_verify] == 'on' ? OpenSSL::SSL::VERIFY_PEER : OpenSSL::SSL::VERIFY_NONE,
            :ca_certs   => params[:kubevirt_tls_ca_certs],
          }]
        when 'ManageIQ::Providers::Vmware::InfraManager'
          case params[:cred_type]
          when 'console'
            [{:pass => ManageIQ::Password.encrypt(params[:console_password]), :user => params[:console_userid], :ip => params[:default_hostname], :use_broker => false}]
          when 'default'
            [{:pass => password, :user => user, :ip => params[:default_hostname], :use_broker => false}]
          end
        when 'ManageIQ::Providers::Nuage::NetworkManager'
          endpoint_opts = {:protocol => params[:default_security_protocol], :hostname => params[:default_hostname], :api_port => params[:default_api_port], :api_version => params[:api_version]}
          [user, params[:default_password], endpoint_opts]
        when 'ManageIQ::Providers::Lenovo::PhysicalInfraManager'
          [user, password, params[:default_hostname], params[:default_api_port], "token", false, true]
        when 'ManageIQ::Providers::Redfish::PhysicalInfraManager'
          [user, password, params[:default_hostname], params[:default_api_port],
           params[:default_security_protocol]]
        end
      end

      def create_ems_button_add
        ems = model.model_from_emstype(params[:emstype]).new
        set_ems_record_vars(ems) unless @flash_array
        if ems.valid? && ems.save
          construct_edit_for_audit(ems)
          AuditEvent.success(build_created_audit(ems, @edit))
          flash_to_session(_("%{model} \"%{name}\" was saved") % {:model => ui_lookup(:tables => table_name), :name => ems.name})
          javascript_redirect(:action => 'show_list')
        else
          @in_a_form = true
          ems.errors.each do |field, msg|
            add_flash("#{ems.class.human_attribute_name(field, :ui => true)} #{msg}", :error)
          end

          drop_breadcrumb(:name => _("Add New %{tables}") % {:tables => ui_lookup(:tables => table_name)},
                          :url  => new_ems_path)
          javascript_flash
        end
      end

      def create_ems_button_cancel
        model_name = model.to_s
        flash_to_session(_("Add of %{model} was cancelled by the user") % {:model => ui_lookup(:model => model_name)})
        javascript_redirect(:action  => @lastaction,
                            :display => session[:ems_display])
      end

      def ems_form_fields
        assert_privileges("#{permission_prefix}_edit")
        @ems = params[:id] == 'new' ? model.new : find_record_with_rbac(model, params[:id])
        default_endpoint = @ems.default_endpoint
        default_security_protocol = default_endpoint.security_protocol || security_protocol_default
        default_tls_verify = default_endpoint.verify_ssl != 0
        default_tls_ca_certs = default_endpoint.certificate_authority || ""

        amqp_userid = ""
        amqp_hostname = ""
        amqp_port = ""
        amqp_security_protocol = ""
        console_userid = ""
        smartstate_docker_userid = ""
        ssh_keypair_userid = ""
        metrics_userid = ""
        metrics_hostname = ""
        metrics_port = ""
        metrics_database_name = ""
        metrics_security_protocol = security_protocol_default
        metrics_tls_ca_certs = ""
        keystone_v3_domain_id = ""
        prometheus_alerts_hostname = ""
        prometheus_alerts_api_port = ""
        prometheus_alerts_security_protocol = security_protocol_default
        prometheus_alerts_tls_ca_certs = ""
        kubevirt_hostname = ""
        kubevirt_api_port = ""
        kubevirt_security_protocol = default_security_protocol
        kubevirt_tls_ca_certs = ""
        kubevirt_password = ""
        kubevirt_tls_verify = false

        provider_options = @ems.options || {}

        if @ems.connection_configurations.amqp.try(:endpoint)
          amqp_hostname = @ems.connection_configurations.amqp.endpoint.hostname
          amqp_port = @ems.connection_configurations.amqp.endpoint.port
          amqp_security_protocol = @ems.connection_configurations.amqp.endpoint.security_protocol || 'ssl'
        end

        if @ems.has_authentication_type?(:amqp)
          amqp_userid = @ems.authentication_userid(:amqp).to_s
          amqp_auth_status = @ems.authentication_status_ok?(:amqp)
        end

        if @ems.has_authentication_type?(:console)
          console_userid = @ems.authentication_userid(:console).to_s
          console_auth_status = true
        end

        if @ems.has_authentication_type?(:smartstate_docker)
          smartstate_docker_userid = @ems.authentication_userid(:smartstate_docker).to_s
        end

        if @ems.has_authentication_type?(:ssh_keypair)
          ssh_keypair_userid = @ems.authentication_userid(:ssh_keypair).to_s
          ssh_keypair_auth_status = @ems.authentication_status_ok?(:ssh_keypair)
        end

        if @ems.connection_configurations.metrics.try(:endpoint)
          metrics_hostname = @ems.connection_configurations.metrics.endpoint.hostname
          metrics_port = @ems.connection_configurations.metrics.endpoint.port
          metrics_database_name = @ems.connection_configurations.metrics.endpoint.path
        end

        if @ems.has_authentication_type?(:metrics)
          metrics_userid = @ems.authentication_userid(:metrics).to_s
          metrics_auth_status = @ems.authentication_status_ok?(:metrics)
        end

        if @ems.respond_to?(:keystone_v3_domain_id)
          keystone_v3_domain_id = @ems.keystone_v3_domain_id
        end

        if respond_to?(:retrieve_metrics_selection)
          metrics_selection = retrieve_metrics_selection.to_sym
          connection_configurations_metrics_endpoint = @ems.connection_configurations.try(metrics_selection).try(:endpoint)
        else
          connection_configurations_metrics_endpoint = nil
        end

        if connection_configurations_metrics_endpoint
          metrics_hostname = connection_configurations_metrics_endpoint.hostname
          metrics_port = connection_configurations_metrics_endpoint.port
          metrics_auth_status = @ems.authentication_status_ok?(metrics_selection)
          metrics_security_protocol = connection_configurations_metrics_endpoint.security_protocol
          metrics_security_protocol ||= security_protocol_default
          metrics_tls_ca_certs = connection_configurations_metrics_endpoint.certificate_authority
        end

        if @ems.connection_configurations.prometheus_alerts.try(:endpoint)
          prometheus_alerts_hostname = @ems.connection_configurations.prometheus_alerts.endpoint.hostname
          prometheus_alerts_api_port = @ems.connection_configurations.prometheus_alerts.endpoint.port
          prometheus_alerts_auth_status = @ems.authentication_status_ok?(:alerts)
          prometheus_alerts_security_protocol = @ems.connection_configurations.prometheus_alerts.endpoint.security_protocol
          prometheus_alerts_security_protocol ||= security_protocol_default
          prometheus_alerts_tls_ca_certs = @ems.connection_configurations.prometheus_alerts.endpoint.certificate_authority
        end

        if @ems.connection_configurations.kubevirt.try(:endpoint)
          kubevirt_hostname = @ems.connection_configurations.kubevirt.endpoint.hostname
          kubevirt_api_port = @ems.connection_configurations.kubevirt.endpoint.port
          kubevirt_auth_status = @ems.authentication_status_ok?(:kubevirt)
          kubevirt_security_protocol = @ems.connection_configurations.kubevirt.endpoint.security_protocol
          kubevirt_security_protocol ||= default_security_protocol
          kubevirt_tls_ca_certs = @ems.connection_configurations.kubevirt.endpoint.certificate_authority
          kubevirt_tls_verify = @ems.connection_configurations.kubevirt.endpoint.verify_ssl
        end

        if @ems.connection_configurations.default.try(:endpoint)
          default_hostname = @ems.connection_configurations.default.endpoint.hostname
          default_api_port = @ems.connection_configurations.default.endpoint.port
        else
          default_hostname = @ems.hostname
          default_api_port = @ems.port
        end

        @ems_types = Array(model.supported_types_and_descriptions_hash.invert).sort_by(&:first)

        if @ems.kind_of?(ManageIQ::Providers::Vmware::InfraManager)
          host_default_vnc_port_start = @ems.host_default_vnc_port_start.to_s
          host_default_vnc_port_end = @ems.host_default_vnc_port_end.to_s
        end

        if @ems.supports?(:assume_role)
          assume_role = @ems.authentication_service_account
        end

        if @ems.kind_of?(ManageIQ::Providers::Azure::CloudManager)
          azure_tenant_id = @ems.azure_tenant_id
          subscription    = @ems.subscription
          client_id       = @ems.authentication_userid.to_s
          client_key      = @ems.authentication_password.to_s
        end

        if @ems.kind_of?(ManageIQ::Providers::AzureStack::CloudManager)
          azure_tenant_id = @ems.azure_tenant_id
          subscription    = @ems.subscription
        end

        if @ems.kind_of?(ManageIQ::Providers::Google::CloudManager)
          project         = @ems.project
          service_account = @ems.authentication_token
          service_account_auth_status = @ems.authentication_status_ok?
        end

        if @ems.kind_of?(ManageIQ::Providers::Nuage::NetworkManager)
          amqp_fallback_hostname1 = @ems.connection_configurations.amqp_fallback1 ? @ems.connection_configurations.amqp_fallback1.endpoint.hostname : ""
          amqp_fallback_hostname2 = @ems.connection_configurations.amqp_fallback2 ? @ems.connection_configurations.amqp_fallback2.endpoint.hostname : ""
        end

        if %w[ems_cloud ems_network].include?(controller_name)
          render :json => {:name                            => @ems.name,
                           :emstype                         => @ems.emstype,
                           :zone                            => zone,
                           :zone_hidden                     => zone == MiqRegion.my_region.maintenance_zone.name,
                           :tenant_mapping_enabled          => @ems.tenant_mapping_enabled == true,
                           :provider_id                     => @ems.provider_id || "",
                           :hostname                        => @ems.hostname,
                           :default_hostname                => default_hostname,
                           :amqp_hostname                   => amqp_hostname,
                           :default_api_port                => default_api_port || "",
                           :amqp_api_port                   => amqp_port || "",
                           :api_version                     => @ems.api_version || "v2",
                           :default_security_protocol       => default_security_protocol,
                           :amqp_security_protocol          => amqp_security_protocol,
                           :provider_region                 => @ems.provider_region,
                           :openstack_infra_providers_exist => retrieve_openstack_infra_providers.length.positive?,
                           :default_userid                  => @ems.authentication_userid.to_s,
                           :amqp_userid                     => amqp_userid,
                           :ssh_keypair_userid              => ssh_keypair_userid,
                           :smartstate_docker_userid        => smartstate_docker_userid,
                           :service_account                 => service_account.to_s,
                           :azure_tenant_id                 => azure_tenant_id.to_s,
                           :keystone_v3_domain_id           => keystone_v3_domain_id,
                           :subscription                    => subscription.to_s,
                           :client_id                       => client_id.to_s,
                           :client_key                      => client_key.to_s,
                           :project                         => project.to_s,
                           :emstype_vm                      => @ems.kind_of?(ManageIQ::Providers::Vmware::InfraManager),
                           :event_stream_selection          => retrieve_event_stream_selection,
                           :ems_controller                  => controller_name,
                           :default_auth_status             => default_auth_status,
                           :amqp_auth_status                => amqp_auth_status,
                           :ssh_keypair_auth_status         => ssh_keypair_auth_status.nil? ? true : ssh_keypair_auth_status,
                           :service_account_auth_status     => service_account_auth_status,
                           :non_default_current_tab         => @ems.emstype == "gce" ? "service_account" : nil,
                           :amqp_fallback_hostname1         => amqp_fallback_hostname1 || "",
                           :amqp_fallback_hostname2         => amqp_fallback_hostname2 || "",
                           :default_url                     => @ems.endpoints.first.url,
                           :assume_role                     => assume_role}
        end

        if controller_name == "ems_infra"
          render :json => { :name                          => @ems.name,
                            :emstype                       => @ems.emstype,
                            :zone                          => zone,
                            :zone_hidden                   => zone == MiqRegion.my_region.maintenance_zone.name,
                            :provider_id                   => @ems.provider_id || "",
                            :default_hostname              => @ems.connection_configurations.default.endpoint.hostname,
                            :amqp_hostname                 => amqp_hostname,
                            :console_userid                => console_userid,
                            :metrics_hostname              => metrics_hostname,
                            :metrics_database_name         => metrics_database_name,
                            :metrics_default_database_name => metrics_default_database_name,
                            :default_api_port              => default_api_port || "",
                            :amqp_api_port                 => amqp_port || "",
                            :metrics_api_port              => metrics_port || "",
                            :default_security_protocol     => default_security_protocol,
                            :amqp_security_protocol        => amqp_security_protocol,
                            :default_tls_verify            => default_tls_verify,
                            :default_tls_ca_certs          => default_tls_ca_certs,
                            :api_version                   => @ems.api_version || "v2",
                            :provider_region               => @ems.provider_region,
                            :default_userid                => @ems.authentication_userid.to_s,
                            :amqp_userid                   => amqp_userid,
                            :ssh_keypair_userid            => ssh_keypair_userid,
                            :metrics_userid                => metrics_userid,
                            :keystone_v3_domain_id         => keystone_v3_domain_id,
                            :emstype_vm                    => @ems.kind_of?(ManageIQ::Providers::Vmware::InfraManager),
                            :host_default_vnc_port_start   => host_default_vnc_port_start || "",
                            :host_default_vnc_port_end     => host_default_vnc_port_end || "",
                            :event_stream_selection        => retrieve_event_stream_selection,
                            :ems_controller                => controller_name,
                            :default_auth_status           => default_auth_status,
                            :console_auth_status           => console_auth_status,
                            :metrics_auth_status           => metrics_auth_status.nil? ? true : metrics_auth_status,
                            :ssh_keypair_auth_status       => ssh_keypair_auth_status.nil? ? true : ssh_keypair_auth_status,
                            :non_default_current_tab       => @ems.emstype == "kubevirt" ? "kubevirt" : nil,
                            :kubevirt_api_port             => kubevirt_api_port,
                            :kubevirt_hostname             => kubevirt_hostname,
                            :kubevirt_security_protocol    => kubevirt_security_protocol,
                            :kubevirt_tls_verify           => kubevirt_tls_verify,
                            :kubevirt_tls_ca_certs         => kubevirt_tls_ca_certs,
                            :kubevirt_auth_status          => kubevirt_auth_status,
                            :kubevirt_password             => kubevirt_password,
                            :kubevirt_password_exists      => !@ems.authentication_token(:kubevirt).nil?}
        end

        if controller_name == "ems_container"
          render :json => {:name                                => @ems.name,
                           :emstype                             => @ems.emstype,
                           :zone                                => zone,
                           :zone_hidden                         => zone == MiqRegion.my_region.maintenance_zone.name,
                           :hostname                            => @ems.hostname,
                           :default_hostname                    => @ems.connection_configurations.default.endpoint.hostname,
                           :default_api_port                    => @ems.connection_configurations.default.endpoint.port,
                           :metrics_selection                   => retrieve_metrics_selection,
                           :metrics_selection_default           => @ems.emstype == 'kubernetes' ? 'disabled' : 'enabled',
                           :metrics_hostname                    => metrics_hostname,
                           :metrics_api_port                    => metrics_port,
                           :metrics_tls_ca_certs                => metrics_tls_ca_certs,
                           :metrics_security_protocol           => metrics_security_protocol,
                           :api_version                         => @ems.api_version || "v2",
                           :default_security_protocol           => default_security_protocol,
                           :default_tls_ca_certs                => default_tls_ca_certs,
                           :provider_region                     => @ems.provider_region,
                           :default_userid                      => @ems.authentication_userid.to_s,
                           :service_account                     => service_account.to_s,
                           :bearer_token_exists                 => !@ems.authentication_token(:bearer).nil?,
                           :ems_controller                      => controller_name,
                           :default_auth_status                 => default_auth_status,
                           :metrics_auth_status                 => metrics_auth_status.nil? ? false : metrics_auth_status,
                           :prometheus_alerts_api_port          => prometheus_alerts_api_port,
                           :prometheus_alerts_hostname          => prometheus_alerts_hostname,
                           :prometheus_alerts_security_protocol => prometheus_alerts_security_protocol,
                           :prometheus_alerts_tls_ca_certs      => prometheus_alerts_tls_ca_certs,
                           :prometheus_alerts_auth_status       => prometheus_alerts_auth_status,
                           :provider_options                    => provider_options,
                           :alerts_selection                    => retrieve_alerts_selection,
                           :kubevirt_api_port                   => kubevirt_api_port,
                           :kubevirt_hostname                   => kubevirt_hostname,
                           :kubevirt_security_protocol          => kubevirt_security_protocol,
                           :kubevirt_tls_verify                 => kubevirt_tls_verify,
                           :kubevirt_tls_ca_certs               => kubevirt_tls_ca_certs,
                           :kubevirt_auth_status                => kubevirt_auth_status,
                           :kubevirt_password                   => kubevirt_password,
                           :kubevirt_password_exists            => !@ems.authentication_token(:kubevirt).nil?,
                           :virtualization_selection            => retrieve_virtualization_selection}
        end

        if controller_name == "ems_middleware"
          render :json => {:name                      => @ems.name,
                           :emstype                   => @ems.emstype,
                           :zone                      => zone,
                           :default_hostname          => @ems.connection_configurations.default.endpoint.hostname,
                           :default_api_port          => @ems.connection_configurations.default.endpoint.port,
                           :default_userid            => @ems.authentication_userid.to_s,
                           :default_security_protocol => default_security_protocol,
                           :default_tls_ca_certs      => default_tls_ca_certs,
                           :ems_controller            => controller_name,
                           :default_auth_status       => default_auth_status}
        end
      end

      private

      def metrics_default_database_name
        if @ems.class.name == 'ManageIQ::Providers::Redhat::InfraManager'
          ManageIQ::Providers::Redhat::InfraManager.default_history_database_name
        end
      end

      def security_protocol_default
        case controller_name
        when "ems_container" then "ssl-with-validation"
        when "ems_middleware" then "non-ssl"
        else "ssl"
        end
      end

      def table_name
        self.class.table_name
      end

      def set_ems_record_vars(ems, mode = nil)
        ems.name                   = params[:name].strip if params[:name]
        ems.provider_region        = params[:provider_region] if params[:provider_region]
        ems.api_version            = params[:api_version].strip if params[:api_version]
        ems.provider_id            = params[:provider_id]
        ems.zone                   = Zone.find_by(:name => params[:zone]) if params[:zone]
        ems.tenant_mapping_enabled = params[:tenant_mapping_enabled] == "on" if ems.class.supports_cloud_tenant_mapping?
        ems.security_protocol      = params[:default_security_protocol].strip if params[:default_security_protocol]

        hostname = params[:default_hostname].strip if params[:default_hostname]
        port = params[:default_api_port].strip if params[:default_api_port]
        amqp_hostname = params[:amqp_hostname].strip if params[:amqp_hostname]
        amqp_fallback_hostname1 = params[:amqp_fallback_hostname1].strip if params[:amqp_fallback_hostname1]
        amqp_fallback_hostname2 = params[:amqp_fallback_hostname2].strip if params[:amqp_fallback_hostname2]
        amqp_port = params[:amqp_api_port].strip if params[:amqp_api_port]
        amqp_security_protocol = params[:amqp_security_protocol].strip if params[:amqp_security_protocol]
        metrics_hostname = params[:metrics_hostname].strip if params[:metrics_hostname]
        metrics_port = params[:metrics_api_port].strip if params[:metrics_api_port]
        metrics_database_name = params[:metrics_database_name].strip if params[:metrics_database_name]
        metrics_security_protocol = params[:metrics_security_protocol].strip if params[:metrics_security_protocol]
        metrics_tls_ca_certs = params[:metrics_tls_ca_certs].strip if params[:metrics_tls_ca_certs]
        default_tls_ca_certs = params[:default_tls_ca_certs].strip if params[:default_tls_ca_certs]
        prometheus_alerts_tls_ca_certs = params[:prometheus_alerts_tls_ca_certs].strip if params[:prometheus_alerts_tls_ca_certs]
        prometheus_alerts_hostname = params[:prometheus_alerts_hostname].strip if params[:prometheus_alerts_hostname]
        prometheus_alerts_api_port = params[:prometheus_alerts_api_port].strip if params[:prometheus_alerts_api_port]
        prometheus_alerts_security_protocol = params[:prometheus_alerts_security_protocol].strip if params[:prometheus_alerts_security_protocol]
        kubevirt_tls_ca_certs = params[:kubevirt_tls_ca_certs].strip if params[:kubevirt_tls_ca_certs]
        kubevirt_hostname = params[:kubevirt_hostname].strip if params[:kubevirt_hostname]
        kubevirt_api_port = params[:kubevirt_api_port].strip if params[:kubevirt_api_port]
        kubevirt_security_protocol = ems.security_protocol
        default_endpoint = {}
        amqp_endpoint = {}
        amqp_fallback_endpoint1 = {}
        amqp_fallback_endpoint2 = {}
        ceilometer_endpoint = {}
        ssh_keypair_endpoint = {}
        metrics_endpoint = {}
        hawkular_endpoint = {}
        prometheus_endpoint = {}
        prometheus_alerts_endpoint = {}
        kubevirt_endpoint = {}

        if ems.kind_of?(ManageIQ::Providers::Openstack::CloudManager) || ems.kind_of?(ManageIQ::Providers::Openstack::InfraManager)
          default_endpoint = {:role => :default, :hostname => hostname, :port => port, :security_protocol => ems.security_protocol}
          ems.keystone_v3_domain_id = params[:keystone_v3_domain_id]
          if params[:event_stream_selection] == "amqp"
            amqp_endpoint = {:role => :amqp, :hostname => amqp_hostname, :port => amqp_port, :security_protocol => amqp_security_protocol}
          else
            ceilometer_endpoint = {:role => :ceilometer}
          end
        end

        if ems.kind_of?(ManageIQ::Providers::Openstack::CloudManager) || ems.kind_of?(ManageIQ::Providers::Openstack::InfraManager) || ems.kind_of?(ManageIQ::Providers::Redhat::InfraManager)
          ssh_keypair_endpoint = {:role => :ssh_keypair}
        end

        if ems.kind_of?(ManageIQ::Providers::Redhat::InfraManager)
          default_endpoint = {
            :role                  => :default,
            :hostname              => hostname,
            :port                  => port,
            :security_protocol     => ems.security_protocol,
            :verify_ssl            => params[:default_tls_verify] == 'on' ? OpenSSL::SSL::VERIFY_PEER : OpenSSL::SSL::VERIFY_NONE,
            :certificate_authority => params[:default_tls_ca_certs],
          }
          metrics_endpoint = { :role     => :metrics,
                               :hostname => metrics_hostname,
                               :port     => metrics_port,
                               :path     => metrics_database_name }
        end

        if ems.kind_of?(ManageIQ::Providers::Kubevirt::InfraManager)
          kubevirt_endpoint = {
            :role     => :kubevirt,
            :hostname => kubevirt_hostname,
            :port     => kubevirt_api_port,
          }

          kubevirt_endpoint.merge!(endpoint_security_options(kubevirt_security_protocol, kubevirt_tls_ca_certs))
        end

        if ems.kind_of?(ManageIQ::Providers::Google::CloudManager)
          ems.project = params[:project]
        end

        if ems.kind_of?(ManageIQ::Providers::Microsoft::InfraManager)
          default_endpoint = {:role => :default, :hostname => hostname, :security_protocol => ems.security_protocol}
          ems.realm = params[:realm]
        end

        if ems.kind_of?(ManageIQ::Providers::Vmware::InfraManager)
          default_endpoint = {:role => :default, :hostname => hostname}
          ems.host_default_vnc_port_start = params[:host_default_vnc_port_start].blank? ? nil : params[:host_default_vnc_port_start].to_i
          ems.host_default_vnc_port_end = params[:host_default_vnc_port_end].blank? ? nil : params[:host_default_vnc_port_end].to_i
        end

        if ems.kind_of?(ManageIQ::Providers::Vmware::CloudManager)
          default_endpoint = {:role => :default, :hostname => hostname, :port => port}
          if params[:event_stream_selection] == "amqp"
            amqp_endpoint = {:role => :amqp, :hostname => amqp_hostname, :port => amqp_port, :security_protocol => amqp_security_protocol}
          end
        end

        if ems.kind_of?(ManageIQ::Providers::Azure::CloudManager)
          ems.azure_tenant_id = params[:azure_tenant_id]
          ems.subscription    = params[:subscription] if params[:subscription].present?
          uri = URI.parse(WEBrick::HTTPUtils.escape(params[:default_url]))
          default_endpoint = {:role => :default, :hostname => uri.host, :port => uri.port, :path => uri.path, :url => params[:default_url]}
        end

        if ems.kind_of?(ManageIQ::Providers::AzureStack::CloudManager)
          ems.azure_tenant_id = params[:azure_tenant_id]
          ems.subscription    = params[:subscription] if params[:subscription].present?
          default_endpoint = {:role => :default, :hostname => hostname, :port => port, :security_protocol => ems.security_protocol}
        end

        if ems.kind_of?(ManageIQ::Providers::ContainerManager)
          params[:cred_type] = ems.default_authentication_type if params[:cred_type] == "default"
          default_endpoint = {:role => :default, :hostname => hostname, :port => port}
          default_endpoint.merge!(endpoint_security_options(ems.security_protocol, default_tls_ca_certs))
          if params[:metrics_selection] == 'hawkular'
            params[:cred_type] = "hawkular" if params[:cred_type] == "metrics"
            hawkular_endpoint = {:role => :hawkular, :hostname => metrics_hostname, :port => metrics_port}
            hawkular_endpoint.merge!(endpoint_security_options(metrics_security_protocol, metrics_tls_ca_certs))
          elsif params[:metrics_selection] == 'prometheus'
            params[:cred_type] = "prometheus" if params[:cred_type] == "metrics"
            prometheus_endpoint = {:role => :prometheus, :hostname => metrics_hostname, :port => metrics_port}
            prometheus_endpoint.merge!(endpoint_security_options(metrics_security_protocol, metrics_tls_ca_certs))
          end

          if params[:alerts_selection] == 'prometheus'
            prometheus_alerts_endpoint = {:role => :prometheus_alerts, :hostname => prometheus_alerts_hostname, :port => prometheus_alerts_api_port}
            prometheus_alerts_endpoint.merge!(endpoint_security_options(prometheus_alerts_security_protocol, prometheus_alerts_tls_ca_certs))
          end

          if params[:virtualization_selection] == 'kubevirt'
            kubevirt_endpoint = {:role => :kubevirt, :hostname => kubevirt_hostname, :port => kubevirt_api_port}
            kubevirt_endpoint.merge!(endpoint_security_options(kubevirt_security_protocol, kubevirt_tls_ca_certs))
          end
        end

        if ems.kind_of?(ManageIQ::Providers::Nuage::NetworkManager)
          default_endpoint = {:role => :default, :hostname => hostname, :port => port, :security_protocol => ems.security_protocol}
          amqp_endpoint = {:role => :amqp, :hostname => amqp_hostname, :port => amqp_port, :security_protocol => amqp_security_protocol}
          amqp_fallback_endpoint1 = {:role => :amqp_fallback1, :hostname => amqp_fallback_hostname1, :port => amqp_port, :security_protocol => amqp_security_protocol} if amqp_fallback_hostname1.present?
          amqp_fallback_endpoint2 = {:role => :amqp_fallback2, :hostname => amqp_fallback_hostname2, :port => amqp_port, :security_protocol => amqp_security_protocol} if amqp_fallback_hostname2.present?
        end

        if ems.kind_of?(ManageIQ::Providers::Lenovo::PhysicalInfraManager)
          default_endpoint = {:role => :default, :hostname => hostname, :port => port}
        end

        if ems.kind_of?(ManageIQ::Providers::Amazon::CloudManager)
          uri = URI.parse(WEBrick::HTTPUtils.escape(params[:default_url]))
          default_endpoint = {:role => :default, :hostname => uri.host, :port => uri.port, :path => uri.path, :url => params[:default_url]}
        end

        if ems.kind_of?(ManageIQ::Providers::Redfish::PhysicalInfraManager)
          default_endpoint = {
            :role              => :default,
            :hostname          => hostname,
            :port              => port,
            :security_protocol => ems.security_protocol
          }
        end

        new_options = {}
        if ems.class.respond_to?(:advanced_settings)
          ems.class.advanced_settings.each do |section_name, section|
            section[:settings].each_key do |opt|
              new_options[section_name.to_sym] ||= {}
              value = params["provider_options_#{section_name}_#{opt}".to_sym]
              new_options[section_name.to_sym][opt.to_sym] = value if value.present?
            end
          end
        end
        if ems.class.respond_to?(:proxy_settings)
          new_options[:proxy_settings] = {}
          ems.class.proxy_settings.each_key do |opt|
            value = params["provider_options_proxy_settings_#{opt}".to_sym]
            new_options[:proxy_settings][opt] = value if value.present?
          end
        end
        ems.options = new_options

        endpoints = {:default           => default_endpoint,
                     :ceilometer        => ceilometer_endpoint,
                     :amqp              => amqp_endpoint,
                     :console           => default_endpoint,
                     :smartstate_docker => default_endpoint,
                     :amqp_fallback1    => amqp_fallback_endpoint1,
                     :amqp_fallback2    => amqp_fallback_endpoint2,
                     :ssh_keypair       => ssh_keypair_endpoint,
                     :metrics           => metrics_endpoint,
                     :hawkular          => hawkular_endpoint,
                     :prometheus        => prometheus_endpoint,
                     :prometheus_alerts => prometheus_alerts_endpoint,
                     :kubevirt          => kubevirt_endpoint}

        build_connection(ems, endpoints, mode)
      end

      def endpoint_security_options(security_protocol, certificate_authority)
        {
          :security_protocol     => security_protocol,
          :verify_ssl            => %w[ssl-without-validation non-ssl].exclude?(security_protocol),
          :certificate_authority => security_protocol == 'ssl-with-validation-custom-ca' ? certificate_authority : nil
        }
      end

      def build_connection(ems, endpoints, mode)
        authentications = build_credentials(ems, mode)
        configurations = []

        %i[default ceilometer amqp amqp_fallback1 amqp_fallback2 console smartstate_docker ssh_keypair metrics hawkular prometheus prometheus_alerts kubevirt].each do |role|
          configurations << build_configuration(ems, authentications, endpoints, role)
        end

        ems.connection_configurations = configurations
      end

      def build_configuration(ems, authentications, endpoints, role)
        authtype = role == :default ? ems.default_authentication_type.to_sym : role
        return {:endpoint => endpoints[role], :authentication => nil} unless authentications[authtype]

        authentication = authentications.delete(authtype)
        authentication[:role] = authtype.to_s
        authentication[:authtype] = authtype.to_s
        {:endpoint => endpoints[role], :authentication => authentication}
      end

      def build_credentials(ems, mode)
        creds = {}
        if params[:default_userid]
          default_password = params[:default_password] || ems.authentication_password
          creds[:default] = {:userid => params[:default_userid], :password => default_password, :save => (mode != :validate)}
        end
        if ems.supports_authentication?(:amqp) && params[:amqp_userid]
          amqp_password = params[:amqp_password] || ems.authentication_password(:amqp)
          creds[:amqp] = {:userid => params[:amqp_userid], :password => amqp_password, :save => (mode != :validate)}
        end
        if ems.kind_of?(ManageIQ::Providers::Vmware::InfraManager) &&
           ems.supports_authentication?(:console) && params[:console_userid]
          console_password = params[:console_password] || ems.authentication_password(:console)
          creds[:console] = {:userid => params[:console_userid], :password => console_password, :save => (mode != :validate)} # FIXME: skateman was here
        end
        if ems.kind_of?(ManageIQ::Providers::Amazon::CloudManager) &&
           ems.supports_authentication?(:smartstate_docker) && params[:smartstate_docker_userid]
          smartstate_docker_password = params[:smartstate_docker_password] || ems.authentication_password(:smartstate_docker)
          creds[:smartstate_docker] = {:userid => params[:smartstate_docker_userid], :password => smartstate_docker_password, :save => true}
        end
        if ems.supports?(:assume_role)
          (creds[:default] ||= {})[:service_account] = params[:default_assume_role]
        end
        if (ems.kind_of?(ManageIQ::Providers::Openstack::InfraManager) ||
            ems.kind_of?(ManageIQ::Providers::Openstack::CloudManager) ||
            ems.kind_of?(ManageIQ::Providers::Redhat::InfraManager)) &&
           ems.supports_authentication?(:ssh_keypair) && params[:ssh_keypair_userid]
          ssh_keypair_password = params[:ssh_keypair_password] ? params[:ssh_keypair_password].gsub(/\r\n/, "\n") : ems.authentication_key(:ssh_keypair)
          creds[:ssh_keypair] = {:userid => params[:ssh_keypair_userid], :auth_key => ssh_keypair_password, :save => (mode != :validate)}
        end
        if ems.kind_of?(ManageIQ::Providers::Redhat::InfraManager) &&
           ems.supports_authentication?(:metrics) && params[:metrics_userid]
          metrics_password = params[:metrics_password] || ems.authentication_password(:metrics)
          creds[:metrics] = {:userid => params[:metrics_userid], :password => metrics_password, :save => (mode != :validate)}
        end
        if ems.kind_of?(ManageIQ::Providers::Kubevirt::InfraManager)
          creds[:kubevirt] = {
            :auth_key => params[:kubevirt_password] || ems.authentication_token(:kubevirt),
            :save     => mode != :validate,
          }
        end
        if ems.supports_authentication?(:auth_key) && params[:service_account]
          creds[:default] = {:auth_key => params[:service_account], :userid => "_", :save => (mode != :validate)}
        end
        if ems.supports_authentication?(:oauth) && session[:oauth_response].present?
          auth = session[:oauth_response]
          credentials = auth["credentials"]
          creds[:oauth] = {:refresh_token => credentials["refresh_token"],
                           :access_token  => credentials["access_token"],
                           :expires       => credentials["expires"],
                           :userid        => auth["info"]["name"],
                           :save          => (mode != :validate)}
          session[:oauth_response] = nil
        end
        if ems.kind_of?(ManageIQ::Providers::ContainerManager)
          default_key = params[:default_password] || ems.authentication_key
          if params[:metrics_selection] == "hawkular"
            creds[:hawkular] = {:auth_key => default_key, :save => (mode != :validate)}
          elsif params[:metrics_selection] == "prometheus"
            creds[:prometheus] = {:auth_key => default_key, :save => (mode != :validate)}
          end
          if params[:alerts_selection] == 'prometheus'
            creds[:prometheus_alerts] = {:auth_key => default_key, :save => (mode != :validate)}
          end
          if params[:virtualization_selection] == 'kubevirt'
            kubevirt_key = params[:kubevirt_password] || ems.authentication_key(:kubevirt)
            creds[:kubevirt] = { :auth_key => kubevirt_key, :save => (mode != :validate) }
          end
          creds[:bearer] = {:auth_key => default_key, :save => (mode != :validate)}
          creds.delete(:default)
        end
        creds
      end

      def retrieve_event_stream_selection
        return 'amqp' if @ems.connection_configurations.amqp&.endpoint&.hostname&.present?
        return 'ceilometer' if @ems.connection_configurations.ceilometer&.endpoint&.hostname&.present?

        @ems.kind_of?(ManageIQ::Providers::Openstack::CloudManager) || @ems.kind_of?(ManageIQ::Providers::Openstack::InfraManager) ? 'ceilometer' : 'none'
      end

      def construct_edit_for_audit(ems)
        @edit ||= {}
        azure_tenant_id = ems.kind_of?(ManageIQ::Providers::Azure::CloudManager) ? ems.azure_tenant_id : nil
        @edit[:current] = {
          :name                  => ems.name,
          :provider_region       => ems.provider_region,
          :hostname              => ems.hostname,
          :azure_tenant_id       => azure_tenant_id,
          :keystone_v3_domain_id => ems.respond_to?(:keystone_v3_domain_id) ? ems.keystone_v3_domain_id : nil,
          :subscription          => ems.subscription,
          :port                  => ems.port,
          :api_version           => ems.api_version,
          :security_protocol     => ems.security_protocol,
          :provider_id           => ems.provider_id,
          :zone                  => ems.zone
        }

        @edit[:current][:tenant_mapping_enabled] = ems.tenant_mapping_enabled if ems.class.supports_cloud_tenant_mapping?

        @edit[:new] = {:name                  => params[:name],
                       :provider_region       => params[:provider_region],
                       :hostname              => params[:hostname],
                       :azure_tenant_id       => params[:azure_tenant_id],
                       :keystone_v3_domain_id => params[:keystone_v3_domain_id],
                       :port                  => params[:port],
                       :api_version           => params[:api_version],
                       :security_protocol     => params[:default_security_protocol],
                       :provider_id           => params[:provider_id],
                       :zone                  => params[:zone]}

        @edit[:new][:tenant_mapping_enabled] = params[:tenant_mapping_enabled] if ems.class.supports_cloud_tenant_mapping?
      end

      def zone
        if @ems.zone.nil? || @ems.my_zone == ""
          "default"
        else
          @ems.my_zone
        end
      end

      def default_auth_status
        @ems.authentication_status_ok? unless @ems.kind_of?(ManageIQ::Providers::Google::CloudManager)
      end
    end
  end
end
