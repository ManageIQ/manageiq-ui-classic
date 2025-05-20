module OpsController::Settings::Tags
  extend ActiveSupport::Concern

  # AJAX routine for user selected
  def category_select
    if params[:id] == "new"
      javascript_redirect(:action => 'category_new') # redirect to new
    else
      javascript_redirect(:action => 'category_edit', :id => params[:id], :field => params[:field]) # redirect to edit
    end
  end

  # AJAX driven routine to delete a category
  def category_delete
    assert_privileges("region_edit")

    category = Classification.find(params[:id])
    c_name = category.name
    audit = {:event        => "category_record_delete",
             :message      => "[#{c_name}] Record deleted",
             :target_id    => category.id,
             :target_class => "Classification",
             :userid       => session[:userid]}
    if category.destroy
      AuditEvent.success(audit)
      add_flash(_("Category \"%{name}\": Delete successful") % {:name => c_name})
      category_get_all
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace_html('my_company_categories', :partial => 'settings_my_company_categories_tab')
      end
    else
      category.errors.each { |error| add_flash("#{error.attribute.to_s.capitalize} #{error.message}", :error) }
      javascript_flash
    end
  end

  def cancel_category
    if params[:id] == "new"
      add_flash(_("Add of new Category was cancelled by the user"))
    else
      category = Classification.find(params[:id])
      add_flash(_("Edit of Category \"%{name}\" was cancelled by the user") % {:name => category.name})
    end
    get_node_info(x_node)
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace_html('my_company_categories', :partial => 'settings_my_company_categories_tab')
    end
  end

  def add_category
    category = Classification.find(params[:id])
    add_flash(_("Category \"%{name}\" was added") % {:name => category.name})
    get_node_info(x_node)
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace_html('my_company_categories', :partial => 'settings_my_company_categories_tab')
    end
  end

  def save_category
    category = Classification.find(params[:id])
    add_flash(_("Category \"%{name}\" was saved") % {:name => category.name})
    get_node_info(x_node)
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqScrollTop();" if @flash_array.present?
      page.replace_html('my_company_categories', :partial => 'settings_my_company_categories_tab')
    end
  end

  def category_form
    replace_right_cell(:nodetype => "ce")
  end

  def category_edit
    assert_privileges("region_edit")

    case params[:button]
    when "cancel"
      cancel_category
    when "add"
      add_category
    when "save"
      save_category
    when nil
      category_form
    end
  end

  # AJAX driven routine to check for changes in ANY field on the user form
  def category_field_changed
    assert_privileges("region_edit")

    return unless load_edit("category_edit__#{params[:id]}", "replace_cell__explorer")

    category_get_form_vars
    @changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      if @refresh_div
        page.replace(@refresh_div, :partial => @refresh_partial,
                                   :locals  => {:type => "classifications", :action_url => 'category_field_changed'})
      end
      page << javascript_for_miq_button_visibility_changed(@changed)
    end
  end

  # A new classificiation category was selected
  def ce_new_cat
    assert_privileges("region_edit")

    ce_get_form_vars
    if params[:classification_name]
      @cat = Classification.lookup_by_name(params["classification_name"])
      ce_build_screen # Build the Classification Edit screen
      render :update do |page|
        page << javascript_prologue
        page.replace(:tab_div, :partial => "settings_co_tags_tab")
      end
    end
  end

  # AJAX driven routine to select a classification entry
  def ce_select
    assert_privileges("region_edit")

    ce_get_form_vars
    if params[:id] == "new"
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace("classification_entries_div", :partial => "classification_entries", :locals => {:entry => "new", :edit => true})
        page << javascript_focus('entry_name')
        page << "$('#entry_name').select();"
      end
      session[:entry] = "new"
    else
      entry = Classification.find(params[:id])
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page << "miqScrollTop();" if @flash_array.present?
        page.replace("classification_entries_div", :partial => "classification_entries", :locals => {:entry => entry, :edit => true})
        page << javascript_focus("entry_#{j(params[:field])}")
        page << "$('#entry_#{j(params[:field])}').select();"
      end
      session[:entry] = entry
    end
  end

  # Method to return all categories and their information required for the list.
  def all_categories
    categories = Classification.categories.sort_by(&:description)
    render :json => {
      :categories => categories.map do |category|
        {:id => category.id, :name => category.name, :description => category.description}
      end
    }
  end

  # Method to return a category and their entries.
  def category_information
    category = Classification.find_by(:id => params[:id])
    render :json => {
      :category => category,
      :entries  => category.entries.sort_by(&:name).map do |entry|
        {:id => entry.id, :name => entry.name, :description => entry.description}
      end
    }
  end

  # Method to return an entry from a selected category.
  def category_entries
    category = Classification.find_by(:id => params[:id])
    entries = category.entries
    entry = entries.find_by(:id => params[:entry_id])
    render :json => {:id => entry.id, :name => entry.name, :description => entry.description}
  end

  # Method which gets executed on category entry add/edit form submission.
  def ce_accept
    category = Classification.find_by(:id => params[:id])
    case params[:button]
    when "add"
      entry = category.entries.create(:name => params[:name], :description => params[:description])
      response = {:type => 'success', :entry => entry, :category_id => params[:id]}
    when "save"
      entry = category.entries.find(params[:entry_id])
      session[:entry] = entry
      entry.name        = params[:name]
      entry.description = params[:description]
      entry.save
      response = {:type => 'success', :entry => entry, :category_id => params[:id]}
    end
    unless entry.errors.empty?
      response[:type] = 'danger'
      response[:message] = error_message(entry.errors)
    end
    render :json => response
  end

  # Method to delete a classification entry.
  def ce_delete
    category = Classification.find_by(:id => params[:id])
    entry = category.entries.find_by(:id => params[:entry_id])
    if entry.destroy
      render :json => {:type => 'success', :entry => entry, :category_id => params[:id]}
    else
      render :json => {:type => 'danger', :entry => entry, :message => error_message(entry.errors), :category_id => params[:id]}
    end
  end

  def error_message(errors)
    message = ""
    errors.each do |error|
      msg = error.type || error.message
      message += "#{error.attribute.to_s.capitalize} #{msg}"
    end
    message
  end

  def ce_get_form_vars
    @edit = session[:edit]
    @cats = session[:config_cats]
    @cat = Classification.lookup_by_name(session[:config_cat])
    nil
  end

  private

  # Build the classification edit screen from the category record in @cat
  def ce_build_screen
    session[:config_cats] = @cats
    session[:config_cat] = @cat.name
    session[:entry] = nil
  end

  # Build the audit object when a record is created, including all of the new fields
  def ce_created_audit(entry)
    msg = _("Category %{description} [%{name}] record created (") % {:description => @cat.description,
                                                                     :name        => entry.name}
    event = "classification_entry_add"
    i = 0
    params["entry"].each do |k, _v|
      msg += ", " if i.positive?
      i += 1
      msg = msg + k.to_s + ":[" + params["entry"][k].to_s + "]"
    end
    msg += ")"
    {:event => event, :target_id => entry.id, :target_class => entry.class.base_class.name, :userid => session[:userid], :message => msg}
  end

  # Build the audit object when a record is saved, including all of the changed fields
  def ce_saved_audit(entry)
    msg = _("Category %{description} [%{name}] record updated (") % {:description => @cat.description,
                                                                     :name        => entry.name}
    event = "classification_entry_update"
    i = 0
    if entry.name != session[:entry].name
      i += 1
      msg += _("name:[%{session}] to [%{name}]") % {:session => session[:entry].name, :name => entry.name}
    end
    if entry.description != session[:entry].description
      msg += ", " if i.positive?
      msg += _("description:[%{session}] to [%{name}]") % {:session => session[:entry].description,
                                                           :name    => entry.description}
    end
    msg += ")"
    {:event => event, :target_id => entry.id, :target_class => entry.class.base_class.name, :userid => session[:userid], :message => msg}
  end

  # Get variables from category edit form
  def category_get_form_vars
    @category = @edit[:category]
    copy_params_if_present(@edit[:new], params, %i[name description example_text])
    @edit[:new][:show] = (params[:show] == 'true') if params[:show]
    @edit[:new][:perf_by_tag] = (params[:perf_by_tag] == "true") if params[:perf_by_tag]
    @edit[:new][:single_value] = (params[:single_value] == "true") if params[:single_value]
  end

  def category_get_all
    cats = Classification.categories.sort_by(&:name) # Get the categories, sort by name
    @categories = []                                 # Classifications array for first chooser
    cats.each do |c|
      next if c.read_only? # Show the non-read_only categories

      cat = {}
      cat[:id] = c.id
      cat[:description] = c.description
      cat[:name] = c.name
      cat[:show] = c.show
      cat[:single_value] = c.single_value
      cat[:perf_by_tag] = c.perf_by_tag
      cat[:default] = c.default
      @categories.push(cat)
    end
  end

  # Set form variables for category add/edit
  def category_set_form_vars
    @edit = {}
    @edit[:category] = @category
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "category_edit__#{@category.id || "new"}"
    @edit[:new][:name] = @category.name
    @edit[:new][:description] = @category.description
    @edit[:new][:show] = @category.show
    @edit[:new][:perf_by_tag] = @category.perf_by_tag
    @edit[:new][:default] = @category.default
    @edit[:new][:single_value] = @category.single_value
    @edit[:new][:example_text] = @category.example_text
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Set form variables for category add/edit
  def category_set_new_form_vars
    @edit = {}
    @edit[:user] = @user
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "category_edit__new"
    @edit[:new][:name] = nil
    @edit[:new][:description] = nil
    @edit[:new][:show] = true
    @edit[:new][:perf_by_tag] = false
    @edit[:new][:default] = false
    @edit[:new][:single_value] = true
    @edit[:new][:example_text] = nil
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Set category record variables to new values
  def category_set_record_vars(category)
    category.description = @edit[:new][:description]
    category.example_text = @edit[:new][:example_text]
    category.show = @edit[:new][:show]
    category.perf_by_tag = @edit[:new][:perf_by_tag]
  end
end
