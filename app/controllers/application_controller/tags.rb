module ApplicationController::Tags
  extend ActiveSupport::Concern

  # Edit user, group or tenant tags
  def tagging_edit(db = nil, assert = true)
    assert_privileges("#{@display && @display != "main" ? @display.singularize : controller_for_common_methods}_tag") if assert
    @explorer = true if request.xml_http_request? # Ajax request means in explorer

    @tagging = session[:tag_db] = params[:db] || db if params[:db] || db
    @tagging ||= session[:tag_db] if session[:tag_db]
    case params[:button]
    when "cancel"
      tagging_edit_tags_cancel
    when "save", "add"
      tagging_edit_tags_save
    when "reset", nil # Reset or first time in
      tagging_edit_tags_reset
    end
  end

  def service_tag
    tagging_edit('Service')
  end

  def container_tag
    tagging_edit('Container')
  end

  def automation_manager_provider_tag
    tagging_edit('ManageIQ::Providers::AnsibleTower::AutomationManager')
  end

  def configuration_manager_provider_tag
    tagging_edit('ManageIQ::Providers::ConfigurationManager')
  end

  alias image_tag tagging_edit
  alias instance_tag tagging_edit
  alias vm_tag tagging_edit
  alias miq_template_tag tagging_edit
  alias storage_tag tagging_edit
  alias infra_networking_tag tagging_edit

  private ############################

  def get_tag_items
    record_ids = find_records_with_rbac(
      @tagging.instance_of?(String) ? @tagging.safe_constantize : @tagging,
      checked_or_params
    ).map(&:id)
    session[:tag_items] = record_ids
    session[:assigned_filters] = assigned_filters
  end

  def tagging_edit_tags_reset
    get_tag_items if @explorer
    @object_ids = session[:tag_items]
    @sb[:rec_id] = params[:id] || session[:tag_items][0]
    @tagging = session[:tag_db].to_s
    if params[:button] == "reset"
      id = params[:id] if params[:id]
      return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")

      @object_ids = @edit[:object_ids]
    end
    @in_a_form = true
    tagging_tags_set_form_vars
    @display = nil
    session[:changed] = false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
    @title = _('Tag Assignment')
    if tagging_explorer_controller?
      @refresh_partial = "layouts/tagging"
      replace_right_cell(:action => @sb[:action]) if params[:button]
    else
      render "shared/views/tagging_edit"
    end
  end

  # Set form vars for tag editor
  def tagging_tags_set_form_vars
    @edit = {}
    @edit[:new] = {}
    @edit[:key] = "#{@tagging}_edit_tags__#{@sb[:rec_id]}"
    @edit[:object_ids] = @object_ids
    @edit[:tagging] = @tagging
    tag_edit_build_screen
    build_targets_hash(@tagitems)

    @edit[:current] = copy_hash(@edit[:new])
  end

  def tagging_edit_tags_cancel
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")

    add_flash(_("Tag Edit was cancelled by the user"))
    session[:tag_items] = nil # reset tag_items in session
    @edit = nil # clean out the saved info
    if tagging_explorer_controller?
      @sb[:action] = nil
      replace_right_cell
    else
      session[:flash_msgs] = @flash_array.dup # Put msg in session for next transaction to display
      javascript_redirect(previous_breadcrumb_url)
    end
  end

  def tagging_edit_tags_save
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")

    tagging_save_tags

    @edit = nil # clean out the saved info
    if tagging_explorer_controller?
      @sb[:action] = nil
      replace_right_cell
    else
      flash_to_session
      javascript_redirect(previous_breadcrumb_url)
    end
  end

  def tagging_edit_tags_save_and_replace_right_cell
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")

    tagging_save_tags

    get_node_info(x_node)
    @edit = nil
    replace_right_cell(:nodetype => @nodetype)
  end

  # Add/remove tags in a single transaction
  def tagging_save_tags
    @edit[:new][:assignments] = JSON.parse(params['data']).flat_map { |tag| tag['values'].map { |v| v['id'] } }
    Classification.bulk_reassignment(:model      => @edit[:tagging],
                                     :object_ids => @edit[:object_ids],
                                     :add_ids    => @edit[:new][:assignments] - @edit[:current][:assignments],
                                     :delete_ids => @edit[:current][:assignments] - @edit[:new][:assignments])
  rescue StandardError => bang
    add_flash(_("Error during 'Save Tags': %{error_message}") % {:error_message => bang.message}, :error)
  else
    add_flash(_("Tag edits were successfully saved"))
  end

  # Build the @edit elements for the tag edit screen
  def tag_edit_build_screen
    @showlinks = true
    @edit[:object_ids] ||= @object_ids

    cats = Classification.categories.select(&:show).sort_by { |t| t.description.try(:downcase) } # Get the categories, sort by description
    cats.delete_if { |c| c.read_only? || c.entries.empty? } # Remove categories that are read only or have no entries
    if ["User", "MiqGroup", "Tenant"].include?(@tagging)
      session[:assigned_filters] = [] # No view filters used for user/groups/tenants, set as empty for later methods
    else
      cats.each do |cat_key| # not needed for user/group tags since they are not filtered for viewing
        if session[:assigned_filters].include?(cat_key.name.downcase)
          cats.delete(cat_key)
        end
      end
    end

    @tagitems = @tagging.constantize.where(:id => @object_ids).sort_by { |t| t.name.try(:downcase).to_s }

    @view = get_db_view(@tagging, :clickable => false) # Instantiate the MIQ Report view object

    @edit[:new][:assignments] = assignments = @tagitems.map do |tagitem|
      Classification.find_assigned_entries(tagitem).reject { |e| e.parent.read_only? }
    end.reduce(:&) # intersection of arrays

    @tags = cats.map do |cat|
      {
        :id          => cat.id.to_s,
        :description => cat.description,
        :singleValue => cat.single_value,
        :values      => cat.entries.sort_by { |e| e[:description.downcase] }.map do |entry|
          { :id => entry.id.to_s, :description => entry.description }
        end
      }
    end

    assigned_tags = assignments.uniq(&:parent_id).map do |tag|
      {
        :description => tag.parent.description,
        :id          => tag.parent.id.to_s,
        :values      => assignments.select { |assignment| assignment.parent_id == tag.parent_id }.map do |assignment|
          { :description => assignment.description, :id => assignment.id.to_s }
        end
      }
    end
    @tags = {:tags => @tags, :assignedTags => assigned_tags, :affectedItems => @tagitems.map { |i| i.id.to_s } }
    @button_urls = {
      :save_url   => button_url(controller_path, @sb[:rec_id] || @edit[:object_ids][0], 'save'),
      :cancel_url => button_url(controller_path, @sb[:rec_id] || @edit[:object_ids][0], 'cancel')
    }
  end

  # Tag selected db records
  def tag(db = nil)
    assert_privileges(params[:pressed])
    @tagging = session[:tag_db] = db # Remember the DB
    get_tag_items
    drop_breadcrumb(:name => _("Tag Assignment"), :url => "/#{session[:controller]}/tagging_edit")
    javascript_redirect(:action => 'tagging_edit',
                        :id     => params[:id],
                        :db     => db,
                        :escape => false)
  end

  # Getting my company tags and my tags to display on summary screen
  def get_tagdata(rec)
    session[:assigned_filters] = {}
    filters = Classification.find_assigned_entries(rec)
    filters.each do |a|
      path    = [:assigned_filters, a.parent.description]
      array   = session.fetch_path(path)
      array ||= session.store_path(path, [])
      array << a.description
    end
    session[:mytags] = rec.tagged_with(:cat => session[:userid]) # Start with the first items tags
  end

  def locals_for_tagging
    {:action_url   => 'tagging',
     :multi_record => true,
     :record_id    => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]}
  end

  def update_tagging_partials(presenter)
    presenter.update(:main_div, r[:partial => 'layouts/tagging',
                                  :locals  => locals_for_tagging])
  end

  def button_url(controller, id, type)
    case controller
    when 'catalog'
      url_for_only_path(:action => 'ot_tags_edit', :id => id, :button => type)
    when 'ops'
      url_for_only_path(:action => 'rbac_tags_edit', :id => id, :button => type)
    else
      url_for_only_path(:action => 'tagging_edit', :id => id, :button => type)
    end
  end
end
