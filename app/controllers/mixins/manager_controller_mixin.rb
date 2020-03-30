module Mixins
  module ManagerControllerMixin
    extend ActiveSupport::Concern

    included do
      include Mixins::GenericFormMixin
      include Mixins::FindRecord
    end

    def find_or_build_provider
      @provider = provider_class.new if params[:id] == "new"
      @provider ||= find_record(self.class.model, params[:id]).provider
    end

    def add_provider
      find_or_build_provider
      sync_form_to_instance
      update_authentication_provider(:save)
    end

    def update_authentication_provider(mode = :validate)
      @provider.update_authentication(build_credentials, :save => mode == :save)
    end

    def build_credentials
      return {} unless params[:default_userid]

      {
        :default => {
          :userid   => params[:default_userid],
          :password => params[:default_password] || @provider.authentication_password
        }
      }
    end

    def save_provider
      if @provider.save
        construct_edit_for_audit
        AuditEvent.success(build_created_audit(@provider, @edit))
        @in_a_form = false
        @sb[:action] = nil
        model = "#{self.class.model_to_name(@provider.type)} #{_('Provider')}"
        if params[:id] == "new"
          add_flash(_("%{model} \"%{name}\" was added") % {:model => model, :name => @provider.name})
          process_managers([@provider.instance_eval(manager_prefix).id], "refresh_ems")
        else
          add_flash(_("%{model} \"%{name}\" was updated") % {:model => model, :name => @provider.name})
        end
        @explorer ? replace_right_cell(:replace_trees => [x_active_accord]) : javascript_redirect(:action => @lastaction, :id => params[:id])
      else
        @provider.errors.each do |field, msg|
          @sb[:action] = nil
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        render_flash
      end
    end

    def cancel_provider
      @in_a_form = false
      @sb[:action] = nil
      if params[:id] == "new"
        flash_to_session(_("Add of Provider was cancelled by the user"))
      else
        flash_to_session(_("Edit of Provider was cancelled by the user"))
      end
      @explorer ? replace_right_cell : javascript_redirect(:action => @lastaction, :id => params[:id])
    end

    def authentication_validate
      find_or_build_provider
      sync_form_to_instance
      update_authentication_provider

      begin
        @provider.verify_credentials(params[:type])
      rescue => error
        msg = _("Credential validation was not successful: %{details}") % {:details => error}
        level = :error
      else
        msg = _("Credential validation was successful")
      end

      render_flash_json(msg, level)
    end

    def new
      assert_privileges("#{privilege_prefix}_add_provider")
      @explorer = true if explorer_controller?
      @provider_manager = concrete_model.new
      @server_zones = Zone.visible.in_my_region.order(Zone.arel_table[:name].lower).pluck(:description, :name)
      @sb[:action] = params[:action]
      if @explorer
        render_form
      else
        @in_a_form = true
        @redirect_controller = "configuration_manager"
        @refresh_partial = "new"
      end
    end

    def edit
      assert_privileges("#{privilege_prefix}_edit_provider")
      @explorer = true if explorer_controller?
      @server_zones = Zone.visible.in_my_region.order('lower(description)').pluck(:description, :name)
      @server_zones = Zone.visible.in_my_region.order(Zone.arel_table[:name].lower).pluck(:description, :name)
      case params[:button]
      when "cancel"
        cancel_provider
      when "save"
        add_provider
        save_provider
      else
        manager_id            = params[:miq_grid_checks] || params[:id] || find_checked_items[0]
        @provider_manager     = find_record(concrete_model, manager_id)
        @providerdisplay_type = self.class.model_to_name(@provider_manager.type)
        @sb[:action] = params[:action]
        if @explorer
          render_form
        else
          @in_a_form = true
          @redirect_controller = "configuration_manager"
          @redirect_id = @provider_manager.id
          @refresh_partial = "edit"
        end
      end
    end

    def refresh
      @explorer = true if explorer_controller?
      assert_privileges("#{privilege_prefix}_refresh_provider")
      manager_button_operation('refresh_ems', _('Refresh'))
      replace_right_cell if @explorer
    end

    def form_fields
      assert_privileges("#{privilege_prefix}_edit_provider")
      # set value of read only zone text box, when there is only single zone
      if params[:id] == "new"
        return render(:json => {:zone => Zone.visible.in_my_region.size >= 1 ? Zone.visible.in_my_region.first.name : nil})
      end

      manager = find_record(concrete_model, params[:id])
      provider = manager.provider

      render :json => {:name                => provider.name,
                       :zone                => provider.zone.name,
                       :zone_hidden         => !manager.enabled?,
                       :url                 => provider.url,
                       :verify_ssl          => provider.verify_ssl,
                       :default_userid      => provider.authentications.first.userid,
                       :default_auth_status => provider.authentication_status_ok?}
    end

    private

    def provision
      assert_privileges("configured_system_provision")
      provisioning_ids = find_records_with_rbac(ConfiguredSystem, checked_or_params).ids

      unless ConfiguredSystem.provisionable?(provisioning_ids)
        add_flash(_("Provisioning is not supported for at least one of the selected systems"), :error)
        replace_right_cell if explorer_controller?
        return
      end

      if ConfiguredSystem.common_configuration_profiles_for_selected_configured_systems(provisioning_ids)
        javascript_redirect(:controller     => "miq_request",
                            :action         => "prov_edit",
                            :prov_id        => provisioning_ids,
                            :org_controller => "configured_system",
                            :escape         => false)
      else
        render_flash(n_("No common configuration profiles available for the selected configured system",
                        "No common configuration profiles available for the selected configured systems",
                        provisioning_ids.size), :error)
      end
    end

    def sync_form_to_instance
      @provider.name       = params[:name]
      @provider.url        = params[:url]
      @provider.verify_ssl = params[:verify_ssl].eql?("on") || params[:verify_ssl].eql?("true")
      @provider.zone       = Zone.find_by(:name => params[:zone].to_s) if params[:zone]
    end
  end
end
