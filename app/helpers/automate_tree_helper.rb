module AutomateTreeHelper
  def submit_embedded_method(fqname)
    if @edit[:new][:embedded_methods].include?(fqname)
      add_flash(_("This embedded method is already selected"), :warning)
    elsif @edit[:new][:embedded_methods].count >= 20
      add_flash(_("It is not allowed to have more than 20 embedded methods"), :warning)
    elsif MiqAeMethod.find_by(:id => (@edit[:ae_method_id])).try(:fqname) == fqname
      add_flash(_("It is not allowed to choose method itself"), :warning)
    else
      @edit[:new][:embedded_methods].push(fqname)
    end
  end

  private :submit_embedded_method

  # Build the tree for catalog item entry point selection and automate copy
  def build_automate_tree(type)
    tree_name = "#{type}_tree".to_sym

    # build the ae tree to show the tree select box for entry point
    if x_active_tree == tree_name && @edit && @edit[:new][:fqname]
      nodes = @edit[:new][:fqname].split("/")
      @open_nodes = []
      # if there are more than one nested namespaces
      nodes.each_with_index do |_node, i|
        if i == nodes.length - 1
          # check if @cls is there, to make sure the class/instance still exists in Automate db
          inst = @cls ? MiqAeInstance.find_by(:class_id => @cls.id, :name => nodes[i]) : nil
          # show this as selected/expanded node when tree loads
          if inst
            @open_nodes.push("aei-#{inst.id}")
            @active_node = "aei-#{inst.id}"
          end
        elsif i == nodes.length - 2
          @cls = MiqAeClass.find_by(:namespace_id => @ns.id, :name => nodes[i])
          @open_nodes.push("aec-#{@cls.id}") if @cls
        else
          @ns = MiqAeNamespace.find_by(:name => nodes[i])
          @open_nodes.push("aen-#{@ns.id}") if @ns
        end
      end
    end

    klass = case type
            when :automate
              TreeBuilderAutomate
            when :automate_catalog
              TreeBuilderAutomateCatalog
            end

    @automate_tree = klass.new(tree_name, @sb)
  end

  # The current_entry_point (eg: ) is saved to previous (eg: :fqname_previous)
  # edit_key => :fqname || :reconfigure_fqname || :retire_fqname
  # previous => :fqname_previous || :reconfigure_fqname_previous || :retire_fqname_previous
  # entry_point_type   => :provision_entry_point_type || :reconfigure_entry_point_type || :retire_entry_point_type
  def previous_entry_point_type(edit_key)
    field = entry_point_fields(edit_key)
    previous = @edit[:new][field[:previous]]
    entry_point_type = @edit[:new][field[:type]]
    @edit[:new][previous[entry_point_type]] = current_entry_point
  end

  def at_tree_select_toggle(type, edit_key)
    automation_type = params[:automation_type] || default_entry_point_type
    current_entry_point = @edit[:new][edit_key] # before updating @edit varibale.
    build_automate_tree(type) if automation_type == embedded_automate_key
    render :update do |page|
      page << javascript_prologue
      tree_close = proc do
        @edit[:ae_tree_select] = false
        @changed = (@edit[:new] != @edit[:current])
        @changed = @edit[:new][:override_source] if params[:controller] == "miq_ae_class" &&
                                                    @edit[:new][:namespace].nil?
        page << javascript_hide("ae_tree_select_div")
        page << javascript_hide("blocker_div")
        page << javascript_for_miq_button_visibility(@changed)
        page << "miqSparkle(false);"
      end
      case params[:button]
      when 'submit'
        @edit[:new][@edit[:ae_field_typ]] = @edit[:active_id]
        page << "$('##{edit_key}_remove').attr('disabled', false);"

        if @edit[:include_domain_prefix] != true && MiqAeDatastore.path_includes_domain?(@edit[:automate_tree_selected_path])
          selected_path = @edit[:automate_tree_selected_path]
          @edit[:automate_tree_selected_path] = selected_path.slice(selected_path.index('/', 1), selected_path.length)
        end

        @edit[:new][edit_key] = @edit[:automate_tree_selected_path]
        if @edit[:new][edit_key]
          page << "$('##{edit_key}').val('#{@edit[:new][edit_key]}');"
          page << "$('##{edit_key}').prop('title', '#{@edit[:new][edit_key]}');"
          inc_domain_chk = 'include_domain_prefix_chk'
          page << javascript_unchecked(inc_domain_chk)
          page << javascript_disable_field(inc_domain_chk)
          @edit[:include_domain_prefix] = nil
          @edit[:domain_prefix_check] = nil

          if edit_key
            field = entry_point_fields(edit_key)
            previous = @edit[:new][field[:previous]]
            entry_point_type = @edit[:new][field[:type]]
            @edit[:new][previous[entry_point_type]] = current_entry_point
          end
        end
        page.replace("form_div", :partial => "copy_objects_form") if params[:controller] == "miq_ae_class"
        tree_close.call

      when 'cancel'
        @changed = @edit[:new] != @edit[:current]
        @edit[:include_domain_prefix] = nil
        @edit[:domain_prefix_check] = nil
        page << javascript_unchecked('include_domain_prefix_chk')
        tree_close.call

      when 'domain'
        @edit[:include_domain_prefix] = @edit[:include_domain_prefix].nil? ? true : nil
        self.x_active_tree = "#{type}_tree".to_sym

      else
        @edit[:ae_field_typ] = params[:typ]
        @changed = @edit[:new][edit_key] != @edit[:automate_tree_selected_path]
        selected_path = nil
        case @edit[:ae_field_typ]
        when 'provision'
          selected_path = @edit[:new][:fqname]
        when 'reconfigure'
          selected_path = @edit[:new][:reconfigure_fqname]
        when 'retire'
          selected_path = @edit[:new][:retire_fqname]
        end
        if @edit[:domain_prefix_check].nil? &&
           selected_path.present? &&
           MiqAeDatastore.path_includes_domain?(selected_path)
          page << javascript_checked('include_domain_prefix_chk')
          @edit[:include_domain_prefix] = true
          @edit[:domain_prefix_check] = true
        end
        self.x_active_tree = "#{type}_tree".to_sym
        page << javascript_show("ae_tree_select_div")
        page << javascript_show("blocker_div")
        page << javascript_show("automate_div")
        page << "$('#automate_div').addClass('modal fade in');"
        @edit[:ae_tree_select] = true
        type = @edit[:ae_field_typ] || params[:typ]
        @edit[:current][:selected] = @edit[:new][:selected] unless @edit[:new][:selected].nil?
        unless @edit[:new][type].nil?
          @edit[:new][:selected] = @edit[:new][type]
          if x_node("#{type}_tree".to_sym)
            page << "miqTreeActivateNodeSilently('automate_tree', '#{@edit[:new][:selected]}');"
          end
        end
      end
    end
  end

  def at_tree_select(edit_key)
    id = parse_nodetype_and_id(params[:id]).last
    if params[:id].start_with?("aei-")
      record = MiqAeInstance.find_by(:id => id)
      @edit[:automate_tree_selected_path] = record.fqname
    elsif params[:id].start_with?("aen-") && controller_name == "miq_ae_class"
      record = MiqAeNamespace.find_by(:id => id)
      record = nil if record.domain?
      @edit[:automate_tree_selected_path] = record.fqname_sans_domain
    elsif params[:id].start_with?("cfp-")
      record = ConfigurationScriptPayload.find_by(:id => params[:id].gsub('cfp-', ''))
      @edit[:automate_tree_selected_path] = record.name
      prefix_key = entry_point_fields(params[:field].to_sym)[:configuration_script_id]
      @edit[:new][prefix_key] = record.id
      @edit[:new]["#{params[:field]}_workflow"] = record.name
    end
    @edit[:new][edit_key] = @edit[edit_key] if @edit[:new][edit_key].nil?
    @edit[:current][:selected] = @edit[:new][:selected].nil? ? "" : @edit[:new][:selected]
    @edit[:new][:selected] = params[:id]
    if record
      # save selected id in edit until save button is pressed
      @edit[:active_id] = params[:id]
      @changed = @edit[:new][edit_key] != @edit[:automate_tree_selected_path]
    end
    inc_domain_chk = 'include_domain_prefix_chk'
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(@changed, 'automate')
      page << (@changed ? javascript_enable_field(inc_domain_chk) : javascript_disable_field(inc_domain_chk))
    end
  end
end
