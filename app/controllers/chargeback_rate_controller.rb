class ChargebackRateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  CB_X_BUTTON_ALLOWED_ACTIONS = {
    'chargeback_rates_copy'   => :cb_rate_edit,
    'chargeback_rates_delete' => :cb_rates_delete,
    'chargeback_rates_edit'   => :cb_rate_edit,
    'chargeback_rates_new'    => :cb_rate_edit
  }.freeze

  def x_button
    generic_x_button(CB_X_BUTTON_ALLOWED_ACTIONS)
  end

  def x_show
    @explorer = true
    @record = identify_record(params[:id], ChargebackRate)
    nodeid = x_build_node_id(@record)
    params[:id] = "xx-#{@record.rate_type}_#{nodeid}"
    params[:tree] = x_active_tree.to_s
    tree_select
    redirect_to :action => 'explorer' unless request.xml_http_request? # Ajax request means in explorer
  end

  def tree_select
    self.x_active_tree = :cb_rates_tree
    self.x_node = params[:id]
    get_node_info(x_node)
    replace_right_cell if request.xml_http_request? # Ajax request means in explorer
  end

  def explorer
    @breadcrumbs = []
    @explorer    = true
    build_accordions_and_trees

    @right_cell_text ||= _("All Chargeback Rates")
    set_form_locals if @in_a_form
    session[:changed] = false

    render :layout => "application" unless request.xml_http_request?
  end

  def set_form_locals
    @x_edit_buttons_locals = {:action_url => 'cb_rate_edit'}
  end

  # Show the main Schedules list view
  def cb_rates_list
    @gtl_type = "list"
    @explorer = true
    if params[:ppsetting]                                              # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                        # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:rates_sortcol].nil? ? 0 : session[:rates_sortcol].to_i
    @sortdir = session[:rates_sortdir].nil? ? "ASC" : session[:rates_sortdir]

    @view, @pages = get_view(ChargebackRate, :named_scope => [[:with_rate_type, x_node.split('-').last]]) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:rates_sortcol] = @sortcol
    session[:rates_sortdir] = @sortdir

    update_gtl_div('cb_rates_list') if pagination_or_gtl_request? && @show_list
  end

  def cb_rate_edit
    assert_privileges(params[:pressed]) if params[:pressed]
    case params[:button]
    when "cancel"
      if params[:id]
        add_flash(_("Edit of Chargeback Rate \"%{name}\" was cancelled by the user") % {:name => session[:edit][:new][:description]})
      else
        add_flash(_("Add of new Chargeback Rate was cancelled by the user"))
      end
      get_node_info(x_node)
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = false
      replace_right_cell
    when "save", "add"
      id = params[:button] == "save" ? params[:id] : "new"
      return unless load_edit("cbrate_edit__#{id}", "replace_cell__chargeback_rate")

      @rate = params[:button] == "add" ? ChargebackRate.new : ChargebackRate.find(params[:id])
      if @edit[:new][:description].nil? || @edit[:new][:description] == ""
        render_flash(_("Description is required"), :error)
        return
      end
      @rate.description = @edit[:new][:description]
      @rate.rate_type   = @edit[:new][:rate_type] if @edit[:new][:rate_type]

      cb_rate_set_record_vars
      # Detect errors saving tiers
      tiers_valid = @rate_tiers.all? { |tiers| tiers.all?(&:valid?) }

      @rate.chargeback_rate_details.replace(@rate_details)
      @rate.chargeback_rate_details.each_with_index do |_detail, i|
        @rate_details[i].save_tiers(@rate_tiers[i])
      end

      tiers_valid &&= @rate_details.all? { |rate_detail| rate_detail.errors.messages.blank? }

      if tiers_valid && @rate.save
        if params[:button] == "add"
          AuditEvent.success(build_created_audit(@rate, @edit))
          add_flash(_("Chargeback Rate \"%{name}\" was added") % {:name => @rate.description})
        else
          AuditEvent.success(build_saved_audit(@rate, @edit))
          add_flash(_("Chargeback Rate \"%{name}\" was saved") % {:name => @rate.description})
        end
        @edit = session[:edit] = nil # clean out the saved info
        session[:changed] = @changed = false
        get_node_info(x_node)
        replace_right_cell(:replace_trees => [:cb_rates])
      else
        @rate.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        @rate_details.each do |detail|
          display_detail_errors(detail, detail.errors)
        end
        @rate_tiers.each_with_index do |tiers, detail_index|
          tiers.each do |tier|
            display_detail_errors(@rate_details[detail_index], tier.errors)
          end
        end
        @changed = session[:changed] = (@edit[:new] != @edit[:current])
        javascript_flash
      end

    when "reset", nil # displaying edit from for actions: new, edit or copy
      @in_a_form = true
      @_params[:id] ||= find_checked_items[0]
      session[:changed] = params[:pressed] == 'chargeback_rates_copy'

      @rate = new_rate_edit? ? ChargebackRate.new : ChargebackRate.find(params[:id])
      @record = @rate

      if params[:pressed] == 'chargeback_rates_edit' && @rate.default?
        render_flash(_("Default Chargeback Rate \"%{name}\" cannot be edited.") % {:name => @rate.description}, :error)
        return
      end

      cb_rate_set_form_vars

      add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"

      replace_right_cell
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def cb_rate_form_field_changed
    return unless load_edit("cbrate_edit__#{params[:id]}", "replace_cell__chargeback")

    cb_rate_get_form_vars
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      # Update the new column with the code of the currency selected by the user
      page.replace('chargeback_rate_currency', :partial => 'cb_rate_currency')
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def cb_rate_show
    @display = "main"
    if @record.nil?
      flash_to_session(_('Error: Record no longer exists in the database'), :error)
      redirect_to(:action => 'cb_rates_list')
      return
    end
  end

  # Delete all selected or single displayed action(s)
  def cb_rates_delete
    assert_privileges("chargeback_rates_delete")
    rates = []
    if !params[:id] # showing a list
      rates = find_checked_items
      if rates.empty?
        add_flash(_("No Chargeback Rates were selected for deletion"), :error)
      end
    else # showing 1 rate, delete it
      cb_rate = ChargebackRate.find_by(:id => params[:id])
      self.x_node = x_node.split('_').first
      if cb_rate.nil?
        add_flash(_("Chargeback Rate no longer exists"), :error)
      else
        rates.push(params[:id])
      end
    end
    process_cb_rates(rates, 'destroy') if rates.present?

    cb_rates_list
    @right_cell_text = _("%<typ>s Chargeback Rates") % {:typ => x_node.split('-').last}
    replace_right_cell(:replace_trees => [:cb_rates])
  end

  # Add a new tier at the end
  def cb_tier_add
    detail_index = params[:detail_index]
    ii = detail_index.to_i

    @edit  = session[:edit]
    detail = @edit[:new][:details][ii]

    @edit[:new][:num_tiers][ii] = detail[:chargeback_tiers].to_a.length if detail[:chargeback_tiers]
    @edit[:new][:num_tiers][ii] = 1 unless @edit[:new][:num_tiers][ii] || @edit[:new][:num_tiers][ii].zero?
    @edit[:new][:num_tiers][ii] += 1

    tier_index = @edit[:new][:num_tiers][ii] - 1
    tier_list = @edit[:new][:tiers][ii]
    tier_list[tier_index] = {}

    tier                 = tier_list[tier_index]
    tier[:start]         = tier_list[tier_index - 1][:finish]
    tier[:finish]        = Float::INFINITY
    tier[:fixed_rate]    = 0.0
    tier[:variable_rate] = 0.0

    code_currency = Currency.find_by(:id => detail[:currency]).code
    add_row(detail_index, tier_index - 1, code_currency)
  end

  # Remove the selected tier
  def cb_tier_remove
    @edit = session[:edit]
    index = params[:index]
    detail_index, tier_to_remove_index = index.split("-")
    detail_index = detail_index.to_i
    @edit[:new][:num_tiers][detail_index] = @edit[:new][:num_tiers][detail_index] - 1

    # Delete tier record
    @edit[:new][:tiers][detail_index].delete_at(tier_to_remove_index.to_i)

    @changed = session[:changed] = true

    render :update do |page|
      page << javascript_prologue
      page.replace_html("chargeback_rate_edit_form", :partial => "cb_rate_edit_table")
      page << javascript_for_miq_button_visibility(@changed)
    end
  end

  def title
    @title = _("Chargeback Rates")
  end

  private ############################

  def features
    [
      {
        :role  => "chargeback_rates",
        :name  => :cb_rates,
        :title => _("Rates")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def get_node_info(node, show_list = true)
    @show_list = show_list
    node = valid_active_node(node)
    if node == "root"
      @record = nil
      @right_cell_text = _("All Chargeback Rates")
    elsif ["xx-Compute", "xx-Storage"].include?(node)
      @record = nil
      @right_cell_text = case node
                         when "xx-Compute" then _("Compute Chargeback Rates")
                         when "xx-Storage" then _("Storage Chargeback Rates")
                         end
      cb_rates_list
    else
      @record = ChargebackRate.find(parse_nodetype_and_id(node).last)
      @sb[:action] = nil
      @right_cell_text = case @record.rate_type
                         when "Compute" then _("Compute Chargeback Rate \"%{name}\"") % {:name => @record.description}
                         when "Storage" then _("Storage Chargeback Rate \"%{name}\"") % {:name => @record.description}
                         end
      cb_rate_show
    end
    {:view => @view, :pages => @pages}
  end

  def cb_rates_build_tree
    TreeBuilderChargebackRates.new("cb_rates_tree", @sb)
  end

  # Common Schedule button handler routines
  def process_cb_rates(rates, task)
    process_elements(rates, ChargebackRate, task)
  end

  # Set form variables for edit
  def cb_rate_set_form_vars
    @edit = {}
    @edit[:new] = HashWithIndifferentAccess.new
    @edit[:current] = HashWithIndifferentAccess.new
    @edit[:new][:tiers] = []
    @edit[:new][:num_tiers] = []
    @edit[:new][:description] = @rate.description
    @edit[:new][:rate_type] = @rate.rate_type || x_node.split('-').last
    @edit[:new][:details] = []

    tiers = []
    rate_details = @rate.chargeback_rate_details
    rate_details = ChargebackRateDetail.default_rate_details_for(@edit[:new][:rate_type]) if new_rate_edit?

    # Select the currency of the first chargeback_rate_detail. All the chargeback_rate_details have the same currency
    @edit[:new][:currency] = rate_details[0].detail_currency.id
    @edit[:new][:code_currency] = "#{rate_details[0].detail_currency.symbol} [#{rate_details[0].detail_currency.full_name}]"

    rate_details.each_with_index do |detail, detail_index|
      temp = detail.slice(*ChargebackRateDetail::FORM_ATTRIBUTES)
      temp[:report_column_name] = Dictionary.gettext(detail.chargeable_field.metric_key, :type => :column, :notfound => :titleize)
      temp[:group] = detail.chargeable_field.group
      temp[:per_time] ||= "hourly"

      temp[:currency] = detail.detail_currency.id

      if detail.chargeable_field.detail_measure.present?
        temp[:detail_measure] = {}
        temp[:detail_measure][:measures] = detail.chargeable_field.detail_measure.measures
        temp[:chargeback_rate_detail_measure_id] = detail.chargeable_field.detail_measure.id
      end

      temp[:id] = params[:pressed] == 'chargeback_rates_copy' ? nil : detail.id
      temp[:sub_metrics] = detail.sub_metrics
      temp[:sub_metric_human] = detail.sub_metric_human

      tiers[detail_index] ||= []

      detail.chargeback_tiers.each do |tier|
        new_tier = tier.slice(*ChargebackTier::FORM_ATTRIBUTES)
        new_tier[:id] = params[:pressed] == 'chargeback_rates_copy' ? nil : tier.id
        new_tier[:chargeback_rate_detail_id] = params[:pressed] == 'chargeback_rates_copy' ? nil : detail.id
        new_tier[:start] = new_tier[:start].to_f
        new_tier[:finish] = ChargebackTier.to_float(new_tier[:finish])
        tiers[detail_index].push(new_tier)
      end

      @edit[:new][:tiers][detail_index] = tiers[detail_index]
      @edit[:new][:num_tiers][detail_index] = tiers[detail_index].size
      @edit[:new][:details].push(temp)
    end

    @edit[:new][:per_time_types] = ChargebackRateDetail::PER_TIME_TYPES.map { |x, y| [x, _(y)] }.to_h

    if params[:pressed] == 'chargeback_rates_copy'
      @rate.id = nil
      @edit[:new][:description] = "copy of #{@rate.description}"
    end

    @edit[:rec_id] = @rate.id || nil
    @edit[:key] = "cbrate_edit__#{@rate.id || "new"}"
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Get variables from edit form
  def cb_rate_get_form_vars
    @edit[:new][:description] = params[:description] if params[:description]
    if params[:currency]
      @edit[:new][:currency] = params[:currency].to_i
      rate_detail_currency = Currency.find(params[:currency])
      @edit[:new][:code_currency] = "#{rate_detail_currency.symbol} [#{rate_detail_currency.full_name}]"
    end
    @edit[:new][:details].each_with_index do |detail, detail_index|
      %i[per_time per_unit sub_metric].each do |measure|
        key = "#{measure}_#{detail_index}".to_sym
        detail[measure] = params[key] if params[key]
      end
      # Add currencies to chargeback_controller.rb
      detail[:currency] = params[:currency].to_i if params[:currency]

      # Save tiers into @edit
      (0..@edit[:new][:num_tiers][detail_index].to_i - 1).each do |tier_index|
        tier = @edit[:new][:tiers][detail_index][tier_index] || {}
        %i[fixed_rate variable_rate start finish].each do |field|
          key = "#{field}_#{detail_index}_#{tier_index}".to_sym
          tier[field] = params[key] if params[key]
        end
      end
    end
  end

  def cb_rate_set_record_vars
    @rate_details = []
    @rate_tiers = []
    @edit[:new][:details].each_with_index do |detail, detail_index|
      rate_detail = detail[:id] ? ChargebackRateDetail.find(detail[:id]) : ChargebackRateDetail.new
      rate_detail.attributes = detail.slice(*ChargebackRateDetail::FORM_ATTRIBUTES)
      rate_detail.sub_metric = detail[:sub_metric] if rate_detail.sub_metric
      rate_detail_edit = @edit[:new][:details][detail_index]
      # C: Record the currency selected in the edit view, in my chargeback_rate_details table
      rate_detail.chargeback_rate_detail_currency_id = rate_detail_edit[:currency]
      rate_detail.chargeback_rate_detail_measure_id = rate_detail_edit[:chargeback_rate_detail_measure_id]
      rate_detail.chargeback_rate_id = @rate.id
      # Save tiers into @sb
      rate_tiers = []
      @edit[:new][:tiers][detail_index].each do |tier|
        rate_tier = tier[:id] ? ChargebackTier.find(tier[:id]) : ChargebackTier.new
        tier[:start] = Float::INFINITY if tier[:start].blank?
        tier[:finish] = Float::INFINITY if tier[:finish].blank?
        rate_tier.attributes = tier.slice(*ChargebackTier::FORM_ATTRIBUTES)
        rate_tier.chargeback_rate_detail_id = rate_detail.id
        rate_tiers.push(rate_tier)
      end
      @rate_tiers[detail_index] = rate_tiers
      @rate_details.push(rate_detail)
    end
  end

  def new_rate_edit?
    params[:id] == 'new' || params[:pressed] == 'chargeback_rates_new'
  end

  def replace_right_cell(options = {})
    replace_trees = Array(options[:replace_trees])
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    @explorer = true
    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)
    reload_trees_by_presenter(presenter, [cb_rates_build_tree]) if replace_trees.include?(:cb_rates)

    # FIXME
    #  if params[:action].ends_with?("_delete")
    #    page << "miqTreeActivateNodeSilently('#{x_active_tree.to_s}', '<%= x_node %>');"
    #  end
    # presenter[:select_node] = x_node if params[:action].ends_with?("_delete")
    presenter[:osf_node] = x_node

    if c_tb.present?
      presenter.reload_toolbars(:center => c_tb)
    end
    presenter.set_visibility(c_tb.present?, :toolbar)
    presenter.update(:main_div, r[:partial => 'rates_tabs'])

    if @record || @in_a_form ||
       (@pages && (@items_per_page == ONE_MILLION || @pages[:items] == 0))
      if %w[chargeback_rates_copy chargeback_rates_edit chargeback_rates_new].include?(@sb[:action])
        presenter.hide(:toolbar)
        # incase it was hidden for summary screen, and incase there were no records on show_list
        presenter.show(:paging_div, :form_buttons_div).remove_paging
        locals = {:record_id => @edit[:rec_id]}
        locals[:action_url] = 'cb_rate_edit'
        presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
      else
        # Added so buttons can be turned off even tho div is not being displayed it still pops up Abandon changes box when trying to change a node on tree after saving a record
        presenter.hide(:buttons_on).show(:toolbar).hide(:paging_div)
        presenter.hide(:form_buttons_div) if params[:button]
      end
    else
      presenter.hide(:form_buttons_div)
      if x_node == "root"
        presenter.hide(:toolbar).remove_paging
      end
      presenter.show(:paging_div)
    end

    presenter[:record_id] = determine_record_id_for_presenter

    presenter[:clear_gtl_list_grid] = @gtl_type && @gtl_type != 'list'

    presenter[:right_cell_text]     = @right_cell_text
    presenter[:lock_sidebar] = @in_a_form && @edit

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def display_detail_errors(detail, errors)
    errors.each { |field, msg| add_flash("'#{detail.chargeable_field.description}' #{field.to_s.humanize.downcase} #{msg}", :error) }
  end

  def add_row(i, pos, code_currency)
    locals = {:code_currency => code_currency}
    render :update do |page|
      page << javascript_prologue
      # Update the first row to change the colspan
      page.replace("rate_detail_row_#{i}_0",
                   :partial => "tier_first_row",
                   :locals  => locals)
      # Insert the new tier after the last one
      page.insert_html(:after,
                       "rate_detail_row_#{i}_#{pos}",
                       :partial => "tier_row",
                       :locals  => locals)
      page << javascript_for_miq_button_visibility(true)
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Overview")},
        {:title => _("Chargeback")},
      ],
    }
  end

  menu_section :chargeback
end
