class ChargebackAssignmentController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.table_name
    @table_name ||= "chargeback_assignment"
  end

  def index
    @breadcrumbs = []
    title
    set_form_locals if @in_a_form
    session[:changed] = false
    @edit = {:new => {}}
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def cb_assign_field_changed
    cb_assign_set_form_vars if params[:type]
    return unless load_edit("cbassign_edit__#{params[:type] || params[:id]}")

    cb_assign_get_form_vars
    render :update do |page|
      page << javascript_prologue
      except = %i[cbshow_typ cbtag_cat cblabel_key]
      changed = (@edit[:new].except(*except) != @edit[:current].except(*except))
      page.replace("cb_assignment_div", :partial => "cb_assignments") if params[:type] || params[:cbshow_typ] || params[:cbtag_cat] || params[:cblabel_key]
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def cb_assign_update
    session[:flash_msgs] = @flash_array = nil
    return unless load_edit("cbassign_edit__#{params[:id]}") unless params[:button] == 'cancel'
    if params[:button] == "reset"
      @_params[:type] = params[:id]
      cb_assign_set_form_vars
      flash_to_session(_("All changes have been reset"), :warning)
    elsif params[:button] == "save"
      cb_assign_set_record_vars
      rate_type = params[:id]
      begin
        ChargebackRate.set_assignments(rate_type, @edit[:set_assignments])
      rescue StandardError => bang
        render_flash(_("Error during 'Rate assignments': %{error_message}") % {:error_message => bang.message}, :error)
      else
        flash_to_session(_("Rate Assignments saved"))
      end
    else
      show_indexlist
      flash_to_session("Rate Assignment has been cancelled")
    end
    render :update do |page|
      page << javascript_prologue
      page.replace_html("cb_assignment_div", :partial => "cb_assignments")
    end
  end

  def title
    @title = _("Chargeback Assignment")
  end

  private ############################

  # Set record vars for save
  def cb_assign_set_record_vars
    @edit[:set_assignments] = []
    if @edit[:new][:cbshow_typ].ends_with?("-tags")
      assigned_rates_from_all_categories = @edit[:cb_assign][:tags].values.reduce({}, :merge)
      assigned_rates_from_all_categories.each_key do |id|
        key = "#{@edit[:new][:cbshow_typ]}__#{id}"
        next if @edit[:new][key].nil? || @edit[:new][key] == "nil"

        temp = {
          :cb_rate => ChargebackRate.find(@edit[:new][key]),
          :tag     => [Classification.find(id)],
        }
        temp[:tag].push(@edit[:new][:cbshow_typ].split("-").first)
        @edit[:set_assignments].push(temp)
      end
    elsif @edit[:new][:cbshow_typ].ends_with?("-labels")
      @edit[:cb_assign][:docker_label_values_saved].each_key do |id|
        key = "#{@edit[:new][:cbshow_typ]}__#{id}"
        next if @edit[:new][key].nil? || @edit[:new][key] == "nil"

        temp = {
          :cb_rate => ChargebackRate.find(@edit[:new][key]),
          :label   => [CustomAttribute.find(id)]
        }
        temp[:label].push(@edit[:new][:cbshow_typ].split("-").first)
        @edit[:set_assignments].push(temp)
      end
    else
      @edit[:cb_assign][:cis].each_key do |id|
        key = "#{@edit[:new][:cbshow_typ]}__#{id}"
        next if @edit[:new][key].nil? || @edit[:new][key] == "nil"

        temp = {:cb_rate => ChargebackRate.find(@edit[:new][key])}
        model = if @edit[:new][:cbshow_typ] == "enterprise"
                  MiqEnterprise
                elsif @edit[:new][:cbshow_typ] == "ems_container"
                  ExtManagementSystem
                else
                  Object.const_get(@edit[:new][:cbshow_typ].camelize) rescue nil
                end

        temp[:object] = model.find(id) unless model.nil?
        @edit[:set_assignments].push(temp)
      end
    end
  end

  # Set form variables for edit
  def cb_assign_set_form_vars
    @edit = {
      :cb_rates  => {},
      :cb_assign => {},
    }
    @edit[:new]     = HashWithIndifferentAccess.new
    @edit[:current] = HashWithIndifferentAccess.new
    @edit[:new][:type] = params[:type] if params[:type]
    @edit[:key] = "cbassign_edit__#{@edit[:new][:type]}"

    ChargebackRate.all.each do |cbr|
      if cbr.rate_type == @edit[:new][:type]
        @edit[:cb_rates][cbr.id.to_s] = cbr.description
      end
    end
    @edit[:current_assignment] = ChargebackRate.get_assignments(@edit[:new][:type])
    unless @edit[:current_assignment].empty?
      @edit[:new][:cbshow_typ] = case @edit[:current_assignment][0][:object]
                                 when EmsCluster
                                   "ems_cluster"
                                 when ExtManagementSystem, ManageIQ::Providers::ContainerManager
                                   "ext_management_system"
                                 when MiqEnterprise
                                   "enterprise"
                                 when NilClass
                                   if @edit[:current_assignment][0][:tag]
                                     "#{@edit[:current_assignment][0][:tag][1]}-tags"
                                   else
                                     "#{@edit[:current_assignment][0][:label][1]}-labels"
                                   end
                                 else
                                   if @edit[:current_assignment][0][:object].class.name.split("::").last.downcase == "storage"
                                     "storage"
                                   else
                                     @edit[:current_assignment][0][:object].class.name.downcase
                                   end
                                 end
    end
    if @edit[:new][:cbshow_typ]&.ends_with?("-tags")
      get_categories_all
      tag = @edit[:current_assignment][0][:tag][0]
      if tag
        @edit[:new][:cbtag_cat] = tag["parent_id"].to_s
        get_tags_all
      else
        @edit[:current_assignment] = []
      end
    elsif @edit[:new][:cbshow_typ]&.ends_with?("-labels")
      get_docker_labels_all_keys
      assigned_label = @edit[:current_assignment][0][:label][0]
      if assigned_label
        label = @edit[:cb_assign][:docker_label_keys].detect { |_key, value| value == assigned_label.name }
        label ||= @edit[:cb_assign][:docker_label_default_keys].detect { |_key, value| value == assigned_label.name }
        @edit[:new][:cblabel_key] = label.first
        get_docker_labels_all_values(label.first)
      else
        @edit[:current_assignment] = []
      end
    elsif @edit[:new][:cbshow_typ]
      get_cis_all
    end

    @edit[:current_assignment].each do |el|
      if el[:object]
        @edit[:new]["#{@edit[:new][:cbshow_typ]}__#{el[:object]["id"]}"] = el[:cb_rate]["id"].to_s
      elsif el[:tag]
        @edit[:new]["#{@edit[:new][:cbshow_typ]}__#{el[:tag][0]["id"]}"] = el[:cb_rate]["id"].to_s
      elsif el[:label]
        @edit[:new]["#{@edit[:new][:cbshow_typ]}__#{el[:label][0].id}"] = el[:cb_rate]["id"].to_s
      end
    end

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
    @in_a_form = true
  end

  def get_categories_all
    @edit[:cb_assign][:cats] = {}
    Classification.categories.select { |c| c.show && !c.entries.empty? }.each do |c|
      @edit[:cb_assign][:cats][c.id.to_s] = c.description
    end
  end

  def get_tags_all
    @edit[:cb_assign][:tags] ||= {}

    Classification.all.each do |category|
      @edit[:cb_assign][:tags][category.id] ||= {}
      category.entries.each do |entry|
        @edit[:cb_assign][:tags][category.id][entry.id.to_s] = entry.description
      end
    end
  end

  DEFAULT_CHARGEBACK_LABELS = ["com.redhat.component"].freeze

  def get_docker_labels_all_keys
    @edit[:cb_assign][:docker_label_keys] = {}
    @edit[:cb_assign][:docker_label_default_keys] = {}
    CustomAttribute.where(:section => "docker_labels").pluck(:id, :name).uniq(&:second).each do |label|
      if DEFAULT_CHARGEBACK_LABELS.include?(label.second)
        @edit[:cb_assign][:docker_label_default_keys][label.first.to_s] = label.second
      else
        @edit[:cb_assign][:docker_label_keys][label.first.to_s] = label.second
      end
    end
  end

  def get_docker_labels_all_values(label_id)
    @edit[:cb_assign][:docker_label_values] = {}
    @edit[:cb_assign][:docker_label_values_saved] = {}

    CustomAttribute.where(:section => "docker_labels").pluck(:id, :value).each do |label|
      @edit[:cb_assign][:docker_label_values_saved][label.first.to_s] = label.second
    end

    return if label_id && label_id == 'null' || label_id.nil?

    label_name = CustomAttribute.find(label_id).name

    CustomAttribute.where(:section => "docker_labels", :name => label_name).pluck(:id, :value).uniq(&:second).each do |label|
      @edit[:cb_assign][:docker_label_values][label.first.to_s] = label.second
    end
  end

  WHITELIST_INSTANCE_TYPE = %w[enterprise storage ext_management_system ems_cluster tenant ems_container].freeze
  NOTHING_FORM_VALUE = "nil".freeze

  def get_cis_all
    @edit[:cb_assign][:cis] = {}
    klass = @edit[:new][:cbshow_typ]
    return if klass == NOTHING_FORM_VALUE || klass.nil? # no rate was selected
    unless WHITELIST_INSTANCE_TYPE.include?(klass)
      raise ArgumentError, "Received: #{klass}, expected one of #{WHITELIST_INSTANCE_TYPE}"
    end

    all_of_classtype =
      if klass == "enterprise"
        MiqEnterprise.all
      elsif klass == "ext_management_system"
        ExtManagementSystem.all
      else
        klass.classify.constantize.all
      end
    @edit[:cb_assign][:hierarchy] ||= {}
    all_of_classtype.each do |instance|
      @edit[:cb_assign][:cis][instance.id] = instance.name
      if klass == "ems_cluster"
        provider_name = instance.ext_management_system.name
        @edit[:cb_assign][:cis][instance.id] = "#{provider_name}/#{instance.name}"
      end
      next unless klass == "tenant" && instance.root?

      @edit[:cb_assign][:hierarchy][instance.id] = {}
      @edit[:cb_assign][:hierarchy][instance.id][:name] = instance.name
      @edit[:cb_assign][:hierarchy][instance.id][:subtenant] = instance.build_tenant_tree
    end
  end

  def cb_assign_params_to_edit(cb_assign_key, tag_category_id = nil)
    current_assingments = cb_assign_key == :tags ? @edit[:cb_assign][cb_assign_key].try(:[], tag_category_id) : @edit[:cb_assign][cb_assign_key]

    return unless current_assingments

    current_assingments.each_key do |id|
      key = "#{@edit[:new][:cbshow_typ]}__#{id}"
      @edit[:new][key] = params[key].to_s if params[key]
    end
  end

  # Get variables from edit form
  def cb_assign_get_form_vars
    @edit[:new][:cbshow_typ] = params[:cbshow_typ] if params[:cbshow_typ]
    @edit[:new][:cbtag_cat] = nil if params[:cbshow_typ] # Reset categories pull down if assign to selection is changed
    @edit[:new][:cbtag_cat] = params[:cbtag_cat].to_s if params[:cbtag_cat]
    @edit[:new][:cblabel_key] = nil if params[:cbshow_typ]
    @edit[:new][:cblabel_key] = params[:cblabel_key].to_s if params[:cblabel_key]

    if @edit[:new][:cbshow_typ].ends_with?("-tags")
      get_categories_all
      get_tags_all
    elsif @edit[:new][:cbshow_typ].ends_with?("-labels")
      get_docker_labels_all_keys
      get_docker_labels_all_values(@edit[:new][:cblabel_key])
    else
      get_cis_all
    end

    cb_assign_params_to_edit(:cis)
    cb_assign_params_to_edit(:tags, @edit[:new][:cbtag_cat].try(:to_i))
    cb_assign_params_to_edit(:docker_label_values)
  end

  def get_session_data
    super
  end

  def set_session_data
    super
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Overview")},
        {:title => _("Chargeback")},
        {:title => _("Assignments"), :url => controller_url},
      ],
    }
  end

  menu_section :chargeback
end
