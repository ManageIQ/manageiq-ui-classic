module ContainerSummaryHelper
  include TextualMixins::TextualName

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_container_project
    textual_link(@record.container_project)
  end

  def textual_container_group
    textual_link(@record.container_group)
  end

  def textual_container_projects
    textual_link(@record.container_projects)
  end

  def textual_container_routes
    textual_link(@record.container_routes)
  end

  def textual_container_service
    textual_link(@record.container_service)
  end

  def textual_container_services
    textual_link(@record.container_services)
  end

  def textual_container_replicator
    textual_link(@record.container_replicator)
  end

  def textual_container_replicators
    textual_link(@record.container_replicators)
  end

  def textual_container_groups
    textual_link(@record.container_groups)
  end

  def textual_containers
    textual_link(@record.containers) # should it be container_show_list?
  end

  def textual_container_nodes
    textual_link(@record.container_nodes)
  end

  def textual_container_node
    textual_link(@record.container_node)
  end

  def textual_container_builds
    textual_link(@record.container_builds)
  end

  def textual_container_build
    textual_link(@record.container_build)
  end

  def textual_container_templates
    textual_link(@record.container_templates)
  end

  def textual_container_template
    textual_link(@record.container_template)
  end

  def textual_group_container_labels
    TextualGroup.new(_("Labels"), textual_key_value_group(@record.labels.to_a))
  end

  def textual_group_annotations
    TextualGroup.new(_("Annotations"), textual_key_value_group(@record.annotations))
  end

  def textual_group_miq_custom_attributes
    TextualGroup.new(_("Custom Attributes"), textual_miq_custom_attributes)
  end

  def textual_miq_custom_attributes
    attrs = @record.miq_custom_attributes
    return nil if attrs.blank?
    attrs.sort_by(&:name).collect { |a| {:label => a.name.tr("_", " "), :value => a.value} }
  end

  def textual_group_container_selectors
    TextualGroup.new(_("Selector"), textual_key_value_group(@record.selector_parts.to_a))
  end

  def textual_group_container_node_selectors
    TextualGroup.new(_("Node Selector"), textual_key_value_group(@record.node_selector_parts.to_a))
  end

  def textual_container_image
    textual_link(@record.container_image)
  end

  def textual_container_images
    textual_link(@record.container_images)
  end

  def textual_resource_version
    @record.resource_version
  end

  def textual_creation_timestamp
    {:label => _("Creation timestamp"), :value => format_timezone(@record.ems_created_on)}
  end

  def textual_guest_applications
    textual_link(@record.guest_applications, :feature => "container_image_show",
                                             :label   => _("Packages"),
                                             :link    => url_for_only_path(:controller => controller.controller_name,
                                                                           :action     => 'guest_applications',
                                                                           :id         => @record,
                                                                           :db         => controller.controller_name))
  end

  def textual_openscap
    textual_link(
      @record.openscap_rule_results,
      :feature => "container_image_show",
      :label   => _("OpenSCAP Results"),
      :link    => url_for_only_path(
        :controller => controller.controller_name,
        :action     => 'openscap_rule_results',
        :id         => @record,
        :db         => controller.controller_name,
      )
    )
  end

  def textual_last_scan
    format_timezone(@record.last_sync_on)
  end

  def textual_openscap_html
    h = {:label => _("OpenSCAP HTML")}
    if @record.openscap_result
      h[:value] = _('Available')
      h[:link] = url_for_only_path(
        :id         => @record,
        :controller => controller.controller_name,
        :action     => 'openscap_html'
      )
    else
      h[:value] = _('Not Available')
    end
    h
  end

  def textual_container_image_registry
    object = @record.container_image_registry
    if object.nil? && @record.respond_to?(:display_registry)
      {
        :label => _('Image Registry'),
        :icon  => 'pficon pficon-registry-unknown',
        :value => @record.display_registry
      }
    else
      textual_link(@record.container_image_registry)
    end
  end

  def textual_container_image_registries
    textual_link(@record.container_image_registries)
  end

  def textual_persistent_volume
    textual_link(@record.persistent_volume)
  end

  def textual_persistent_volumes
    textual_link(@record.persistent_volumes, :as => PersistentVolume)
  end

  def textual_parent
    textual_link(@record.parent)
  end

  def collect_env
    collect_env_variables.collect do |name, value, field_path|
      [
        name,
        value.nil? ? "REFERENCE" : "VALUE",
        {:value => value.nil? ? field_path : value, :expandable => true}
      ]
    end
  end
end
