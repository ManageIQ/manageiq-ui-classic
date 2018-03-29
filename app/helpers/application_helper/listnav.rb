module ApplicationHelper
  module Listnav
    def render_listnav_filename
      return controller.listnav_filename if controller.respond_to?(:listnav_filename, true)
      if @lastaction == "show_list" && !session[:menu_click] &&
        %w(auth_key_pair_cloud
           availability_zone
           cloud_network
           cloud_object_store_container
           cloud_object_store_object
           cloud_subnet
           cloud_tenant
           cloud_volume
           cloud_volume_backup
           cloud_volume_snapshot
           configuration_job
           container
           container_build
           container_group
           container_image
           container_image_registry
           container_node
           container_project
           container_replicator
           container_route
           container_service
           container_template
           ems_cloud
           ems_cluster
           ems_container
           ems_infra
           ems_middleware
           ems_network
           ems_physical_infra
           ems_storage
           flavor
           floating_ip
           generic_object_definition
           guest_device
           host
           host_aggregate
           load_balancer
           middleware_deployment
           middleware_domain
           middleware_server
           middleware_server_group
           miq_template
           network_port
           network_router
           offline
           orchestration_stack
           persistent_volume
           physical_server
           physical_switch
           resource_pool
           retired
           security_group
           service
           templates
           vm).include?(@layout) && !@in_a_form
        "show_list"
      elsif @compare
        "compare_sections"
      elsif @explorer
        "explorer"
      elsif %w(offline
               retired
               templates
               vm
               vm_cloud
               vm_or_template).include?(@layout)
        "vm"
      elsif %w(action
               auth_key_pair_cloud
               availability_zone
               cloud_network
               cloud_object_store_container
               cloud_object_store_object
               cloud_subnet
               cloud_tenant
               cloud_volume
               cloud_volume_backup
               cloud_volume_snapshot
               condition
               configuration_job
               container
               container_build
               container_group
               container_image
               container_image_registry
               container_node
               container_project
               container_replicator
               container_route
               container_service
               container_template
               ems_cloud
               ems_cluster
               ems_container
               ems_infra
               ems_middleware
               ems_network
               ems_physical_infra
               ems_storage
               flavor
               floating_ip
               generic_object_definition
               guest_device
               host
               host_aggregate
               load_balancer
               middleware_deployment
               middleware_domain
               middleware_server
               middleware_server_group
               miq_schedule
               miq_template
               network_port
               network_router
               orchestration_stack
               persistent_volume
               physical_server
               physical_switch
               policy
               resource_pool
               scan_profile
               security_group
               service
               timeline).include?(@layout)
        @layout
      end
    end

    def single_relationship_link(record, table_name, property_name = nil)
      property_name ||= table_name
      ent = record.send(property_name)
      name = ui_lookup(:table => table_name.to_s)

      return unless role_allows?(:feature => "#{table_name}_show")
      return if ent.nil?

      content_tag(:li) do
        link_params = if restful_routed?(ent)
                        polymorphic_path(ent)
                      else
                        {:controller => table_name, :action => 'show', :id => ent.id.to_s}
                      end
        link_to("#{name}: #{ent.name}",
                link_params,
                :title => _("Show this %{entity_name}'s parent %{linked_entity_name}") %
                          {:entity_name        => record.class.name.demodulize.titleize,
                           :linked_entity_name => name})
      end
    end

    def multiple_relationship_link(record, table_name)
      return unless role_allows?(:feature => "#{table_name}_show_list")
      return if table_name == 'container_route' && !record.respond_to?(:container_routes)

      plural = ui_lookup(:tables => table_name.to_s)
      count = record.number_of(table_name.to_s.pluralize)

      if count.zero?
        content_tag(:li, :class => "disabled") do
          link_to("#{plural} (0)", "#")
        end
      else
        content_tag(:li) do
          if restful_routed?(record)
            link_to("#{plural} (#{count})",
                    polymorphic_path(record, :display => table_name.to_s.pluralize),
                    :title => _("Show %{plural_linked_name}") % {:plural_linked_name => plural})
          else
            link_to("#{plural} (#{count})",
                    {:controller => controller_name,
                     :action     => 'show',
                     :id         => record.id,
                     :display    => table_name.to_s.pluralize},
                    {:title => _("Show %{plural_linked_name}") % {:plural_linked_name => plural}})
          end
        end
      end
    end

    # Function returns a HTML fragment that represents a link to related entity
    # or list of related entities of certain type in case of a condition being
    # met or information about non-existence of such entity if condition is not
    # met.
    #
    # args
    #     :if           --- bool    - the condition to be met
    #                                 if no condition is passed, it's considered true
    #     :table/tables --- string  - name of entity
    #                               - determines singular/plural case
    #     :link_text    --- string  - to override calculated link text
    #     :display      --- string  - type of display (timeline/performance/main/....)
    #     :[count]      --- fixnum  - number of entities, must be set if :tables
    #                                 is used
    #   args to construct URL
    #     :[controller] --- controller name
    #     :[action]     --- controller action
    #     :record_id    --- id of record
    #
    def li_link(args)
      args[:if] = (args[:count] != 0) if args[:count]
      args[:if] = true unless args.key?(:if)

      link_text, title = build_link_text(args)

      if args[:if]
        link_params = {
          :action  => args[:action].presence || 'show',
          :display => args[:display],
          :id      => args[:record].present? ? args[:record].id : args[:record_id].to_s
        }
        link_params[:controller] = args[:controller] if args.key?(:controller)

        tag_attrs = {:title => title}
        check_changes ||= args[:check_changes]
        tag_attrs[:onclick] = 'return miqCheckForChanges()' if check_changes
        content_tag(:li) do
          link_args = {:display => args[:display], :vat => args[:vat]}.compact
          if args[:record] && restful_routed?(args[:record])
            link_to(link_text, polymorphic_path(args[:record], link_args), tag_attrs)
          else
            link_to(link_text, link_params, tag_attrs)
          end
        end
      else
        tag_attrs_disabled = {:title => args[:disabled_title]}
        content_tag(:li, :class => "disabled") do
          link_to(link_text, "#", tag_attrs_disabled)
        end
      end
    end

    def build_link_text(args)
      if args.key?(:tables)
        entity_name = ui_lookup(:tables => args[:tables])
        link_text   = args.key?(:link_text) ? "#{args[:link_text]} (#{args[:count]})" : "#{entity_name} (#{args[:count]})"
        title       = _("Show all %{names}") % {:names => entity_name}
      elsif args.key?(:text)
        count     = args[:count] ? "(#{args[:count]})" : ""
        link_text = "#{args[:text]} #{count}"
      elsif args.key?(:table)
        entity_name = ui_lookup(:table => args[:table])
        link_text   = args.key?(:link_text) ? args[:link_text] : entity_name
        link_text   = "#{link_text} (#{args[:count]})" if args.key?(:count)
        title       = _("Show %{name}") % {:name => entity_name}
      end
      title = args[:title] if args.key?(:title)
      return link_text, title
    end

    def link_to_with_icon(link_text, link_params, tag_args, _image_path = nil)
      tag_args ||= {}
      default_tag_args = {:onclick => "return miqCheckForChanges()"}
      tag_args = default_tag_args.merge(tag_args)
      link_to(link_text, link_params, tag_args)
    end

    def valid_html_id(id)
      id = id.to_s.gsub("::", "__")
      raise "HTML ID is not valid" if id =~ /[^\w]/
      id
    end

    # Create a collapsed panel based on a condition
    def miq_accordion_panel(title, condition, id, &block)
      id = valid_html_id(id)
      content_tag(:div, :class => "panel panel-default") do
        out = content_tag(:div, :class => "panel-heading") do
          content_tag(:h4, :class => "panel-title") do
            link_to(title, "##{id}",
                    'data-parent' => '#accordion',
                    'data-toggle' => 'collapse',
                    :class        => condition ? '' : 'collapsed')
          end
        end
        out << content_tag(:div, :id => id, :class => "panel-collapse collapse #{condition ? 'in' : ''}") do
          content_tag(:div, :class => "panel-body", &block)
        end
      end
    end
  end
end
