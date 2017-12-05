class DialogLocalService
  NEW_DIALOG_USERS = %w(
    CloudTenant
    CloudVolume
    ContainerNode
    EmsCluster
    GenericObject
    Host
    InfraManager
    MiqTemplate
    Service
    Storage
    Vm
  ).freeze

  def determine_dialog_locals_for_svc_catalog_provision(resource_action, target, finish_submit_endpoint)
    api_submit_endpoint = "/api/service_catalogs/#{target.service_template_catalog_id}/service_templates/#{target.id}"

    {
      :resource_action_id     => resource_action.id,
      :target_id              => target.id,
      :target_type            => target.class.name.underscore,
      :dialog_id              => resource_action.dialog_id,
      :force_old_dialog_use   => false,
      :api_submit_endpoint    => api_submit_endpoint,
      :api_action             => "order",
      :finish_submit_endpoint => finish_submit_endpoint,
      :cancel_endpoint        => "/catalog/explorer"
    }
  end

  def determine_dialog_locals_for_custom_button(obj, button_name, resource_action_id)
    dialog_locals = {:force_old_dialog_use => true}

    return dialog_locals unless NEW_DIALOG_USERS.include?(obj.class.name.demodulize)

    submit_endpoint, cancel_endpoint = determine_api_endpoints(obj)

    dialog_locals.merge!(
      :resource_action_id     => resource_action_id,
      :target_id              => obj.id,
      :target_type            => obj.class.name.demodulize.underscore,
      :force_old_dialog_use   => false,
      :api_submit_endpoint    => submit_endpoint,
      :api_action             => button_name,
      :finish_submit_endpoint => cancel_endpoint,
      :cancel_endpoint        => cancel_endpoint
    )

    dialog_locals
  end

  private

  def determine_api_endpoints(obj)
    case obj.class.name.demodulize
    when /CloudTenant/
      api_collection_name = "cloud_tenants"
      cancel_endpoint = "/cloud_tenant"
    when /CloudVolume/
      api_collection_name = "cloud_volumes"
      cancel_endpoint = "/cloud_volume"
    when /ContainerNode/
      api_collection_name = "container_nodes"
      cancel_endpoint = "/container_node"
    when /EmsCluster/
      api_collection_name = "clusters"
      cancel_endpoint = "/ems_cluster"
    when /GenericObject/
      api_collection_name = "generic_objects"
      cancel_endpoint = "/generic_object/show_list"
    when /Host/
      api_collection_name = "hosts"
      cancel_endpoint = "/host"
    when /InfraManager/
      api_collection_name = "providers"
      cancel_endpoint = "/ems_infra"
    when /MiqTemplate/
      api_collection_name = "templates"
      cancel_endpoint = "/vm_or_template/explorer"
    when /Service/
      api_collection_name = "services"
      cancel_endpoint = "/service/explorer"
    when /Storage/
      api_collection_name = "datastores"
      cancel_endpoint = "/storage/explorer"
    when /Vm/
      api_collection_name = "vms"
      cancel_endpoint = "/vm_infra/explorer"
    end

    submit_endpoint = "/api/#{api_collection_name}/#{obj.id}"

    return submit_endpoint, cancel_endpoint
  end
end
