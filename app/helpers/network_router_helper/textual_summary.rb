module NetworkRouterHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name type status main_route_table route_propagation routes])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        parent_ems_cloud ems_network cloud_tenant instances cloud_subnets external_gateway floating_ips
        security_groups custom_button_events
      ]
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_main_route_table
    return nil if @record.main_route_table.nil?

    if @record.main_route_table
      message = _("(Subnets not explicitely assigned to a route table are assigned to this main route table, for this VPC)")
    end

    {:label => _('Main Route Table'), :value => "#{@record.main_route_table} #{message}"}
  end

  def textual_route_propagation
    return nil if @record.propagating_vgws.nil?

    {:label => _('Route Propagation'), :value => @record.propagating_vgws.to_s}
  end

  def textual_status
    @record.status
  end

  def textual_routes
    # TODO: Should be TextualTable if possible
    # AWS compatible fields, add another format for another provider or comply with AWS format
    labels = {
      "destination_cidr_block" => _("Destination CIDR"),
      "gateway_id"             => _("Gateway ID"),
      "state"                  => _("State")
    }

    return nil unless @record.routes.kind_of?(Array)
    return @record.routes.to_s if !@record.routes.first || !@record.routes.first.kind_of?(Hash) || !labels.keys.all? { |x| @record.routes.first.key?(x) }

    @record.routes.each_with_object([]) do |route, obj|
      obj << labels.keys.map { |key| "#{labels[key]}: #{route[key]}" }.join(", ")
    end.join(" | ")
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _('Cloud Provider'))
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end

  def textual_cloud_subnets
    textual_link(@record.cloud_subnets, :label => _('Cloud Subnets'))
  end

  def textual_external_gateway
    textual_link(@record.cloud_network, :label => _('Cloud Network'))
  end

  def textual_floating_ips
    textual_link(@record.floating_ips, :label => _('Floating IPs'))
  end

  def textual_security_groups
    textual_link(@record.security_groups, :label => _('Security Groups'))
  end
end
