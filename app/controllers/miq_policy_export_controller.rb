class MiqPolicyExportController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def index
    assert_privileges('policy_import_export')
    flash_to_session
    export_reset_set
  end

  def self.table_name
    @table_name = "miq_policy_export"
  end

  def export
    assert_privileges('policy_import_export')
    @breadcrumbs = []
    @layout = "miq_policy_export"
    drop_breadcrumb(:name => _("Import / Export"), :url => "miq_policy_export")
    case params[:button]
    when "cancel"
      @sb = nil
      if @lastaction != "fetch_yaml"
        add_flash(_("Export cancelled by user"))
      end
      javascript_redirect(:action => "index")
    when "export"
      @sb[:new][:choices_chosen] = params[:choices_chosen] || []
      if @sb[:new][:choices_chosen].empty? # At least one member is required
        add_flash(_("At least 1 item must be selected for export"), :error)
        render :update do |page|
          page << javascript_prologue
          page.replace_html("profile_export_div", :partial => "export")
          page << "miqSparkle(false);"
        end
        return
      end
      begin
        (db, filename) = case @sb[:dbtype]
                         when 'pp' then [MiqPolicySet, 'Profiles']
                         when 'p'  then [MiqPolicy, 'Policies']
                         when 'al' then [MiqAlert, 'Alerts']
                         end
        session[:export_data] = MiqPolicy.export_to_yaml(@sb[:new][:choices_chosen], db)
        javascript_redirect(:action => 'fetch_yaml', :fname => filename, :escape => false)
      rescue => bang
        add_flash(_("Error during export: %{error_message}") % {:error_message => bang.message}, :error)
        render :update do |page|
          page << javascript_prologue
          page.replace_html("profile_export_div", :partial => "export")
          page << "miqSparkle(false);"
        end
      end
    when "reset", nil # Reset or first time in
      export_reset_set
    end
  end

  # Send the zipped up logs and zip files
  def fetch_yaml
    assert_privileges('policy_import_export')
    @lastaction = "fetch_yaml"
    file_name = "#{params[:fname]}_#{format_timezone(Time.zone.now, Time.zone, "export_filename")}.yaml"
    disable_client_cache
    send_data(session[:export_data], :filename => file_name)
    session[:export_data] = nil
  end

  def upload
    assert_privileges('policy_import_export')
    redirect_options = {:action => 'import', :dbtype => params[:dbtype]}

    @sb[:conflict] = false
    if upload_file_valid?
      begin
        import_file_upload = miq_policy_import_service.store_for_import(params[:upload][:file])
        @sb[:hide] = true
        redirect_options[:import_file_upload_id] = import_file_upload.id
      rescue => err
        flash_to_session(_("Error during 'Policy Import': %{messages}") % {:messages => err.message}, :error)
        redirect_options[:action] = 'index'
      end
    else
      flash_to_session(_("Use the Choose file button to locate an Import file"), :error)
      redirect_options[:action] = 'index'
    end

    redirect_to(redirect_options)
  end

  def get_json
    assert_privileges('policy_import_export')
    import_file_upload = ImportFileUpload.find(params[:import_file_upload_id])
    policy_import_json = import_as_json(import_file_upload.policy_import_data)

    respond_to do |format|
      format.json { render :json => policy_import_json }
    end
  end

  def import
    assert_privileges('policy_import_export')
    @breadcrumbs = []
    @layout = "miq_policy_export"
    @import_file_upload_id = params[:import_file_upload_id]
    drop_breadcrumb(:name => _("Import / Export"), :url => "miq_policy_export")

    if params[:commit] == "import"
      begin
        miq_policy_import_service.import_policy(@import_file_upload_id)
      rescue => bang
        add_flash(_("Error during upload: %{messages}") % {:messages => bang.message}, :error)
      else
        @sb[:hide] = false
        add_flash(_("Import file was uploaded successfully"))
      end

      render :update do |page|
        page << javascript_prologue
        page.replace_html("profile_export_div", :partial => "export")
        page << "miqSparkle(false);"
      end
    elsif params[:commit] == "cancel"
      miq_policy_import_service.cancel_import(@import_file_upload_id)

      flash_to_session(_("Import cancelled by user"))
      javascript_redirect(:action => 'index')

    # init import
    else
      @import = iterate_status(ImportFileUpload.find(@import_file_upload_id).policy_import_data)
      if @sb[:conflict]
        add_flash(_("Import not available due to conflicts"), :error)
      else
        add_flash(_("Press commit to Import")) unless @flash_array
      end
      render :action => "import", :layout => true
    end
  end

  def export_field_changed
    assert_privileges('policy_import_export')
    prev_dbtype = @sb[:dbtype]
    export_chooser(params[:dbtype], "export") if params[:dbtype]
    @sb[:new][:choices_chosen] = params[:choices_chosen] || []
    render :update do |page|
      page << javascript_prologue
      if prev_dbtype != @sb[:dbtype] # If any export db type has changed
        page.replace_html("profile_export_div", :partial => "export")
      end
    end
  end

  private

  def export_reset_set
    dbtype = params[:dbtype].nil? ? "pp" : params[:dbtype]
    type = params[:typ].nil? ? "export" : params[:typ]

    export_chooser(dbtype, type)
  end

  def import_as_json(yaml_array)
    iterate_status(yaml_array) if yaml_array
  end

  def iterate_status(items = nil, result = [], parent_id = nil)
    items.each do |item|
      entry = {
        :id     => result.count.to_s,
        :type   => ui_lookup(:model => item[:class]),
        :title  => item[:description],
        :parent => parent_id,
        :icon   => get_status_icon(item[:status])
      }

      if item[:messages]
        entry['msg'] = item[:messages].join(', ')
        @sb[:conflict] = true
      end

      result << entry

      # recursive call if item have the childrens
      if item[:children]
        iterate_status(item[:children], result, result.count - 1)
      end
    end

    result
  end

  def get_status_icon(status)
    case status
    when :update then "import-update"
    when :add then "import-add"
    when :conflict then "import-conflict"
    end
  end

  def miq_policy_import_service
    @miq_policy_import_service ||= MiqPolicyImportService.new
  end

  def upload_file_valid?
    params.fetch_path(:upload, :file).respond_to?(:read)
  end

  def export_chooser(dbtype = "pp", type = "export")
    @sb[:new] = {}
    @sb[:dbtype] = dbtype
    @sb[:hide] = false
    if type == "export"
      @sb[:new][:choices_chosen] = []
      @sb[:new][:choices] = []
      chooser_class =
        case dbtype
        when "pp" then MiqPolicySet
        when "p"  then MiqPolicy
        when "al" then MiqAlert
        end
      @sb[:new][:choices] = chooser_class.all.sort_by { |c| c.description.downcase }.collect { |c| [c.description, c.id] }
    else
      @sb[:import_file] = ""
    end
  end

  def get_session_data
    @title = _("Import / Export")
    @layout = "miq_policy_export"
    @lastaction = session[:miq_policy_export_lastaction]
  end

  def set_session_data
    super
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Control")},
        menu_breadcrumb,
      ].compact,
    }
  end

  def menu_breadcrumb
    {:title => _('Import / Export')}
  end

  menu_section :con
end
