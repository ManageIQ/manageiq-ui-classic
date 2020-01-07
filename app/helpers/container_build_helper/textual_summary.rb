module ContainerBuildHelper::TextualSummary
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name creation_timestamp resource_version])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems container_project])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_build_instances
    TextualMultilabel.new(
      _("Build Instances"),
      :wide                   => true,
      :additional_table_class => "table-fixed",
      :values                 => collect_build_pods,
      :labels                 => [
        _("Name"), _("Phase"),
        _("Message"), _("Reason"),
        _("Pod"), _("Output Image"),
        _("Start Timestamp"),
        {:value => _("Completion Timestamp"), :sortable => :desc},
        _("Duration"),
      ],
    )
  end

  def collect_build_pods
    @record.container_build_pods
           .order('completion_timestamp desc')
           .collect do |build_pod|
      [
        build_pod.name,
        build_pod.phase,
        {:value => build_pod.message, :expandable => true},
        build_pod.reason,
        link_to_pod(build_pod.container_group),
        {:value => build_pod.output_docker_image_reference, :expandable => true},
        build_pod.start_timestamp,
        build_pod.completion_timestamp,
        parse_duration(build_pod.duration),
      ]
    end
  end

  #
  # Items
  #
  def textual_creation_timestamp
    {:label => _('Creation Timestamp'), :value => format_timezone(@record.ems_created_on)}
  end

  def textual_resource_version
    @record.resource_version
  end

  def textual_path
    @record.path
  end

  def textual_service_account
    @record.service_account
  end

  def parse_duration(seconds)
    if !seconds
      return 0
    else # the duration recieved from openshift is in nano secods
      seconds /= 1_000_000_000
    end

    minutes, seconds = seconds.divmod(60)
    "#{minutes}m#{seconds}s"
  end

  def link_to_pod(container_group)
    if container_group
      {:value => container_group.name,
       :link  => url_for_only_path(:action     => 'show',
                                   :controller => 'container_group',
                                   :id         => container_group.id)}
    else
      _("No Pod")
    end
  end
end
