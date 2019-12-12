module MiqAeCustomizationController::CustomButtons
  extend ActiveSupport::Concern

  private

  def ab_get_node_info(node)
    @nodetype = node.split("_")
    nodeid = node.split("-")

    # initializing variables to hold data for selected node
    @custom_button = nil
    @sb[:button_groups] = nil
    @sb[:buttons] = nil

    if @nodetype[0] == "root"
      @right_cell_text = _("All Object Types")
      if session[:resolve]
        @resolve = session[:resolve]
      else
        build_resolve_screen
      end
      @custom_button_entities = @resolve[:target_classes].each_with_object({}) do |(k, v), result|
        result[v] = "ab_#{k}"
      end
    elsif @nodetype[0] == "xx-ab" && nodeid.length == 2 # one of the CI's node selected
      @right_cell_text = _("%{typ} Button Groups") % {:typ => @resolve[:target_classes][@nodetype[1]]}
      @sb[:applies_to_class] = x_node.split('-').last.split('_').last
      asets = CustomButtonSet.find_all_by_class_name(@nodetype[1])
      @sb[:button_groups] = []
      @sb[:button_groups].push("[Unassigned Buttons]")
      if asets.present?
        asets.each do |aset|
          group = {}
          group[:id] = aset.id
          group[:name] = aset.name
          group[:description] = aset.description
          group[:button_icon] = aset.set_data[:button_icon]
          group[:button_color] = aset.set_data[:button_color]
          @sb[:button_groups].push(group) unless @sb[:button_groups].include?(group)
        end
      end
    elsif @nodetype.length == 1 && nodeid[1] == "ub" # Unassigned buttons group selected
      @sb[:buttons] = []
      @right_cell_text = _("%{typ} Button Group \"Unassigned Buttons\"") % {:typ => @resolve[:target_classes][nodeid[2]]}
      uri = CustomButton.buttons_for(nodeid[2]).sort_by(&:name)
      if uri.present?
        uri.each do |b|
          next if b.parent.present?

          button = {
            :name         => b.name,
            :id           => b.id,
            :description  => b.description,
            :button_icon  => b.options[:button_icon],
            :button_color => b.options[:button_color]
          }
          @sb[:buttons].push(button)
        end
      end
    elsif (@nodetype[0] == "xx-ab" && nodeid.length == 4) || (nodeid.length == 4 && nodeid[1] == "ub") # button selected
      @record = @custom_button = CustomButton.find(nodeid.last)
      build_resolve_screen
      @resolve[:new][:attrs] = []
      if @custom_button.uri_attributes
        default_attributes = if @custom_button[:options].try(:[], :button_type)
                               %w[request service_template_name hosts]
                             else
                               %w[request]
                             end
        @custom_button.uri_attributes.each do |attr|
          if attr[0] != "object_name" && attr[0] != "request" && !default_attributes.include?(attr[0].to_s)
            @resolve[:new][:attrs].push(attr) unless @resolve[:new][:attrs].include?(attr)
          end
        end
        @resolve[:new][:object_request] = @custom_button.uri_attributes["request"]
      end
      @sb[:user_roles] = []
      if @custom_button.visibility && @custom_button.visibility[:roles] && @custom_button.visibility[:roles][0] != "_ALL_"
        MiqUserRole.all.sort_by(&:name).each do |r|
          @sb[:user_roles].push(r.name) if @custom_button.visibility[:roles].include?(r.name)
        end
      end
      dialog_id = @custom_button.resource_action.dialog_id
      @sb[:dialog_label] = dialog_id ? Dialog.find(dialog_id).label : ""
      @resolve[:new][:target_class] = if @nodetype[0].starts_with?("-ub-")
                                        # selected button is under unassigned folder
                                        @nodetype[0].sub('-ub-', '')
                                      else
                                        @nodetype[1]
                                      end
      @visibility_expression_table = exp_build_table(@custom_button.visibility_expression.exp) if @custom_button.visibility_expression.kind_of?(MiqExpression)
      @enablement_expression_table = exp_build_table(@custom_button.enablement_expression.exp) if @custom_button.enablement_expression.kind_of?(MiqExpression)
      @right_cell_text = _("Button \"%{name}\"") % {:name => @custom_button.name}
    else # assigned buttons node/folder
      @sb[:applies_to_class] = @nodetype[1]
      @record = CustomButtonSet.find(nodeid.last)
      @right_cell_text = _("%{typ} Button Group \"%{name}\"") %
                         {:typ  => @resolve[:target_classes][@nodetype[1]],
                          :name => @record.name.split("|").first}
      @sb[:button_group] = {}
      @sb[:button_group][:text] = @sb[:button_group][:hover_text] = @sb[:button_group][:display]
      @sb[:buttons] = []
      button_order = @record[:set_data] && @record[:set_data][:button_order] ? @record[:set_data][:button_order] : nil
      button_order&.each do |bidx| # show assigned buttons in order they were saved
        @record.members.each do |b|
          next if bidx != b.id

          button = {:name         => b.name,
                    :id           => b.id,
                    :description  => b.description,
                    :button_icon  => b.options[:button_icon],
                    :button_color => b.options[:button_color]}
          @sb[:buttons].push(button) unless @sb[:buttons].include?(button)
        end
      end
    end
    @right_cell_div = "ab_list"
  end
end
