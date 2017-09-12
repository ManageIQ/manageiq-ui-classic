class ApplicationHelper::ToolbarBuilder
  include MiqAeClassHelper
  include RestfulControllerMixin

  def call(toolbar_name)
    build_toolbar(toolbar_name)
  end

  # Loads the toolbar sent in parameter `toolbar_name`, and builds the buttons
  # in the toolbar, unless the group of buttons is meant to be skipped.
  #
  # Returns built toolbar loaded in instance variable `@toolbar`, or `nil`, if
  # no buttons should be in the toolbar.
  def build_toolbar(toolbar_name)
    return nil if toolbar_name.nil?

    build_toolbar_setup
    toolbar_class = toolbar_class(toolbar_name)
    build_toolbar_from_class(toolbar_class)
  end

  def build_toolbar_by_class(toolbar_class)
    build_toolbar_setup
    build_toolbar_from_class(toolbar_class)
  end

  private

  delegate :request, :current_user, :to => :@view_context
  delegate :role_allows?, :model_for_vm, :rbac_common_feature_for_buttons, :to => :@view_context
  delegate :x_tree_history, :x_node, :x_active_tree, :to => :@view_context
  delegate :settings, :is_browser?, :is_browser_os?, :to => :@view_context

  def initialize(view_context, view_binding, instance_data)
    @view_context = view_context
    @view_binding = view_binding
    @instance_data = instance_data

    instance_data.each do |name, value|
      instance_variable_set(:"@#{name}", value)
    end
  end

  def eval(code)
    @view_binding.eval(code)
  end

  def safer_eval(code)
    code.to_s =~ /\#{/ ? eval("\"#{code}\"") : code
  end

  # Parses the generic toolbars name and returns his class
  def predefined_toolbar_class(tb_name)
    class_name = 'ApplicationHelper::Toolbar::' + ActiveSupport::Inflector.camelize(tb_name.sub(/_tb$/, ''))
    class_name.constantize
  end

  def controller
    @view_context.respond_to?(:controller) ? @view_context.controller : @view_context
  end

  def model_for_custom_toolbar
    controller.instance_eval { @tree_selected_model } || controller.class.model
  end

  # According to toolbar name in parameter `toolbar_name` either returns class
  # for generic toolbar, or starts building custom toolbar
  def toolbar_class(toolbar_name)
    if Mixins::CustomButtons::Result === toolbar_name
      custom_toolbar_class(toolbar_name)
    else
      predefined_toolbar_class(toolbar_name)
    end
  end

  # Creates a button and sets it's properties
  def toolbar_button(inputs, props)
    button_class = inputs[:klass] || ApplicationHelper::Button::Basic
    props[:options] = inputs[:options] if inputs[:options]
    button = button_class.new(@view_context, @view_binding, @instance_data, props)
    button.skipped? ? nil : apply_common_props(button, inputs)
  end

  # Build select button and its child buttons
  def build_select_button(bgi, index)
    bs_children = false
    props = toolbar_button(
      bgi,
      :id     => bgi[:id],
      :type   => :buttonSelect,
      :img    => img = img_value(bgi),
      :imgdis => img,
    )
    return nil if props.nil?

    current_item = props
    current_item[:items] ||= []
    any_visible = false
    bgi[:items].each_with_index do |bsi, bsi_idx|
      if bsi.key?(:separator)
        props = ApplicationHelper::Button::Separator.new(:id => "sep_#{index}_#{bsi_idx}", :hidden => !any_visible)
      else
        bs_children = true
        props = toolbar_button(
          bsi,
          :child_id => bsi[:id],
          :id       => bgi[:id] + "__" + bsi[:id],
          :type     => :button,
          :img      => img = img_value(bsi),
          :img_url  => ActionController::Base.helpers.image_path("toolbars/#{img}"),
          :imgdis   => img,
        )
        next if props.nil?
      end
      update_common_props(bsi, props) unless bsi.key?(:separator)
      current_item[:items] << props

      any_visible ||= !props[:hidden] && props[:type] != :separator
    end
    current_item[:items].reverse_each do |item|
      break if !item[:hidden] && item[:type] != :separator
      item[:hidden] = true if item[:type] == :separator
    end
    current_item[:hidden] = !any_visible

    if bs_children
      @sep_added = true # Separator has officially been added
      @sep_needed = true # Need a separator from now on
    end
    current_item
  end

  # Set properties for button
  def apply_common_props(button, input)
    button.update(
      :icon    => input[:icon],
      :color   => input[:color],
      :name    => button[:id],
      :hidden  => button[:hidden] || !!input[:hidden],
      :pressed => input[:pressed],
      :onwhen  => input[:onwhen],
      :data    => input[:data]
    )

    button[:enabled] = input[:enabled]
    %i(title text confirm enabled).each do |key|
      unless input[key].blank?
        button[key] = button.localized(key, input[key])
      end
    end
    button[:url_parms] = update_url_parms(safer_eval(input[:url_parms])) unless input[:url_parms].blank?

    if input[:popup] # special behavior: button opens window_url in a new window
      button[:popup] = true
      button[:window_url] = "/#{request.parameters["controller"]}#{input[:url]}"
    end

    if input[:association_id] # special behavior to pass in id of association
      button[:url_parms] = "?show=#{request.parameters[:show]}"
    end

    button.calculate_properties
    button
  end

  # Build single button
  def build_normal_button(bgi, index)
    @sep_needed = true
    props = toolbar_button(
      bgi,
      :id      => bgi[:id],
      :type    => :button,
      :img     => img = "#{get_image(bgi[:image], bgi[:id]) ? get_image(bgi[:image], bgi[:id]) : bgi[:id]}.png",
      :img_url => ActionController::Base.helpers.image_path("toolbars/#{img}"),
      :imgdis  => "#{bgi[:image] || bgi[:id]}.png",
    )
    return nil if props.nil?

    props[:hidden] = false
    _add_separator(index)
    props
  end

  def _add_separator(index)
    # Add a separator, if needed, before this button
    if !@sep_added && @sep_needed
      if @groups_added.include?(index) && @groups_added.length > 1
        @toolbar << ApplicationHelper::Button::Separator.new(:id => "sep_#{index}")
        @sep_added = true
      end
    end
    @sep_needed = true # Button was added, need separators from now on
  end

  def img_value(button)
    "#{button[:image] || button[:id]}.png"
  end

  # Build button with more states
  def build_twostate_button(bgi, index)
    props = toolbar_button(
      bgi,
      :id     => bgi[:id],
      :type   => :buttonTwoState,
      :img    => img = img_value(bgi),
      :imgdis => img,
    )
    return nil if props.nil?

    props[:selected] = twostate_button_selected(bgi[:id])

    _add_separator(index)
    props
  end

  # According to button type in toolbar definition calls appropriate method
  def build_button(bgi, index)
    props = case bgi[:type]
            when :buttonSelect   then build_select_button(bgi, index)
            when :button         then build_normal_button(bgi, index)
            when :buttonTwoState then build_twostate_button(bgi, index)
            end

    unless props.nil?
      @toolbar << update_common_props(bgi, props)
    end
  end

  # @button_group is set in a controller
  #
  def group_skipped?(name)
    @button_group && (!name.starts_with?(@button_group + "_") &&
      !name.starts_with?("custom") && !name.starts_with?("dialog") &&
      !name.starts_with?("miq_dialog") && !name.starts_with?("custom_button") &&
      !name.starts_with?("instance_") && !name.starts_with?("image_")) &&
       !%w(record_summary summary_main summary_download tree_main
           x_edit_view_tb history_main ems_container_dashboard ems_infra_dashboard).include?(name)
  end

  def create_custom_button(input, model, record)
    button_id = input[:id]
    button_name = input[:name].to_s
    record_id = record.present? ? record.id : 'LIST'
    button = {
      :id        => "custom__custom_#{button_id}",
      :type      => :button,
      :icon      => "#{input[:image]} fa-lg",
      :color     => input[:color],
      :title     => !input[:enabled] && input[:disabled_text] ? input[:disabled_text] : input[:description].to_s,
      :enabled   => input[:enabled],
      :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
      :url       => "button",
      :url_parms => "?id=#{record_id}&button_id=#{button_id}&cls=#{model}&pressed=custom_button&desc=#{button_name}"
    }
    button[:text] = button_name if input[:text_display]
    button
  end

  def create_raw_custom_button_hash(cb, record)
    record_id = record.present? ? record.id : 'LIST'
    {
      :id            => cb.id,
      :class         => cb.applies_to_class,
      :description   => cb.description,
      :name          => cb.name,
      :image         => cb.options[:button_icon],
      :color         => cb.options[:button_color],
      :text_display  => cb.options.key?(:display) ? cb.options[:display] : true,
      :enabled       => cb.evaluate_enablement_expression_for(record),
      :disabled_text => cb.disabled_text,
      :target_object => record_id
    }
  end

  def custom_button_selects(model, record, toolbar_result)
    get_custom_buttons(model, record, toolbar_result).collect do |group|
      buttons = group[:buttons].collect { |b| create_custom_button(b, model, record) }

      props = {
        :id      => "custom_#{group[:id]}",
        :type    => :buttonSelect,
        :icon    => "#{group[:image]} fa-lg",
        :color   => group[:color],
        :title   => group[:description],
        :enabled => record ? true : buttons.all?{ |button| button[:enabled]},
        :items   => buttons
      }
      props[:text] = group[:text] if group[:text_display]

      {:name => "custom_buttons_#{group[:text]}", :items => [props]}
    end
  end

  def custom_toolbar_class(toolbar_result)
    model = @record ? @record.class : model_for_custom_toolbar
    build_custom_toolbar_class(model, @record, toolbar_result)
  end

  def build_custom_toolbar_class(model, record, toolbar_result)
    # each custom toolbar is an anonymous subclass of this class

    toolbar = Class.new(ApplicationHelper::Toolbar::Basic)

    # This creates several drop-down (select) with custom buttons.
    # Each select is placed into a separate group.
    custom_button_selects(model, record, toolbar_result).each do |button_group|
      toolbar.button_group(button_group[:name], button_group[:items])
    end

    # For Service, we include buttons for ServiceTemplate.
    # These buttons are added as a single group with multiple buttons
    if record.present?
      service_buttons = record_to_service_buttons(record)
      unless service_buttons.empty?
        buttons = service_buttons.collect { |b| create_custom_button(b, model, record) }
        toolbar.button_group("custom_buttons_", buttons)
      end
    end

    toolbar
  end

  def button_class_name(model)
    # Service Buttons are defined in the ServiceTemplate class
    model >= Service ? "ServiceTemplate" : model.base_model.name
  end

  def service_template_id(record)
    case record
    when Service then         record.service_template_id
    when ServiceTemplate then record.id
    end
  end

  def record_to_service_buttons(record)
    return [] unless record.kind_of?(Service)
    return [] if record.service_template.nil?
    record.service_template.custom_buttons.collect { |cb| create_raw_custom_button_hash(cb, record) }
  end

  def get_custom_buttons(model, record, toolbar_result)
    cbses = CustomButtonSet.find_all_by_class_name(button_class_name(model), service_template_id(record))
    cbses = CustomButtonSet.filter_with_visibility_expression(cbses, record)

    cbses.sort_by { |cbs| cbs.set_data[:group_index] }.collect do |cbs|
      group = {
        :id           => cbs.id,
        :text         => cbs.name.split("|").first,
        :description  => cbs.description,
        :image        => cbs.set_data[:button_icon],
        :color        => cbs.set_data[:button_color],
        :text_display => cbs.set_data.key?(:display) ? cbs.set_data[:display] : true
      }

      available = cbs.custom_buttons.select(&:visible_for_current_user?)
      available = available.select do |b|
        cbs.members.include?(b) && toolbar_result.plural_form_matches(b)
      end

      group[:buttons] = available.collect { |cb| create_raw_custom_button_hash(cb, record) }.uniq
      if cbs.set_data[:button_order] # Show custom buttons in the order they were saved
        ordered_buttons = []
        cbs.set_data[:button_order].each do |bidx|
          group[:buttons].each do |b|
            if bidx == b[:id] && !ordered_buttons.include?(b)
              ordered_buttons.push(b)
              break
            end
          end
        end
        group[:buttons] = ordered_buttons
      end
      group
    end
  end

  def get_image(img, b_name)
    # to change summary screen button to green image
    return "summary-green" if b_name == "show_summary" && %w(miq_schedule miq_task scan_profile).include?(@layout)
    img
  end

  # Determine if a button should be selected for buttonTwoState
  def twostate_button_selected(id)
    return true if id.starts_with?("view_") && id.ends_with?("textual")  # Summary view buttons
    return true if @gtl_type && id.starts_with?("view_") && id.ends_with?(@gtl_type)  # GTL view buttons
    return true if @ght_type && id.starts_with?("view_") && id.ends_with?(@ght_type)  # GHT view buttons on report show
    return true if id.starts_with?("tree_") && id.ends_with?(settings(:views, :treesize).to_i == 32 ? "large" : "small")
    return true if id.starts_with?("compare_") && id.ends_with?(settings(:views, :compare))
    return true if id.starts_with?("drift_") && id.ends_with?(settings(:views, :drift))
    return true if id == "compare_all"
    return true if id == "drift_all"
    return true if id.starts_with?("comparemode_") && id.ends_with?(settings(:views, :compare_mode))
    return true if id.starts_with?("driftmode_") && id.ends_with?(settings(:views, :drift_mode))
    return true if id == "view_dashboard" && @showtype == "dashboard"
    return true if id == "view_topology" && @showtype == "topology"
    return true if id == "view_summary" && @showtype == "main"
    false
  end

  def url_for_button(name, url_tpl, controller_restful)
    url = safer_eval(url_tpl)

    if %w(view_grid view_tile view_list).include?(name) && controller_restful && url =~ %r{^\/(\d+|\d+r\d+)\?$}
      # handle restful routes - we want just / if the url is just an id
      url = '/'
    end

    url
  end

  def update_common_props(item, props)
    props[:url] = url_for_button(props[:id], item[:url], controller_restful?) if item[:url]
    props[:explorer] = true if @explorer && !item[:url] # Add explorer = true if ajax button
    props
  end

  def update_url_parms(url_parm)
    return url_parm unless url_parm =~ /=/

    keep_parms = %w(bc escape menu_click sb_controller)
    query_string = Rack::Utils.parse_query URI("?#{request.query_string}").query
    query_string.delete_if { |k, _v| !keep_parms.include? k }

    url_parm_hash = preprocess_url_param(url_parm)
    query_string.merge!(url_parm_hash)
    URI.decode("?#{query_string.to_query}")
  end

  def preprocess_url_param(url_parm)
    parse_questionmark = /^\?/.match(url_parm)
    parse_ampersand = /^&/.match(url_parm)
    url_parm = parse_questionmark.post_match if parse_questionmark.present?
    url_parm = parse_ampersand.post_match if parse_ampersand.present?
    encoded_url = URI.encode(url_parm)
    Rack::Utils.parse_query URI("?#{encoded_url}").query
  end

  def build_toolbar_setup
    @toolbar = []
    @groups_added = []
    @sep_needed = false
    @sep_added = false
  end

  def build_toolbar_from_class(toolbar_class)
    toolbar_class.definition.each_with_index do |(name, group), group_index|
      next if group_skipped?(name)

      @sep_added = false
      @groups_added.push(group_index)
      case group
      when ApplicationHelper::Toolbar::Group
        group.buttons.each do |bgi|
          build_button(bgi, group_index)
        end
      when ApplicationHelper::Toolbar::Custom
        rendered_html = group.render(@view_context).tr('\'', '"')
        group[:args][:html] = ERB::Util.html_escape(rendered_html).html_safe
        @toolbar << group
      end
    end

    @toolbar = nil if @toolbar.empty?
    @toolbar
  end
end
