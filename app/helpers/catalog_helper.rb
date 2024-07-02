module CatalogHelper
  include TextualSummary
  include RequestInfoHelper
  include Mixins::AutomationMixin
  include OrchestrationTemplateHelper
  include OrderServiceHelper

  def miq_catalog_resource(resources)
    headers = ["", _("Name"), _("Description"), _("Action Order"), _("Provision Order"), _("Action Start"), _("Action Stop"), _("Delay (mins) Start"), _("Delay (mins) Stop")]
    data = {:rows => [], :headers => headers}
    prev_group = 0
    resources.sort_by { |rsc| [rsc.group_idx, rsc.resource_name.downcase] }.each_with_index do |r, i|
      if prev_group != r.group_idx && i < resources.length
        prev_group = r.group_idx
      end

      cells = []
      cells.push(:icon => "pficon pficon-template")
      keys = %w[resource_name resource_description group_idx provision_index start_action stop_action start_delay stop_delay]
      keys.each do |key|
        if %w[start_delay stop_delay].include?(key)
          cells.push({:text => r.send(key) / 60})
        else
          idx = %w[group_idx provision_index].include?(key) ? r.send(key).to_i + 1 : r.send(key)
          cells.push({:text => idx})
        end
      end
      row = {
        :id        => i.to_s,
        :title     => _("Click to this Catalog Item"),
        :onclick   => {
          :remote => true,
          :url    => "/catalog/x_show/#{r.resource_id}"
        },
        :cells     => cells,
        :clickable => true
      }
      data[:rows].push(row)
    end
    data
  end

  def service_catalog_summary(record, sb_data)
    data = {:title => _('Basic Info'), :mode => "miq_report_service_catalog_summary"}
    image = record.picture ? {:image => "#{record.picture.url_path}?#{rand(99_999_999)}"} : {:icon => "fa fa-cube fa-4x"}
    data[:rows] = [
      {:cells => image},
      row_data(_('Name'), record.name),
      row_data(_('Description'), record.description),
      row_data(_('Long Description'), {:input => 'markdown', :props => {:content => record.long_description}}),
      row_data(_('Dialog'), sb_data[:dialog_label]),
    ]
    if record.currency && record.price
      data[:rows].push(row_data(_('Price / Month (in %{currency})') % {:currency => record.currency.code}, record.price.to_s))
    end
    disable = !record.template_valid?
    action = disable ? {} : {:remote => true, :url => "/catalog/x_button/#{record.id}?pressed=svc_catalog_provision"}
    data[:rows].push({:cells => {:button => {:name => _("Order"), :action => action, :disabled => disable}}})
    miq_structured_list(data)
  end

  def catalog_tab_configuration(record)
    condition = catalog_tab_conditions(record)
    tab_labels = [:basic]
    tab_labels.push(:detail) if condition[:detail]

    if condition[:resource]
      tab_labels.push(:resource)
    elsif condition[:request]
      tab_labels.push(:request)
    end

    if condition[:provision]
      tab_labels.push(:provision)
      tab_labels.push(:retirement) if condition[:retirement]
    end

    return tab_labels, condition
  end

  def catalog_tab_edit_configuration(record)
    condition = catalog_tab_edit_conditions(record)
    tab_labels = [:basic]
    tab_labels.push(:detail) if condition[:detail]
    tab_labels.push(:resource) if condition[:resource]
    tab_labels.push(:request) if condition[:request]
    return tab_labels, condition
  end

  def catalog_tab_content(key_name, &block)
    if catalog_tabs_types.include?(key_name)
      class_name = key_name == :basic ? 'tab_content active' : 'tab_content'
      content_tag(:div, :id => key_name, :class => class_name, &block)
    end
  end

  def catalog_basic_information(record, sb_params, tenants_tree)
    prov_types = catalog_provision_types
    prov_data = [prov_types[:template], prov_types[:ovf]].include?(record.prov_type) && (catalog_provision?(record, :playbook) || catalog_provision?(record, :terraform_template)) ? provisioning : nil
    data = {:title => _('Basic Information'), :mode => "miq_catalog_basic_information"}
    rows = []
    rows.push(row_data(_('Name'), record.name))
    rows.push(row_data(_('Description'), record.description))
    rows.push(row_data(_('Display in Catalog'), {:input => "checkbox", :name => "display", :checked => record.display, :disabled => true, :label => ''}))
    rows.push(row_data(_('Catalog'), record.service_template_catalog ? record.service_template_catalog.name : _('Unassigned')))
    rows.push(row_data(_('Zone'), record.zone ? record.zone.name : '')) unless record.composite?
    rows.push(row_data(_('Dialog'), sb_params[:dialog_label])) unless catalog_provision?(record, :playbook) || catalog_provision?(record, :terraform_template)
    rows.push(row_data(_("Price / Month (in %{currency})") % {:currency => record.currency.code}, record.price)) if record.currency
    rows.push(row_data(_('Item Type'), _(ServiceTemplate.all_catalog_item_types[record.prov_type]))) if record.prov_type
    rows.push(row_data(_('Subtype'), _(ServiceTemplate::GENERIC_ITEM_SUBTYPES[record[:generic_subtype]]) || _("Custom"))) if catalog_provision?(record, :generic)

    if catalog_provision?(record, :orchestration)
      rows.push(row_data(_('Orchestration Template'), record.try(:orchestration_template).try(:name)))
      rows.push(row_data(_('Provider'), record.orchestration_manager.name)) if record.orchestration_manager
    elsif catalog_provision?(record, :tower)
      rows.push(row_data(_('Ansible Tower Template'), record.try(:job_template).try(:name)))
    elsif catalog_provision?(record, :template)
      rows.push(row_data(_('Provider'), provision_data(prov_data, :provider_name)))
      rows.push(row_data(_('Container Template'), provision_data(prov_data, :template_name)))
    end

    unless catalog_provision?(record, :playbook) || catalog_provision?(record, :terraform_template)
      entry_points = [[_("Provisioning"), :fqname]]
      unless record.prov_type.try(:start_with?, "generic_")
        entry_points.push([_("Reconfigure"), :reconfigure_fqname], [_("Retirement"), :retire_fqname])
      end
      entry_points.each do |entry_points_op|
        rows.push(row_data("#{entry_points_op[0]} %s" % _('Entry Point'), sb_params[entry_points_op[1]]))
      end
    end

    rows.push(row_data(_('Tenant'), record.tenant.name)) if User.current_user.super_admin_user?
    rows.push(row_data(_('Owner'), record.try(:evm_owner).try(:name)))
    rows.push(row_data(_('Ownership Group'), record.try(:miq_group).try(:name)))
    rows.push(row_data(_('Additional Tenants'), {:input => 'component', :component => 'TREE_VIEW_REDUX', :props => tenants_tree.locals_for_render})) if role_allows?(:feature => 'rbac_tenant_view')

    if catalog_provision?(record, :ovf)
      options = record.config_info[:provision]
      rows.push(row_data(_('OVF Template'), provision_data(prov_data, :ovf_template_name)))
      rows.push(row_data(_('VM Name'), options[:vm_name]))
      rows.push(row_data(_('Accept EULA'), {:input => "checkbox", :name => "accept_ecula", :checked => options[:accept_all_eula], :disabled => true, :label => ''}))
      rows.push(row_data(_('Datacenter'), provision_data(prov_data, :datacenter_name)))
      rows.push(row_data(_('Resource Pool'), provision_data(prov_data, :resource_pool_name)))
      rows.push(row_data(_('Folder'), provision_data(prov_data, :ems_folder_name)))
      rows.push(row_data(_('Host'), provision_data(prov_data, :host_name)))
      rows.push(row_data(_('Storage'), provision_data(prov_data, :storage_name)))
      rows.push(row_data(_('Disk Format'), provision_data(prov_data, :disk_format)))
      rows.push(row_data(_('Virtual Network'), provision_data(prov_data, :network_name)))
    end

    data[:rows] = rows
    miq_structured_list(data)
  end

  def catalog_smart_management(record)
    smart_mgnt = textual_tags_render_data(record)
    data = {:title => smart_mgnt[:title], :mode => "miq_catalog-smart_management"}
    rows = []
    smart_mgnt[:items].each do |item|
      row = row_data(item[:label], item[:value])
      row[:cells][:icon] = item[:icon] if item[:icon]
      rows.push(row)
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def catalog_custom_image(record)
    picture = record.picture ? "#{record.picture.url_path}?#{rand(99_999_999)}" : nil
    data = {:title => _('Custom Image'), :mode => "miq_catalog_custom_image"}
    data[:rows] = [row_data('', {:input => 'component', :component => 'CATALOG_CUSTOM_IMAGE', :props => {:recordId => record.id, :image => picture}})]
    miq_structured_list(data)
  end

  def catalog_details(record)
    data = {:title => _('Long Description'), :mode => "miq_catalog_details"}
    data[:rows] = [row_data('', {:input => 'markdown', :props => {:content => record.long_description}})]
    miq_structured_list(data)
  end

  def catalog_resources(record)
    resources = record.service_resources
    data = {:title => _('Resources'), :mode => "miq_catalog_resources"}
    data[:rows] = [row_data('', {:input => 'component', :component => 'CATALOG_RESOURCE', :props => {:initialData => miq_catalog_resource(resources)}})]
    miq_structured_list(data)
  end

  def catalog_generic_template_info(type, record, info)
    list_type = type == :provision ? 'provisioning' : 'retirement'
    data = {:title => "#{list_type.camelize} %s" % _('Info'), :mode => "miq_catalog_playbook_info"}
    rows = []
    rows.push(row_data(_('Repository'), info[:repository]))
    if record.type == 'ServiceTemplateAnsiblePlaybook'
      rows.push(row_data(_('Playbook'), info[:playbook]))
      rows.push(row_data(_('Machine Credential'), info[:machine_credential]))
      rows.push(row_data(_('Vault Credential'), info[:vault_credential]))
      rows.push(row_data(_('Cloud Credential'), info[:cloud_credential]))
      rows.push(row_data(_('Max TTL (mins)'), record.config_info[type][:execution_ttl]))
      rows.push(row_data(_('Hosts'), record.config_info[type][:hosts]))
      rows.push(row_data(_('Logging Output'), ViewHelper::LOG_OUTPUT_LEVELS[info[:log_output]]))
      rows.push(row_data(_('Escalate Privilege'), info[:become_enabled]))
      rows.push(row_data(_('Verbosity'), _(ViewHelper::VERBOSITY_LEVELS[info[:verbosity]])))
    else
      rows.push(row_data(_('Template'), info[:template]))
      rows.push(row_data(_('Credential'), info[:credential]))
      rows.push(row_data(_('Max TTL (mins)'), record.config_info[type][:execution_ttl]))
      rows.push(row_data(_('Logging Output'), ViewHelper::LOG_OUTPUT_LEVELS[info[:log_output]]))
      rows.push(row_data(_('Escalate Privilege'), info[:become_enabled]))
      rows.push(row_data(_('Verbosity'), _(ViewHelper::VERBOSITY_LEVELS[info[:verbosity]])))
      data[:rows] = rows
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def catalog_variables_default_data(type, record)
    data = {:title => _("Variables & Default Values"), :mode => "miq_catalog_variable_data"}
    data[:headers] = [_("Variable"), _("Default value")]
    rows = []
    extra_vars = record.config_info[type][:extra_vars]
    if extra_vars
      extra_vars.each do |key, value|
        rows.push({:cells => [{:value => h(key)}, {:value => h(value[:default])}]})
      end
    else
      data[:message] = _("No variables & default values available")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def catalog_dialog(provisioning)
    rows = []
    data = {:title => _("Dialog"), :mode => "miq_catalog_dialog"}
    if provisioning[:dialog_id]
      if role_allows?(:feature => "dialog_accord", :any => true)
        rows.push({
                    :cells   => [{:value => provisioning[:dialog]}],
                    :title   => provisioning[:dialog],
                    :onclick => {:url => "/miq_ae_customization/show/dg-#{provisioning[:dialog_id]}"},
                  })
      else
        rows.push(row_data('', provisioning[:dialog]))
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def catalog_provision_types
    {:generic            => "generic",
     :orchestration      => "generic_orchestration",
     :ovf                => "generic_ovf_template",
     :playbook           => "generic_ansible_playbook",
     :terraform_template => "generic_terraform_template",
     :tower              => "generic_ansible_tower",
     :template           => "generic_container_template"}.freeze
  end

  private

  def catalog_tabs_types
    [:basic, :detail, :resource, :request, :provision, :retirement]
  end

  def catalog_tab_conditions(record)
    {
      :detail     => record.display && !record.prov_type.try(:start_with?, "generic_"),
      :resource   => record.composite?,
      :request    => !record.prov_type || (record.prov_type && need_prov_dialogs?(record.prov_type)),
      :provision  => record.prov_type == catalog_provision_types[:playbook] || record.prov_type == catalog_provision_types[:terraform_template],
      :retirement => record.prov_type == catalog_provision_types[:terraform_template] ? nil : record.config_info.fetch_path(:retirement)
    }
  end

  def catalog_tab_edit_conditions(record)
    resource = request = false
    detail = !!record[:display]
    unless record[:st_prov_type].try(:start_with?, "generic_")
      if record[:service_type] == "composite"
        resource = true
      elsif record[:service_type] == "atomic" && need_prov_dialogs?(record[:st_prov_type])
        request = true
      end
    end
    {:detail => detail, :resource => resource, :request => request}
  end

  def provision_data(data, type)
    data && data[type]
  end

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end

  def catalog_provision?(record, type)
    record.prov_type == catalog_provision_types[type]
  end

  # Method which return true if workflows are behing prototype flag.
  # Hides the Embedded Workflow option.
  def workflows_enabled
    Settings.prototype.ems_workflows.enabled
  end
end
