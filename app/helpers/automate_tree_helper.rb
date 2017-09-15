module AutomateTreeHelper
  def submit_embedded_method
    if @edit[:new][:embedded_methods].include?(@edit[:automate_tree_selected_path])
      add_flash(_("This embedded method is already selected"), :warning)
    elsif @edit[:new][:embedded_methods].count >= 20
      add_flash(_("It is not allowed to have more than 20 embedded methods"), :warning)
    elsif MiqAeMethod.find_by(:id => (@edit[:ae_method_id])).try(:fqname) == @edit[:automate_tree_selected_path]
      add_flash(_("It is not allowed to choose method itself"), :warning)
    else
      @edit[:new][:embedded_methods].push(@edit[:automate_tree_selected_path])
    end
  end

  def include_domain_prefix
    if MiqAeDatastore.path_includes_domain?(@edit[:automate_tree_selected_path])
      selected_path = @edit[:automate_tree_selected_path]
      @edit[:automate_tree_selected_path] = selected_path.slice(selected_path.index('/', 1), selected_path.length)
    end
  end
  private :include_domain_prefix, :submit_embedded_method

  def at_tree_select_toggle(edit_key)
    edit_key == :method ? build_ae_tree(:ae_methods, :automate_tree) : build_ae_tree(:automate, :automate_tree)
    if params[:button] == 'submit'
      include_domain_prefix if @edit[:include_domain_prefix].nil?
      submit_embedded_method if edit_key == :method
    end
    render :update do |page|
      page << javascript_prologue
      tree_close = proc do
        @edit[:ae_tree_select] = false
        @changed = (@edit[:new] != @edit[:current])
        @changed = @edit[:new][:override_source] if params[:controller] == "miq_ae_class" &&
                                                    @edit[:new][:namespace].nil? && edit_key != :method
        page << javascript_hide("ae_tree_select_div")
        page << javascript_hide("blocker_div")
        page << javascript_for_miq_button_visibility(@changed)
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << javascript_show("flash_msg_div")
        page << "miqSparkle(false);"
      end
      case params[:button]
      when 'submit'
        if edit_key != :method
          @edit[:new][@edit[:ae_field_typ]] = @edit[:active_id]
          page << set_element_visible("#{edit_key}_div", true)
          @edit[:new][edit_key] = @edit[:automate_tree_selected_path]
        end
        if @edit[:new][edit_key]
          page << "$('##{edit_key}').val('#{@edit[:new][edit_key]}');"
          page << "$('##{edit_key}').prop('title', '#{@edit[:new][edit_key]}');"
          inc_domain_chk = 'include_domain_prefix_chk'
          page << javascript_unchecked(inc_domain_chk)
          page << javascript_disable_field(inc_domain_chk)
          @edit[:include_domain_prefix] = nil
          @edit[:domain_prefix_check] = nil
        end
        if edit_key == :method
          page.replace("embedded_methods_div", :partial => "embedded_methods")
        elsif params[:controller] == "miq_ae_class"
          page.replace("form_div", :partial => "copy_objects_form")
        end
        tree_close.call

      when 'cancel'
        @changed = @edit[:new] != @edit[:current]
        @edit[:include_domain_prefix] = nil
        @edit[:domain_prefix_check] = nil
        page << javascript_unchecked('include_domain_prefix_chk')
        tree_close.call

      when 'domain'
        @edit[:include_domain_prefix] = @edit[:include_domain_prefix].nil? ? true : nil
        self.x_active_tree = :automate_tree

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
           !selected_path.blank? &&
           MiqAeDatastore.path_includes_domain?(selected_path)
          page << javascript_checked('include_domain_prefix_chk')
          @edit[:include_domain_prefix] = true
          @edit[:domain_prefix_check] = true
        end
        self.x_active_tree = :automate_tree
        page << javascript_show("ae_tree_select_div")
        page << javascript_show("blocker_div")
        page << javascript_show("automate_div")
        page << "$('#automate_div').addClass('modal fade in');"
        @edit[:ae_tree_select] = true
        type = @edit[:ae_field_typ] || params[:typ]
        @edit[:current][:selected] = @edit[:new][:selected] unless @edit[:new][:selected].nil?
        unless @edit[:new][type].nil?
          @edit[:new][:selected] = @edit[:new][type]
          if x_node(:automate_tree)
            page << "miqTreeActivateNodeSilently('automate_tree', '#{@edit[:new][:selected]}');"
          end
        end
      end
    end
  end

  def at_tree_select(edit_key)
    id = from_cid(parse_nodetype_and_id(params[:id]).last)
    if params[:id].start_with?("aei-")
      record = MiqAeInstance.find_by_id(id)
    elsif params[:id].start_with?("aen-") && controller_name == "miq_ae_class" && edit_key != :method
      record = MiqAeNamespace.find_by_id(id)
      record = nil if record.domain?
    elsif params[:id].start_with?("aem-") && controller_name == "miq_ae_class"
      record = MiqAeMethod.find_by(:id => id)
    end
    if edit_key != :method
      @edit[:new][edit_key] = @edit[edit_key] if @edit[:new][edit_key].nil?
      @edit[:current][:selected] = @edit[:new][:selected].nil? ? "" : @edit[:new][:selected]
      @edit[:new][:selected] = params[:id]
    end
    if record
      @edit[:automate_tree_selected_path] = controller_name == "miq_ae_class" && edit_key != :method ? record.fqname_sans_domain : record.fqname
      # save selected id in edit until save button is pressed
      @edit[:active_id] = params[:id]
      @changed = @edit[:new][edit_key] != @edit[:automate_tree_selected_path]
    end
    inc_domain_chk = 'include_domain_prefix_chk'
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(@changed, 'automate')
      @changed ? page << javascript_enable_field(inc_domain_chk) : page << javascript_disable_field(inc_domain_chk)
    end
  end
end
