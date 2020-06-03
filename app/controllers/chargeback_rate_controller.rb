class ChargebackRateController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  # TODO: feature `chargeback_rates_show_list' needs to be renamed to chargeback_rate_show_list
  #       and then this method can be removed
  def index
    assert_privileges("chargeback_rates_show_list")

    super
  end

  # TODO: feature `chargeback_rates_show_list' needs to be renamed to chargeback_rate_show_list
  def show_list
    assert_privileges("chargeback_rates_show_list")

    super
  end

  # TODO: feature `chargeback_rates_show' needs to be renamed to chargeback_rate_show
  def show
    assert_privileges("chargeback_rates_show")

    super
  end

  # TODO: this will be unnecessary after
  #       `chargeback_rates_new`  gets renamed to `chargeback_rate_new`,
  #       `chargeback_rates_copy` gets renamed to `chargeback_rate_copy` and
  #       `chargeback_rates_edit` gets renamed to `chargeback_rate_edit`
  #
  EDIT_CHARGEBACK_RATE_FEATURES_WHITELIST = %w[
    chargeback_rates_new
    chargeback_rates_copy
    chargeback_rates_edit
  ]

  def assert_privileges_for_edit
    feature = if params[:pressed] && EDIT_CHARGEBACK_RATE_FEATURES_WHITELIST.include?(params[:pressed])
                params[:pressed]
              elsif params[:button] == "add"
                "chargeback_rates_new"
              end

    assert_privileges(feature)
  end

  def edit
    assert_privileges_for_edit
    @_params[:pressed] ||= 'chargeback_rates_edit'

    case params[:button]
    when "cancel"
      rate_cancel
    when "save", "add"
      rate_save_add
    when "reset", nil # displaying edit from for actions: new, edit or copy
      @_params[:id] ||= find_checked_items[0]
      @redirect_id = params[:id] if params[:id]
      @refresh_partial = "edit"
      rate_reset_or_set
    end
  end

  def new
    rate_reset_or_set
  end

  def copy
    # TODO: this will be unnecessary after `chargeback_rates_copy` gets renamed to `chargeback_rate_copy`
    assert_privileges("chargeback_rates_copy")

    @_params[:id] ||= find_checked_items[0]
    @_params[:pressed] = "chargeback_rates_copy"
    rate_reset_or_set
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def form_field_changed
    # TODO: rename feature `chargeback_rates_edit` to `chargeback_rate_edit`
    assert_privileges("chargeback_rates_edit")

    return unless load_edit("cbrate_edit__#{params[:id]}")
    cb_rate_get_form_vars
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      page.replace('chargeback_rate_edit_form', :partial => 'cb_rate_edit_table') if params[:rate_type]
      # Update the new column with the code of the currency selected by the user
      page.replace('chargeback_rate_currency', :partial => 'cb_rate_currency')
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  # Delete all selected or single displayed action(s)
  def delete
    # TODO: this will be unnecessary after `chargeback_rates_delete` gets renamed to `chargeback_rate_delete`
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
    flash_to_session
    javascript_redirect(:action => 'show_list')
  end

  # Add a new tier at the end
  def tier_add
    # TODO: rename feature `chargeback_rates_edit` to `chargeback_rate_edit`
    assert_privileges("chargeback_rates_edit")

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
  def tier_remove
    # TODO: rename feature `chargeback_rates_edit` to `chargeback_rate_edit`
    assert_privileges("chargeback_rates_edit")

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

  def rate_cancel
    if params[:id]
      flash_msg = _("Edit of Chargeback Rate \"%{name}\" was cancelled by the user") % {:name => session[:edit][:new][:description]}
    else
      flash_msg = _("Add of new Chargeback Rate was cancelled by the user")
    end
    @edit = session[:edit] = nil # clean out the saved info
    session[:changed] = false
    javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
  end

  def rate_save_add
    assert_privileges(params[:id] ? 'chargeback_rate_edit' : 'chargeback_rate_new')
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
        flash_msg = _("Chargeback Rate \"%{name}\" was added") % {:name => @rate.description}
      else
        AuditEvent.success(build_saved_audit(@rate, @edit))
        flash_msg = _("Chargeback Rate \"%{name}\" was saved") % {:name => @rate.description}
      end
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = @changed = false
      javascript_redirect(:action => @lastaction, :id => params[:id], :flash_msg => flash_msg)
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
  end

  def rate_reset_or_set
    assert_privileges('chargeback_rate_edit') if params[:button] == "reset"
    @rate = new_rate_edit? ? ChargebackRate.new : ChargebackRate.find(params[:id])
    if params[:pressed] == 'chargeback_rates_edit' && @rate.default?
      add_flash(_("Default Chargeback Rate \"%{name}\" cannot be edited.") % {:name => @rate.description}, :error)
      flash_to_session
      redirect_to(:action => 'show_list')
    end

    @in_a_form = true
    session[:changed] = params[:pressed] == 'chargeback_rates_copy'
    cb_rate_set_form_vars
    javascript_redirect(:action        => 'edit',
                        :id            => params[:id],
                        :flash_msg     => _("All changes have been reset"),
                        :flash_warning => true) if params[:button] == "reset"
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

    set_rate_details

    if params[:pressed] == 'chargeback_rates_copy'
      @rate.id = nil
      @edit[:new][:description] = "copy of #{@rate.description}"
    end

    @edit[:rec_id] = @rate.id || nil
    @edit[:key] = "cbrate_edit__#{@rate.id || "new"}"
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  def set_rate_details
    @edit[:new][:details] = []
    tiers = []
    @rate ||= ChargebackRate.new
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
  end

  # Get variables from edit form
  def cb_rate_get_form_vars
    @edit[:new][:description] = params[:description] if params[:description]
    if params[:rate_type]
      @edit[:new][:rate_type] = params[:rate_type]
      set_rate_details
    end

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

  toolbar :chargeback_rate, :chargeback_rates
  menu_section :chargeback
end
