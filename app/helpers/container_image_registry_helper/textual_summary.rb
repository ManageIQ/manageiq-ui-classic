module ContainerImageRegistryHelper
  module TextualSummary
    #
    # Groups
    #

    def textual_group_properties
      TextualGroup.new(_("Properties"), %i(host port))
    end

    def textual_group_relationships
      TextualGroup.new(_("Relationships"), %i(ems container_services container_groups container_images containers))
    end

    def textual_group_smart_management
      items = %w(tags)
      i = items.collect { |m| send("textual_#{m}") }.flatten.compact
      TextualGroup.new(_("Smart Management"), i)
    end

    #
    # Items
    #

    def textual_host
      @record.host
    end

    def textual_port
      @record.port
    end
  end
end
