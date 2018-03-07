module QuadiconHelper
  # Refactoring phase 1
  # * Add tests
  # * Move configuration up and out
  # * Try to reveal more intention in conditionals
  # * Extract smaller methods from large methods

  # Collect and normalize global, environment state

  # @settings and `settings` method
  # @listicon
  # @embedded
  # @showlinks
  # @policy_sim
  # @explorer
  # @view.db
  # @parent
  # @lastaction
  # session[:policies]
  # request.parameters[:controller]

  include QuadiconHelper::Decorator

  def quadicon_truncate_mode
    @settings.fetch_path(:display, :quad_truncate) || 'm'
  end

  def listicon_nil?
    @listicon.nil?
  end

  def quadicon_vm_attributes(item)
    vm_quad_link_attributes(item)
  end

  def quadicon_vm_attributes_present?(item)
    quadicon_vm_attributes(item) && !quadicon_vm_attributes(item).empty?
  end

  def quadicon_in_embedded_view?
    !!@embedded
  end

  def quadicon_show_link_ivar?
    !!@showlinks
  end

  def quadicon_hide_links?
    !quadicon_show_links?
  end

  def quadicon_show_links?
    !quadicon_in_embedded_view? || quadicon_show_link_ivar?
  end

  def quadicon_show_url?
    !@quadicon_no_url
  end

  def quadicon_in_explorer_view?
    !!@explorer
  end

  def quadicon_policies_are_set?
    !session[:policies].empty?
  end

  def quadicon_in_service_controller?
    request.parameters[:controller] == "service"
  end

  def quadicon_view_db_is_vm?
    @view.db == "Vm"
  end

  def quadicon_service_ctrlr_and_vm_view_db?
    quadicon_in_service_controller? && quadicon_view_db_is_vm?
  end

  def quadicon_render_for_policy_sim?
    quadicon_policy_sim? && quadicon_policies_are_set?
  end

  def quadicon_edit_key?(key)
    !!(@edit && @edit[key])
  end

  #
  # Ways of Building URLs
  # Collect here to see if any can be eliminated
  #

  # def quadicon_url_for_record(item)
  #   url_for_record(item)
  # end

  # Replaces url options where private controller method was called
  # Pretty sure this is unnecessary as list_row_id just returns a cid.
  #
  # Currently can't use `url_for_record` because it attempts to guess the
  # controller and guesses incorrectly for some situations.
  #
  def quadicon_url_to_xshow_from_cid(item, options = {})
    # Previously: {:action => 'x_show', :id => controller.send(:list_row_id, item)}
    {:action => 'x_show', :id => item.id || options[:x_show_id]}
  end

  # Currently only used once
  #
  def quadicon_url_with_parent_and_lastaction(item)
    url_for_only_path(
      :controller => @parent.class.base_class.to_s.underscore,
      :action     => @lastaction,
      :id         => @parent.id,
      :show       => item.id
    )
  end

  # Normalize default options

  def quadicon_default_inline_styles(height: 80)
    [
      "margin-left: auto",
      "margin-right: auto",
      "width: 75px",
      "height: #{height}px",
      "z-index: 0"
    ].join("; ")
  end

  def render_quadicon(item, options = {})
    return unless item

    tag_options = {
      :id => "quadicon_#{item.id}"
    }

    if options[:typ] == :listnav
      tag_options[:style] = quadicon_default_inline_styles
      tag_options[:class] = ""
    end

    quadicon_tag(tag_options) do
      quadicon_builder_factory(item, options)
    end
  end

  # FIXME: Even better would be to ask the object what method to use
  def quadicon_builder_factory(item, options)
    case quadicon_builder_name_from(item)
    when 'service', 'service_template', 'service_ansible_tower', 'service_template_ansible_tower'
      render_service_quadicon(item, options)
    when 'resource_pool'         then render_resource_pool_quadicon(item, options)
    when 'host'                  then render_host_quadicon(item, options)
    when 'ext_management_system' then render_ext_management_system_quadicon(item, options)
    when 'ems_cluster'           then render_ems_cluster_quadicon(item, options)
    when 'single_quad'           then render_single_quad_quadicon(item, options)
    when 'storage'               then render_storage_quadicon(item, options)
    when 'vm_or_template'        then render_vm_or_template_quadicon(item, options)
    when 'physical_server'       then render_physical_server_quadicon(item, options)
    else
      raise "unknown quadicon kind - #{quadicon_builder_name_from(item)}"
    end
  end

  def calculate_quad_db(item)
    if item.class.base_model.to_s.underscore == "ext_management_system"
      db_for_quadicon
    else
      item.class.base_model.name.underscore.to_sym
    end
  end

  private :calculate_quad_db

  def quadicons_from_settings(db_name)
    if respond_to?(:settings)
      settings(:quadicons, db_name)
    elsif @settings && @settings[:quadicons]
      @settings[:quadicons][db_name]
    end
  end

  private :quadicons_from_settings

  def quad_image(item)
    if @listicon
      "100/#{@listicon}.png"
    elsif item.decorate.try(:fileicon)
      item.decorate.try(:fileicon)
    else
      "100/#{item.class.base_class.to_s.underscore}.png"
    end
  end

  def single_quad(item)
    output = []
    output << flobj_img_simple
    if item.kind_of?(VmOrTemplate) && quadicon_policy_sim? && !session[:policies].empty?
      output << flobj_img_small(img_for_compliance(item), "e72")
    end
    output << flobj_img_simple('100/shield.png', "g72") if item.try(:get_policies).present?
    output << flobj_img_simple(quad_image(item), "e72")
  end

  private :single_quad

  def quad_decorator(quad, item)
    output = []
    output << flobj_img_simple("layout/base.svg")
    output.concat(transform_quadicon(quad))
    output << flobj_img_simple('100/shield.png', "g72") if item.try(:get_policies).present?
    output
  end

  def quadicon_for_item(item)
    quad_settings = if item.kind_of?(VmOrTemplate)
                      {
                        :show_compliance => quadicon_lastaction_is_policy_sim? || quadicon_policy_sim?,
                        :policies        => session[:policies]
                      }
                    else
                      {}
                    end
    quadicon = item.decorate.try(:quadicon, quad_settings)
    if quadicons_from_settings(calculate_quad_db(item)) && quadicon
      quad_decorator(quadicon, item)
    else
      single_quad(item)
    end
  end

  def quadicon_tag(options = {}, &block)
    options = {:class => "quadicon"}.merge!(options)
    content_tag(:div, options, &block)
  end

  def img_for_compliance(item)
    compliance_img(item, session[:policies])
  end

  def img_for_vendor(item)
    "svg/vendor-#{h(item.vendor)}.svg"
  end

  def img_for_auth_status(item)
    QuadiconHelper::Decorator.status_img(item.authentication_status)
  end

  def render_quadicon_text(item, row)
    render_quadicon_label(item, row)
  end

  def render_quadicon_label(item, row)
    return unless item

    content = quadicon_label_content(item, row)
    opts    = quadicon_build_label_options(item, row)

    if quadicon_hide_links?
      content_tag(:span, content, opts[:options])
    else
      url = quadicon_build_label_url(item, row)
      quadicon_link_to(url, **opts) { content }
    end
  end

  def img_tag_reflection
    content_tag(:div, :class => 'flobj') do
      tag(:img, :src => ActionController::Base.helpers.image_path("layout/reflection.png"), :border => 0)
    end
  end

  # Renders a quadicon for PhysicalServer
  #
  def render_physical_server_quadicon(item, options)
    output = quadicon_for_item(item)

    if options[:typ] == :listnav
      # Listnav, no href needed
      output << img_tag_reflection
    else
      href = if quadicon_show_links?
               if quadicon_edit_key?(:hostitems)
                 "/physical_server/edit/?selected_physical_server=#{item.id}"
               else
                 url_for_record(item)
               end
             end

      output << content_tag(:div, :class => 'flobj') do
        title = _("Name: %{name} ") % {:name => h(item.name)}

        link_to(href, :title => title) do
          quadicon_reflection_img
        end
      end
    end
    safe_join(output)
  end

  # FIXME: Even better would be to ask the object what name to use
  def quadicon_label_content(item, row, truncate: true)
    return item.address if item.kind_of? FloatingIp

    key = case quadicon_model_name(item)
          when "ConfiguredSystem"     then "hostname"
          when "ServiceResource"      then "resource_name"
          when "ConfigurationProfile" then "description"
          when "EmsCluster"           then "v_qualified_desc"
          else
            %w(evm_display_name key name).detect { |k| row[k] }
          end

    if truncate
      truncate_for_quad(row[key], :mode => quadicon_truncate_mode)
    else
      row[key]
    end
  end

  def quadicon_build_label_url(item, row)
    if quadicon_in_explorer_view?
      quadicon_build_explorer_url(item, row)
    else
      url_for_record(item)
    end
  end

  def quadicon_build_explorer_url(item, row)
    attrs = default_url_options

    if quadicon_service_ctrlr_and_vm_view_db?
      if quadicon_vm_attributes(item)
        attrs.merge!(quadicon_vm_attributes(item))
      end
    else
      attrs[:controller] = controller_name
      attrs[:action]  = 'x_show'
      attrs[:id]      = row['id'] || row['x_show_id']
    end

    url_for_only_path(attrs)
  end

  def quadicon_build_label_options(item, row)
    link_options = {
      :options => {
        :title => quadicon_label_content(item, row, :truncate => false)
      }
    }

    if quadicon_render_for_policy_sim?
      link_options[:options][:title] = _("Show policy details for %{name}") % {:name => row['name']}
    end

    if quadicon_in_explorer_view?
      link_options[:sparkle] = true

      if quadicon_service_ctrlr_and_vm_view_db? && !quadicon_vm_attributes_present?(item)
        link_options[:sparkle] = false
      end

      unless quadicon_service_ctrlr_and_vm_view_db?
        link_options[:remote] = true
      end
    end

    link_options
  end

  def quadicon_model_name(item)
    # Fix this with methods in these classes (if necessary)
    if item.class.respond_to?(:db_name)
      item.class.db_name
    # FIXME: quadicon_model_name() and url_for_record() need to be unified, since both do basically the same thing
    elsif item.kind_of?(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook)
      'ansible_playbook'
    elsif item.kind_of?(ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
      'ansible_repository'
    elsif item.kind_of?(ManageIQ::Providers::EmbeddedAutomationManager::Authentication)
      'ansible_credential'
    else
      item.class.base_model.name
    end
  end

  # Build a link with common quadicon options
  #
  def quadicon_link_to(url, sparkle: false, remote: false, options: {}, &block)
    return if url.nil? && !quadicon_show_url?
    if sparkle
      options["data-miq_sparkle_on"] = true
      options["data-miq_sparkle_off"] = true
    end

    if remote
      options[:remote] = true
      options["data-method"] = :post
    end

    link_to(url, options, &block)
  end

  # Build a reflection img with common options
  #
  def quadicon_reflection_img(options = {})
    path = options.delete(:path) || "layout/reflection.png"
    options = { :border => 0, :size => 72 }.merge(options)
    encodable_image_tag(path, options)
  end

  CLASSLY_NAMED_ITEMS = %w(
    PhysicalServer
    EmsCluster
    ResourcePool
    Repository
    Service
    ServiceTemplate
    Storage
    ServiceAnsibleTower
    ServiceTemplateAnsibleTower
  ).freeze

  def quadicon_named_for_base_class?(item)
    %w(ExtManagementSystem Host PhysicalServer).include?(item.class.base_class.name)
  end

  def quadicon_builder_name_from(item)
    builder_name = if CLASSLY_NAMED_ITEMS.include?(item.class.name)
                     item.class.name.underscore
                   elsif item.kind_of?(VmOrTemplate) || item.kind_of?(PhysicalServer)
                     item.class.base_model.to_s.underscore
                   elsif item.kind_of?(ManageIQ::Providers::ConfigurationManager)
                     "single_quad"
                   elsif quadicon_named_for_base_class?(item)
                     item.class.base_class.name.underscore
                   else
                     # All other models that only need single large icon and use name for hover text
                     "single_quad"
                   end

    builder_name = 'vm_or_template' if %w(miq_template vm).include?(builder_name)
    builder_name
  end

  # Truncate text to fit below a quad icon
  # mode originally from @settings.fetch_path(:display, :quad_truncate)
  #
  def truncate_for_quad(value, mode: 'm', trunc_to: 10, trunc_at: 13)
    return value.to_s if value.to_s.length < trunc_at

    case mode
    when "b" then quadicon_truncate_back(value, trunc_to)
    when "f" then quadicon_truncate_front(value, trunc_to)
    else          quadicon_truncate_middle(value, trunc_to)
    end
  end

  def quadicon_truncate_back(value, trunc_to = 10)
    value.first(trunc_to) + "..."
  end

  def quadicon_truncate_front(value, trunc_to = 10)
    "..." + value.last(trunc_to)
  end

  def quadicon_truncate_middle(value, trunc_to = 10)
    value.first(trunc_to / 2) + "..." + value.last(trunc_to / 2)
  end

  def flobj_img_simple(image = nil, cls = '', size = 72)
    image ||= "layout/base-single.svg"

    content_tag(:div, :class => "flobj #{cls}") do
      encodable_image_tag(image, :size => size)
    end
  end

  def flobj_img_small(image = nil, cls = '')
    flobj_img_simple(image, cls, 64)
  end

  def flobj_p_simple(cls, text, test_style = nil)
    content_tag(:div, :class => "flobj #{cls}") do
      content_tag(:p, text, :style => test_style)
    end
  end

  # Renders a quadicon for service classes
  #
  def render_service_quadicon(item, options)
    output = []
    output << flobj_img_simple

    url = ""
    link_opts = {}

    if quadicon_show_links?
      url = url_for_record(item, "x_show")
      link_opts = {:sparkle => true, :remote => true}
    end

    output << content_tag(:div, :class => "flobj e72") do
      quadicon_link_to(url, **link_opts) do
        quadicon_reflection_img(options.merge!(:path => item.decorate.fileicon))
      end
    end

    output.collect(&:html_safe).join('').html_safe
  end

  # Renders a quadicon for resource_pools
  #
  def render_resource_pool_quadicon(item, options)
    output = quadicon_for_item(item)

    unless options[:typ] == :listnav
      # listnav, no clear image needed
      output << content_tag(:div, :class => "flobj") do
        url = quadicon_show_links? ? url_for_record(item) : ""

        link_to(url, :title => h(item.name)) do
          quadicon_reflection_img(:path => "layout/clearpix.gif")
        end
      end
    end
    output.collect(&:html_safe).join('').html_safe
  end

  # Renders a quadicon for hosts
  #
  def render_host_quadicon(item, options)
    output = quadicon_for_item(item)

    if options[:typ] == :listnav
      # Listnav, no href needed
      output << img_tag_reflection
    else
      href = if quadicon_show_links?
               quadicon_edit_key?(:hostitems) ? "/host/edit/?selected_host=#{item.id}" : url_for_record(item)
             end

      output << content_tag(:div, :class => 'flobj') do
        title = _("Name: %{name} Hostname: %{hostname}") % {:name => h(item.name), :hostname => h(item.hostname)}

        link_to(href, :title => title) do
          quadicon_reflection_img
        end
      end
    end
    output.collect(&:html_safe).join('').html_safe
  end

  def db_for_quadicon
    case @layout
    when "ems_infra" then :ems
    when "ems_cloud" then :ems_cloud
    else                  :ems_container
    end
  end

  POSITION_MAPPER = {
    :top_left     => "a72",
    :top_right    => "b72",
    :bottom_left  => "c72",
    :bottom_right => "d72",
  }.freeze

  # Render text inside quadicon, every text with more than 3 characters will use smaller font.
  # Returns text inside html element
  #
  # ==== Attributes
  #
  # * +text+ - text to render inside quad
  # * +position+ - where to render text
  def render_quad_text(text, position)
    font_size = text.to_s.size > 2 ? "font-size: 12px;" : nil
    flobj_p_simple(position, text, font_size)
  end

  # Render images and fonticons.
  # Returns img string inside html element.
  #
  # ==== Attributes
  #
  # * +img+ - either URL to img or fonticon text
  # * +position+ - where to render image
  # * +type+ - default to nil, if small given it will use :flobj_img_smal for others it uses :flobj_img_simple
  def render_quad_image(img, position, type = nil)
    method = type == "small" ? method(:flobj_img_small) : method(:flobj_img_simple)
    method.call(img, position)
  end

  # Transforms quadicon hash to array of strings with their location in quadicon.
  # Returns array of strings
  #
  # ==== Attributes
  #
  # * +quadicon+ - item with quadicon
  def transform_quadicon(quadicon)
    quadicon.map do |key, value|
      if value.try(:[], :text)
        render_quad_text(value[:text], POSITION_MAPPER[key])
      elsif value.try(:[], :fileicon)
        render_quad_image(value.try(:[], :fileicon), POSITION_MAPPER[key], value.try(:type))
      else
        ""
      end
    end
  end

  # Renders a quadicon for ext_management_systems
  #
  def render_ext_management_system_quadicon(item, options)
    output = quadicon_for_item(item)
    if options[:typ] == :listnav
      output << flobj_img_simple("layout/reflection.png")
    else
      output << content_tag(:div, :class => 'flobj') do
        title = _("Name: %{name} Hostname: %{hostname} Refresh Status: %{status} Authentication Status: %{auth_status}") %
                {
                  :name        => h(item.name),
                  :hostname    => h(item.hostname),
                  :status      => h(item.last_refresh_status.titleize),
                  :auth_status => h(item.authentication_status)
                }

        link_to(url_for_record(item), :title => title) do
          quadicon_reflection_img
        end
      end
    end
    output.collect(&:html_safe).join('').html_safe
  end

  # Renders quadicon for ems_clusters
  #
  def render_ems_cluster_quadicon(item, options)
    output = quadicon_for_item(item)

    unless options[:typ] == :listnav
      # Listnav, no clear image needed
      url = quadicon_show_links? ? url_for_record(item) : nil

      output << content_tag(:div, :class => 'flobj') do
        link_to(url, :title => h(item.v_qualified_desc)) do
          quadicon_reflection_img
        end
      end
    end
    output.collect(&:html_safe).join('').html_safe
  end

  def render_non_listicon_single_quadicon(item, options)
    output = quadicon_for_item(item)

    unless options[:typ] == :listnav
      name = if item.kind_of?(MiqProvisionRequest)
               item.message
             else
               item.try(:name)
             end

      img_opts = {
        :title => h(name),
        :path  => "layout/clearpix.gif"
      }

      link_opts = {}

      url = ""

      if quadicon_show_links?
        if quadicon_in_explorer_view?
          img_opts.delete(:path)
          url = quadicon_url_to_xshow_from_cid(item, options)
          link_opts = {:sparkle => true, :remote => true}
        else
          url = url_for_record(item)
        end
      end

      output << content_tag(:div, :class => "flobj") do
        quadicon_link_to(url, **link_opts) do
          quadicon_reflection_img(img_opts)
        end
      end
    end

    output
  end

  def render_listicon_single_quadicon(item, options)
    output = quadicon_for_item(item)

    unless options[:typ] == :listnav
      title = case @listicon
              when "scan_history"
                item.started_on
              when "orchestration_stack_output", "output"
                item.key
              else
                item.try(:name)
              end

      url = nil

      if quadicon_show_links?
        url = quadicon_url_with_parent_and_lastaction(item)
      end

      output << content_tag(:div, :class => 'flobj') do
        link_to(url, :title => title) do
          quadicon_reflection_img
        end
      end
    end

    output
  end

  # Renders a single_quad uh, quadicon
  #
  def render_single_quad_quadicon(item, options)
    output =  if listicon_nil?
                render_non_listicon_single_quadicon(item, options)
              else
                render_listicon_single_quadicon(item, options)
              end

    output.collect(&:html_safe).join('').html_safe
  end

  # Renders a storage quadicon
  #
  def render_storage_quadicon(item, options)
    output = quadicon_for_item(item)

    if options[:typ] == :listnav
      output << flobj_img_simple("layout/reflection.png")
    else
      output << content_tag(:div, :class => 'flobj') do
        quadicon_link_to(quadicon_storage_url(item), **quadicon_storage_link_options) do
          quadicon_reflection_img(quadicon_storage_img_options(item))
        end
      end
    end

    output.collect(&:html_safe).join('').html_safe
  end

  def quadicon_storage_url(item)
    url = nil

    if quadicon_in_explorer_view? && quadicon_show_links?
      url = quadicon_url_to_xshow_from_cid(item)
    end

    if !quadicon_in_explorer_view? && quadicon_show_links?
      url = url_for_record(item)
    end

    url
  end

  def quadicon_storage_link_options
    opts = {}

    if quadicon_in_explorer_view? && quadicon_show_links?
      opts = {
        :sparkle => true,
        :remote  => true
      }
    end

    opts
  end

  def quadicon_storage_img_options(item)
    opts = {
      :title  => _("Name: %{name} Datastore Type: %{storage_type}") % {:name => h(item.name), :storage_type => h(item.store_type)}
    }

    opts
  end

  # Renders a vm quadicon
  #
  def render_vm_or_template_quadicon(item, options)
    output = quadicon_for_item(item)
    unless options[:typ] == :listnav
      output << content_tag(:div, :class => 'flobj') do
        quadicon_link_to(quadicon_vt_url(item), **quadicon_vt_link_options) do
          quadicon_reflection_img(quadicon_vt_img_options(item))
        end
      end
    end
    output.collect(&:html_safe).join('').html_safe
  end

  def quadicon_vt_img_link(item)
    quadicon_link_to(quadicon_vt_url(item), **quadicon_vt_link_options) do
      quadicon_reflection_img(quadicon_vt_img_options(item))
    end
  end

  def quadicon_vt_url(item)
    url = nil # inferred by default

    if quadicon_show_links? && quadicon_in_explorer_view? &&
       quadicon_service_ctrlr_and_vm_view_db?

      url = if quadicon_vm_attributes_present?(item)
              quadicon_vm_attributes(item).slice(:controller, :action, :id)
            else
              ''
            end
    end

    if quadicon_show_links? && !quadicon_service_ctrlr_and_vm_view_db?
      url = url_for_record(item)
    end

    if quadicon_hide_links? && quadicon_policy_sim?
      url = url_for_record(item, "policies")
    end

    url
  end

  def quadicon_vt_img_options(item)
    options = {
      :title  => item.name
    }

    if quadicon_hide_links? && quadicon_policy_sim? && !quadicon_edit_key?(:explorer)
      options = {:title => _("Show policy details for %{item_name}") % {:item_name => h(item.name)}}
    end

    options
  end

  def quadicon_vt_link_options
    options = {}

    if (quadicon_show_links? && quadicon_in_explorer_view?) ||
       (quadicon_hide_links? && quadicon_policy_sim? && quadicon_edit_key?(:explorer))

      options = {
        :sparkle => true,
        :remote  => true
      }
    end

    if quadicon_show_links? && quadicon_in_explorer_view? &&
       quadicon_service_ctrlr_and_vm_view_db?

      options[:remote] = false
    end

    options
  end

  private

  def vm_quad_link_attributes(record)
    attributes = vm_cloud_attributes(record) if record.kind_of?(ManageIQ::Providers::CloudManager::Vm)
    attributes ||= vm_infra_attributes(record) if record.kind_of?(ManageIQ::Providers::InfraManager::Vm)
    attributes
  end

  def vm_cloud_attributes(record)
    attributes = vm_cloud_explorer_accords_attributes(record)
    attributes ||= service_workload_attributes(record)
    attributes
  end

  def vm_infra_attributes(record)
    attributes = vm_infra_explorer_accords_attributes(record)
    attributes ||= service_workload_attributes(record)
    attributes
  end

  def vm_cloud_explorer_accords_attributes(record)
    if role_allows?(:feature => 'instances_accord') || role_allows?(:feature => 'instances_filter_accord')
      {:link => true, :controller => 'vm_cloud', :action => 'show', :id => record.id}
    end
  end

  def vm_infra_explorer_accords_attributes(record)
    if role_allows?(:feature => 'vandt_accord') || role_allows?(:feature => 'vms_filter_accord')
      {:link => true, :controller => 'vm_infra', :action => 'show', :id => record.id}
    end
  end

  def service_workload_attributes(record)
    if role_allows?(:feature => 'vms_instances_filter_accord')
      {:link => true, :controller => 'vm_or_template', :action => 'explorer', :id => "v-#{record.id}"}
    end
  end
end
