class DialogLocalService
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
    case obj.class.name.demodulize
    when /Vm/
      api_collection_name = "vms"
      cancel_endpoint = "/vm_infra/explorer"
      force_old_dialog_use = false
    when /Service/
      api_collection_name = "services"
      cancel_endpoint = "/service/explorer"
      force_old_dialog_use = false
    when /GenericObject/
      api_collection_name = "generic_objects"
      cancel_endpoint = "/generic_object/show_list"
      force_old_dialog_use = false
    else
      force_old_dialog_use = true
    end

    {
      :resource_action_id     => resource_action_id,
      :target_id              => obj.id,
      :target_type            => obj.class.name.demodulize.underscore,
      :force_old_dialog_use   => force_old_dialog_use,
      :api_submit_endpoint    => "/api/#{api_collection_name}/#{obj.id}",
      :api_action             => button_name,
      :finish_submit_endpoint => cancel_endpoint,
      :cancel_endpoint        => cancel_endpoint
    }
  end
end
