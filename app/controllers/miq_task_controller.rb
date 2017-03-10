class MiqTaskController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin

  def index
    @tabform = nil
    @tabform ||= "tasks_1" if role_allows?(:feature => "job_my_smartproxy")
    @tabform ||= "tasks_2" if role_allows?(:feature => "miq_task_my_ui")
    @tabform ||= "tasks_3" if role_allows?(:feature => "job_all_smartproxy")
    @tabform ||= "tasks_4" if role_allows?(:feature => "miq_task_all_ui")
    jobs
    render :action => "jobs"
  end

  # New tab was pressed
  def change_tab
    @tabform = "tasks_#{params[:tab]}"
    jobs
    render :action => "jobs"
  end

  def build_jobs_tab
    @pp_choices = PPCHOICES2  # Get special pp choices for jobs/tasks lists
    @settings[:perpage][:job_task] ||= 50       # Default to 50 per page until changed
    @tasks_options = HashWithIndifferentAccess.new if @tasks_options.blank?
    @tasks_options[:zones] = Zone.all.collect { |z| z.name unless z.miq_servers.blank? }.compact
    tasks_set_default_options if @tasks_options[@tabform].blank?

    @tabs ||= []

    if role_allows?(:feature => "job_my_smartproxy")
      @tabs.push(["1", _("My VM and Container Analysis Tasks")])
    end
    if role_allows?(:feature => "miq_task_my_ui")
      @tabs.push(["2", _("My Other UI Tasks")])
    end
    if role_allows?(:feature => "job_all_smartproxy")
      @tabs.push(["3", _("All VM and Container Analysis Tasks")])
    end
    if role_allows?(:feature => "miq_task_all_ui")
      @tabs.push(["4", _("All Other Tasks")])
    end
  end

  # Show job list for the current user
  def jobs
    build_jobs_tab
    @title = _("Tasks for %{name}") % {:name => current_user.name}
    @lastaction = "jobs"

    @edit = {}
    @edit[:opts] = {}
    @edit[:opts] = copy_hash(@tasks_options[@tabform])   # Backup current settings

    list_jobs
    if pagination_request?
      render :update do |page|
        page << javascript_prologue
        page.replace_html("gtl_div", :partial => "layouts/gtl", :locals => {:action_url => @lastaction})
        page.replace_html("paging_div", :partial => 'layouts/pagingcontrols',
                                        :locals  => {:pages      => @pages,
                                                     :action_url => @lastaction,
                                                     :db         => @view.db,
                                                     :headers    => @view.headers})
        page << "miqSparkle(false);"  # Need to turn off sparkle in case original ajax element gets replaced
      end
    end
  end

  def list_jobs
    @lastaction = "jobs"
    @active_tab = @tabform.split("_").last

    case @tabform
    when "tasks_1" then @layout = "my_tasks"
    when "tasks_2" then @layout = "my_ui_tasks"
    when "tasks_3", "alltasks_1" then @layout = "all_tasks"
    when "tasks_4", "alltasks_2" then @layout = "all_ui_tasks"
    end

    @user_names = db_class.distinct.pluck("userid").delete_if(&:blank?) if @active_tab.to_i > 2
    @view, @pages = get_view(db_class, :conditions => tasks_condition(@tasks_options[@tabform]))
  end

  # Cancel a single selected job
  def canceljobs
    assert_privileges("miq_task_canceljob")
    job_id = find_checked_items
    if job_id.empty?
      add_flash(_("No %{model} were selected for cancellation") % {:model => ui_lookup(:tables => "miq_task")}, :error)
    end
    job = db_class.find_by_id(job_id)
    if job["state"].downcase == "finished"
      add_flash(_("Finished Task cannot be cancelled"), :error)
    else
      process_jobs(job_id, "cancel")  unless job_id.empty?
      add_flash(_("The selected Task was cancelled"), :error) if @flash_array.nil?
    end
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete all selected or single displayed job(s)
  def deletejobs
    assert_privileges("miq_task_delete")
    job_ids = find_checked_items
    if job_ids.empty?
      add_flash(_("No %{model} were selected for deletion") % {:model => ui_lookup(:tables => "miq_task")}, :error)
    else
      db_class.delete_by_id(job_ids)
      AuditEvent.success(:userid       => session[:userid],
                         :event        => "Delete selected tasks",
                         :message      => _("Delete started for record ids: %{id}") % {:id => job_ids.inspect},
                         :target_class => db_class.base_class.name)
      if @flash_array.nil?
        add_flash(n_("Delete initiated for %{count} Task from the %{product} Database",
                     "Delete initiated for %{count} Tasks from the %{product} Database",
                     job_ids.length) % {:count => job_ids.length, :product => I18n.t('product.name')})
      end
    end
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete all finished job(s)
  def deletealljobs
    assert_privileges("miq_task_deleteall")
    job_ids = []
    session[:view].table.data.each do |rec|
      job_ids.push(rec["id"])
    end
    if job_ids.empty?
      add_flash(_("No %{model} were selected for deletion") % {:model => ui_lookup(:tables => "miq_task")}, :error)
    else
      db_class.delete_by_id(job_ids)
      AuditEvent.success(:userid       => session[:userid],
                         :event        => "Delete all finished tasks",
                         :message      => _("Delete started for record ids: %{id}") % {:id => job_ids.inspect},
                         :target_class => db_class.base_class.name)
      if @flash_array.nil?
        add_flash(n_("Delete initiated for %{count} Task from the %{product} Database",
                     "Delete initiated for %{count} Tasks from the %{product} Database",
                     job_ids.length) % {:count => job_ids.length, :product => I18n.t('product.name')})
      end
    end
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete all job(s) older than selected job(s)
  def deleteolderjobs
    assert_privileges("miq_task_deleteolder")
    jobid = find_checked_items
    # fetching job record for the selected job
    job = db_class.find_by_id(jobid)
    if job
      db_class.delete_older(job.updated_on, tasks_condition(@tasks_options[@tabform], false))
      message = _("Delete started for records older than %{date}, conditions: %{conditions}") %
        {:date       => job.updated_on,
         :conditions => @tasks_options[@tabform].inspect}
      AuditEvent.success(:userid       => session[:userid],
                         :event        => "Delete older tasks",
                         :message      => message,
                         :target_class => db_class.base_class.name)
      add_flash(n_("Delete all older Tasks initiated for %{count} Task from the %{product} Database",
                   "Delete all older Tasks initiated for %{count} Tasks from the %{product} Database",
                   jobid.length) % {:count => jobid.length, :product => I18n.t('product.name')})
    else
      add_flash(_("The selected job no longer exists, Delete all older Tasks was not completed"), :warning)
    end
    jobs
    @refresh_partial = "layouts/tasks"
  end

  def process_jobs(jobs, task)
    db_class.where(:id => jobs).order("lower(name)").each do |job|
      id = job.id
      job_name = job.name
      if task == "destroy"
        audit = {:event        => "jobs_record_delete",
                 :message      => _("[%{name}] Record deleted") % {:name => job_name},
                 :target_id    => id,
                 :target_class => db_class.base_class.name,
                 :userid       => session[:userid]}
      end
      begin
        job.send(task.to_sym) if job.respond_to?(task)    # Run the task
      rescue => bang
        add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{message}") %
                    {:model   => ui_lookup(:model => "MiqTask"),
                     :name    => job_name,
                     :task    => task,
                     :message => bang.message}, :error)
      else
        if task == "destroy"
          AuditEvent.success(audit)
          add_flash(_("%{model} \"%{name}\": Delete successful") % {:model => ui_lookup(:tables => "miq_task"),
                                                                    :name  => job_name}, :error)
        else
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => job_name, :task => task})
        end
      end
    end
  end

  TASK_X_BUTTON_ALLOWED_ACTIONS =  {
    "miq_task_delete"      => :deletejobs,
    "miq_task_deleteall"   => :deletealljobs,
    "miq_task_deleteolder" => :deleteolderjobs,
    "miq_task_canceljob"   => :canceljobs,
    "miq_task_reload"      => :reloadjobs,
  }

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box

    generic_x_button(TASK_X_BUTTON_ALLOWED_ACTIONS)

    render :update do |page|
      page << javascript_prologue
      unless @refresh_partial.nil?
        if @refresh_div == "flash_msg_div"
          page << "miqSetButtons(0, 'center_tb');"
          page.replace(@refresh_div, :partial => @refresh_partial)
        else
          page << "miqSetButtons(0, 'center_tb');"
          page.replace_html("main_div", :partial => @refresh_partial)
          page.replace_html("paging_div", :partial => 'layouts/pagingcontrols',
                                          :locals  => {:pages      => @pages,
                                                       :action_url => @lastaction,
                                                       :db         => @view.db,
                                                       :headers    => @view.headers})
        end
      end
    end
  end

  # Gather any changed options
  def tasks_change_options
    @edit = session[:edit]
    @edit[:opts][:zone] = params[:chosen_zone] if params[:chosen_zone]
    @edit[:opts][:user_choice] = params[:user_choice] if params[:user_choice]
    @edit[:opts][:time_period] = params[:time_period].to_i if params[:time_period]
    @edit[:opts][:queued] = params[:queued] == "1" ? params[:queued] : nil if params[:queued]
    @edit[:opts][:ok] = params[:ok] == "1" ? params[:ok] : nil if params[:ok]
    @edit[:opts][:error] = params[:error] == "1" ? params[:error] : nil if params[:error]
    @edit[:opts][:warn] = params[:warn] == "1" ? params[:warn] : nil if params[:warn]
    @edit[:opts][:running] = params[:running] == "1" ? params[:running] : nil if params[:running]
    @edit[:opts][:state_choice] = params[:state_choice] if params[:state_choice]

    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(@tasks_options[@tabform] != @edit[:opts])
    end
  end

  # Refresh the display with the chosen filters
  def tasks_button
    @edit = session[:edit]
    if params[:button] == "apply"
      @tasks_options[@tabform] = copy_hash(@edit[:opts]) # Copy the latest changed options
    elsif params[:button] == "reset"
      @edit[:opts] = copy_hash(@tasks_options[@tabform]) # Reset to the saved options
    elsif params[:button] == "default"
      tasks_set_default_options
      @edit[:opts] = copy_hash(@tasks_options[@tabform]) # Backup current settings
    end

    list_jobs # Get the jobs based on the latest options
    @pp_choices = PPCHOICES2                             # Get special pp choices for jobs/tasks lists

    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << "miqSetButtons(0, 'center_tb');"                             # Reset the center toolbar
      page.replace("main_div", :partial => "layouts/tasks")
      page.replace_html("paging_div", :partial => 'layouts/pagingcontrols',
                                      :locals  => {:pages      => @pages,
                                                   :action_url => @lastaction,
                                                   :db         => @view.db,
                                                   :headers    => @view.headers})
      page << "miqSparkle(false);"
    end
  end

  private ############################

  def db_class
    case @tabform
    when 'tasks_1', 'tasks_3' then Job
    when 'tasks_2', 'tasks_4' then MiqTask
    end
  end

  def db_table
    case @tabform
    when 'tasks_1', 'tasks_3' then ""
    when 'tasks_2', 'tasks_4' then "miq_tasks."
    end
  end

  # Set all task options to default
  def tasks_set_default_options
    @tasks_options[@tabform] = {
      :ok           => true,
      :queued       => true,
      :error        => true,
      :warn         => true,
      :running      => true,
      :states       => %w(tasks_1 tasks_3).include?(@tabform) ? SP_STATES : UI_STATES,
      :state_choice => "all",
      :time_period  => 0,
    }

    @tasks_options[@tabform][:zone]        = "<all>" if %w(tasks_1 tasks_3).include?(@tabform)
    @tasks_options[@tabform][:user_choice] = "all"   if %w(tasks_1 tasks_4).include?(@tabform)
  end

  # Create a condition from the passed in options
  def tasks_condition(opts, use_times = true)
    cond = [[]]

    cond = add_to_condition(cond, "jobs.guid IS NULL", nil) unless vm_analysis_task?

    cond = add_to_condition(cond, *build_query_for_userid(opts))

    if !opts[:ok] && !opts[:queued] && !opts[:error] && !opts[:warn] && !opts[:running]
      query, values = build_query_for_status_none_selected
    else
      query, *values = build_query_for_status(opts)
    end
    cond = add_to_condition(cond, query, values)

    # Add time condition
    cond = add_to_condition(cond, *build_query_for_time_period(opts)) if use_times

    # Add zone condition
    cond = add_to_condition(cond, *build_query_for_zone(opts)) if vm_analysis_task? && opts[:zone] != "<all>"

    cond = add_to_condition(cond, *build_query_for_state(opts)) if opts[:state_choice] != "all"

    cond[0] = cond[0].join(" AND ")
    cond.flatten
  end

  def add_to_condition(cond, query, values)
    cond[0] << query unless query.nil?
    cond << values unless values.nil?
    cond
  end

  def build_query_for_userid(opts)
    sql = "#{db_table}userid=?"
    if %w(tasks_1 tasks_2).include?(@tabform)
      [sql, session[:userid]]
    elsif opts[:user_choice] && opts[:user_choice] != "all"
      [sql, opts[:user_choice]]
    else
      [nil, nil]
    end
  end

  def build_query_for_status(opts)
    cond = [[]]
    [:queued, :ok, :error, :warn, :running].each do |st|
      cond = add_to_condition(cond, *send("build_query_for_" + st.to_s)) if opts[st]
    end

    cond[0] = "(#{cond[0].join(" OR ")})"
    cond
  end

  def build_query_for_queued
    ["(#{db_table}state=? OR #{db_table}state=?)", %w(waiting_to_start Queued)]
  end

  def build_query_for_ok
    build_query_for_status_completed("ok")
  end

  def build_query_for_error
    build_query_for_status_completed("error")
  end

  def build_query_for_warn
    build_query_for_status_completed("warn")
  end

  def build_query_for_status_completed(status)
    sql = "(#{db_table}state=? AND #{db_table}status=?)"
    if vm_analysis_task?
      [sql, ["finished", status]]
    else
      [sql, ["Finished", status.capitalize]]
    end
  end

  def build_query_for_running
    sql = "(#{db_table}state!=? AND #{db_table}state!=? AND #{db_table}state!=?)"
    if vm_analysis_task?
      [sql, %w(finished waiting_to_start queued)]
    else
      [sql, %w(Finished waiting_to_start Queued)]
    end
  end

  def build_query_for_status_none_selected
    sql = "(#{db_table}status!=? AND #{db_table}status!=? AND #{db_table}status!=? AND "\
          "#{db_table}state!=? AND #{db_table}state!=?)"
    if vm_analysis_task?
      [sql, %w(ok error warn finished waiting_to_start)]
    else
      [sql, %w(Ok Error Warn Finished Queued)]
    end
  end

  def build_query_for_time_period(opts)
    t = format_timezone(opts[:time_period].to_i != 0 ? opts[:time_period].days.ago : Time.now, Time.zone, "raw")
    ["#{db_table}updated_on>=? AND #{db_table}updated_on<=?", [t.beginning_of_day, t.end_of_day]]
  end

  def build_query_for_zone(opts)
    ["#{db_table}zone=?", opts[:zone]]
  end

  def build_query_for_state(opts)
    ["#{db_table}state=?", opts[:state_choice]]
  end

  def vm_analysis_task?
    %w(tasks_1 tasks_3).include?(@tabform)
  end

  def reloadjobs
    assert_privileges("miq_task_reload")
    jobs
    @refresh_partial = "layouts/tasks"
  end

  def get_layout
    %w(my_tasks my_ui_tasks all_tasks all_ui_tasks).include?(session[:layout]) ? session[:layout] : "my_tasks"
  end

  def get_session_data
    super
    @layout = get_layout
    @tasks_tab     = session[:tasks_tab] if session[:tasks_tab]
    @tabform       = session[:tabform]  if session[:tabform]
  end

  def set_session_data
    super
    session[:tasks_tab]            = @tasks_tab
    session[:tabform]             = @tabform
    session[:layout]              = @layout
  end

  menu_section :set
end
