class ChargebackRateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  CB_X_BUTTON_ALLOWED_ACTIONS = {
    'chargeback_rates_copy'   => :cb_rate_edit,
    'chargeback_rates_delete' => :cb_rates_delete,
    'chargeback_rates_edit'   => :cb_rate_edit,
    'chargeback_rates_new'    => :cb_rate_edit
  }.freeze

  def button
    @edit = session[:edit]    # Restore @edit for adv search box
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    action = params[:pressed]

    unless CB_X_BUTTON_ALLOWED_ACTIONS.key?(action)
      raise ActionController::RoutingError, _('invalid button action')
    end

    send_action = CB_X_BUTTON_ALLOWED_ACTIONS[action]
    send(send_action)

    return if performed?

    if params[:pressed].ends_with?("_copy", "_edit", "_new") && @flash_array.nil?
      if @flash_array
        show_list
        replace_gtl_main_div
      else
        render :update do |page|
          page << javascript_prologue
          page.redirect_to :action => @refresh_partial, :id => @redirect_id, :pressed => params[:pressed]
        end
      end
    elsif params[:pressed].ends_with?("_delete")
      javascript_redirect(:action => 'show_list', :flash_msg  => @flash_array[0][:message])
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  def show_list
    super
    # only need these gtl type buttons on the screen
    @gtl_buttons = %w[view_list view_tree]
    cb_rates_build_tree if @gtl_type == 'tree'
  end

  def tree_select
    id = parse_nodetype_and_id(params[:id]).last
    render :update do |page|
      page << javascript_prologue
      page.redirect_to :action => 'show', :id => id
    end
  end

  def cb_rate_edit
    @_params[:id] ||= find_checked_items[0]
    rate = new_rate_edit? ? ChargebackRate.new : ChargebackRate.find(params[:id])
    if params[:pressed] == 'chargeback_rates_edit' && rate.default?
      add_flash(_("Default Chargeback Rate \"%{name}\" cannot be edited.") % {:name => rate.description}, :error)
      return
    end
    @redirect_id = params[:id] if params[:id]
    @refresh_partial = "edit"
  end

  def edit
    assert_privileges(params[:pressed]) if params[:pressed]
    case params[:button]
    when "cancel"
      if params[:id]
        add_flash(_("Edit of Chargeback Rate \"%{name}\" was cancelled by the user") % {:name => session[:edit][:new][:description]})
      else
        add_flash(_("Add of new Chargeback Rate was cancelled by the user"))
      end
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg  => @flash_array[0][:message])
    when "save", "add"
      id = params[:button] == "save" ? params[:id] : "new"
      return unless load_edit("cbrate_edit__#{id}")

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
        javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg  => @flash_array[0][:message])
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
      session[:changed] = params[:pressed] == 'chargeback_rates_copy'
      @rate = new_rate_edit? ? ChargebackRate.new : ChargebackRate.find(params[:id])
      cb_rate_set_form_vars
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
        render :update do |page|
          page << javascript_prologue
          page.replace("form_div", :partial => "edit")
          page << "miqSparkle(false);"
        end
      end
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def cb_rate_form_field_changed
    return unless load_edit("cbrate_edit__#{params[:id]}")
    cb_rate_get_form_vars
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      # Update the new column with the code of the currency selected by the user
      page.replace('chargeback_rate_currency', :partial => 'cb_rate_currency')
      page << javascript_for_miq_button_visibility(changed)
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
      if cb_rate.nil?
        add_flash(_("Chargeback Rate no longer exists"), :error)
      else
        rates.push(params[:id])
      end
    end
    process_cb_rates(rates, 'destroy') if rates.present?
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

  def cb_rates_build_tree
    @tree = TreeBuilderChargebackRates.new("tree", @sb)
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
    @edit[:new][:rate_type] = @rate.rate_type || "Compute"
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
    @edit[:new][:rate_type] = params[:rate_type] if params[:rate_type]
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
    !params[:id].present? || params[:id] == 'new' || params[:pressed] == 'chargeback_rates_new'
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
        {:title => _("Rates"), :url => controller_url},
      ],
    }
  end

  menu_section :chargeback
end
