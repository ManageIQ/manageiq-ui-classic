module EmsContainerHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualAuthenticationsStatus
  include TextualMixins::TextualMetricsStatus
  include TextualMixins::TextualDataCollectionState
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name type hostname port cpu_cores memory_resources))
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    items = []
    items.concat(%i(container_projects))
    items.concat(%i(container_routes)) if @record.respond_to?(:container_routes)
    items.concat(%i(container_services container_replicators container_groups containers container_nodes
                    container_image_registries container_images volumes container_builds container_templates))
    TextualGroup.new(_("Relationships"), items)
  end

  def textual_group_status
    TextualGroup.new(
      _("Status"),
      textual_authentications_status + %i(authentications_status metrics_status refresh_status refresh_date data_collection_state)
    )
  end

  def textual_group_component_statuses
    labels = [_("Name"), _("Healthy"), _("Error")]
    h = {:labels => labels}
    h[:values] = @record.container_component_statuses.collect do |cs|
      [
        cs.name,
        cs.status,
        (cs.error || "")
      ]
    end
    TextualMultilabel.new(_("Component Statuses"), h)
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(zone tags))
  end

  def textual_group_topology
    items = %w(topology)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualGroup.new(_("Overview"), i)
  end
  #
  # Items
  #

  def textual_name
    @record.name
  end

  def textual_type
    @record.emstype_description
  end

  def textual_hostname
    @record.hostname
  end

  def textual_memory_resources
    {:label => _("Aggregate Node Memory"),
     :value => number_to_human_size(@record.aggregate_memory * 1.megabyte,
                                    :precision => 0)}
  end

  def textual_cpu_cores
    {:label => _("Aggregate Node CPU Cores"),
     :value => @record.aggregate_cpu_total_cores}
  end

  def textual_port
    @record.supports_port? ? @record.port : nil
  end

  def textual_zone
    {:label => _("Managed by Zone"), :icon => "pficon pficon-zone", :value => @record.zone.name}
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => polymorphic_path(@record, :display => 'topology'),
     :title => _("Show topology")}
  end

  def textual_volumes
    count_of_volumes = @record.number_of(:persistent_volumes)
    label = ui_lookup(:tables => "volume")
    h     = {:label => label, :icon => "pficon pficon-volume", :value => count_of_volumes}
    if count_of_volumes > 0 && role_allows?(:feature => "persistent_volume_show_list")
      h[:link]  = ems_container_path(@record.id, :display => 'persistent_volumes')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_group_endpoints
    endpoints = @record.endpoints.where.not(:role => 'default')
    return if endpoints.nil?

    endpoint_groups = endpoints.map do |e|
      [
        {:label => _("%{role} Host Name") % {:role => e.role.capitalize}, :value => e.hostname},
        {:label => _("%{role} API Port") % {:role => e.role.capitalize}, :value => e.port}
      ]
    end

    TextualGroup.new(_("Endpoints"), endpoint_groups.flatten)
  end

  def textual_group_miq_custom_attributes
    TextualGroup.new(_("Custom Attributes"), textual_miq_custom_attributes)
  end

  def redact_username_and_password(value)
    begin
      uri = URI.parse(value)
      uri.password = '***' if uri.password
      uri.user = '***' if uri.user
      uri.to_s
    rescue # dont reduct in case the value was malformed, to allow debugging it.
      value
    end
  end

  def textual_miq_custom_attributes
    attrs = @record.custom_attributes
    return nil if attrs.blank?
    attrs.sort_by(&:name).collect do |a|
      {
        :label => a.name.tr("_", " "),
        :value => redact_username_and_password(a.value)
      }
    end
  end
end
