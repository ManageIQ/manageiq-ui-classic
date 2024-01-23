module RequestInfoTabsHelper::RequestInfoServiceHelper
  SERVICE_KEYS = {
    :selected_vms  => [:src_vm_id, :provision_type, :linked_clone, :seal_template],
    :select        => [:vm_filter, :src_vm_id, :provision_type, :linked_clone, :snapshot],
    :supports_pxe  => [:pxe_server_id, :pxe_image_id, :windows_image_id],
    :supports_iso  => [:iso_image_id],
    :number_of_vms => [:number_of_vms],
    :naming        => [:vm_name, :vm_description, :vm_prefix],
  }.freeze

  REQUEST_KEYS = {
    :request_information => [
      :owner_email, :owner_first_name, :owner_last_name, :owner_address, :owner_city, :owner_state, :owner_zip, :owner_country, :owner_title, :owner_company, :owner_department, :owner_office, :owner_phone, :owner_phone_mobile, :request_notes
    ],
    :manager             => [:owner_manager, :owner_manager_mail, :owner_manager_phone],
  }.freeze

  PURPOSE_KEYS = {
    :tags => [:vm_tags],
  }.freeze

  # VOLUME_KEYS = {
  #   workflow.volume_dialog_keys
  # }

  NETWORK_KEYS = {
    :network_adapter => [:vlan, :mac_address, :public_network],
  }.freeze

  CUSTOMIZE_KEYS = {
    :compute_details        => [:sysprep_admin_password, :sysprep_computer_name, :sysprep_organization, :sysprep_product_key],
    :credentials            => [:root_password, :root_username],
    :customize_template     => [:customization_template_id],
    :custom_specification   => [:sysprep_custom_spec, :sysprep_spec_override],
    :custom_specification_2 => [:sysprep_custom_spec],
    :dns                    => [:dns_servers, :dns_suffixes],
    :domain_information     => [:sysprep_domain, :sysprep_domain_admin, :sysprep_domain_password, :sysprep_machine_object_ou],
    :domain_information_2   => [:sysprep_domain_admin, :sysprep_domain_name, :sysprep_domain_password],
    :identification         => [:sysprep_identification],
    :ip_address             => [:addr_mode, :gateway, :hostname, :ip_addr, :subnet_mask],
    :ip_address_2           => [:addr_mode, :gateway, :ip_addr, :subnet_mask],
    :localization           => [:sysprep_locale_input, :sysprep_locale_system, :sysprep_locale_ui, :sysprep_timezone],
    :naming                 => [:linux_domain_name, :linux_host_name],
    :others                 => [:migratable, :pin_policy],
    :placement_group        => [:placement_group],
    :selected_template      => [:customization_template_script],
    :server_licences        => [:sysprep_per_server_max_connections, :sysprep_server_license_mode],
    :shared_processor_pool  => [:shared_processor_pool],
    :unattended_gui         => [:sysprep_auto_logon, :sysprep_auto_logon_count, :sysprep_password, :sysprep_timezone],
    :upload_file            => [:sysprep_upload_file],
    :upload_file_2          => [:user_script],
    :upload_text            => [:sysprep_upload_text],
    :user_data              => [:sysprep_computer_name, :sysprep_full_name, :sysprep_organization, :sysprep_product_id],
    :user_script_text       => [:user_script_text],
    :windows_options        => [:sysprep_change_sid, :sysprep_delete_accounts],
    :wins_server            => [:wins_servers],
  }.freeze

  def service_selected_vms(workflow)
    {
      :title => _('Selected VM'),
      :rows  => service_prov_tab_fields(:selected_vms, workflow),
    }
  end

  def service_select(workflow)
    {
      :title => _('Select'),
      :rows  => service_prov_tab_fields(:select, workflow),
    }
  end

  def service_supports_pxe(workflow)
    {
      :title => _('PXE'),
      :rows  => service_prov_tab_fields(:supports_pxe, workflow),
    }
  end

  def service_supports_iso(workflow)
    {
      :title => _('ISO'),
      :rows  => service_prov_tab_fields(:supports_iso, workflow),
    }
  end

  def service_cloud_manager(cloud_manager, workflow)
    {
      :title => cloud_manager ? _('Number of Instances') : _('Number of VMs'),
      :rows  => service_prov_tab_fields(:number_of_vms, workflow),
    }
  end

  def service_naming(workflow)
    {
      :title => _('Naming'),
      :rows  => service_prov_tab_fields(:naming, workflow),
    }
  end

  def service_prov_tab_fields(key, workflow)
    prov_tab_fields(SERVICE_KEYS[key], workflow, :service)
  end

  def service_conditions(workflow)
    {
      :is_ovirt         => workflow.kind_of?(ManageIQ::Providers::Ovirt::InfraManager::ProvisionWorkflow),
      :supports_pxe     => workflow.supports_pxe?,
      :supports_iso     => workflow.supports_iso?,
      :is_cloud_manager => workflow.kind_of?(ManageIQ::Providers::CloudManager::ProvisionWorkflow),
    }
  end

  def service_keys(workflow)
    condition = service_conditions(workflow)
    data = [condition[:is_ovirt] ? service_selected_vms(workflow) : service_select(workflow)]
    data.push(service_supports_pxe(workflow)) if condition[:supports_pxe]
    data.push(service_supports_iso(workflow)) if condition[:supports_iso]
    data.push(service_cloud_manager(condition[:is_cloud_manager], workflow))
    data.push(service_naming(workflow))
    data
  end
end
