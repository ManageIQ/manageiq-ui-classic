module ReportHelper::Editor
  def cb_entities_by_provider_id(provider_id, entity_type)
    provider = ManageIQ::Providers::ContainerManager.find_by(:id => provider_id)
    return [] if provider.nil?
    case entity_type.underscore.to_sym
    when :container_project
      provider.container_projects.order(:name).pluck(:name, :id)
    when :container_image
      provider.container_images.order(:name).pluck(:name, :id)
    end
  end

  def cb_image_labels
    CustomAttribute.where(:section => "docker_labels").distinct('name').pluck(:name).each_with_object({}) { |l, h| h[l] = l }
  end

  def refresh_chargeback_filter_tab
    @edit[:cb_users] = Rbac::Filterer.filtered(User.in_my_region).each_with_object({}) { |u, h| h[u.userid] = u.name }
    @edit[:cb_tenant] = Rbac::Filterer.filtered(Tenant.in_my_region).each_with_object({}) { |t, h| h[t.id] = t.name }
  end
end
