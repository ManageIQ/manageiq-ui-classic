class MiqTaskController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin

  def index
    @tabform = nil
    # TODO: remove :feature => "job_my_smartproxy" and  :feature => "job_all_smartproxy" from miq_user_roles.yml
    # above features assigned to the same roles as corresponding :feature => "miq_task_my_ui"
    # and :feature => "miq_task_all_ui"
    @tabform ||= "tasks_1" if role_allows?(:feature => "miq_task_my_ui")
    @tabform ||= "tasks_2" if role_allows?(:feature => "miq_task_all_ui")
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

    if role_allows?(:feature => "miq_task_my_ui")
      @tabs.push(["1", _("My Tasks")])
    end
    if role_allows?(:feature => "miq_task_all_ui")
      @tabs.push(["2", _("All Tasks")])
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
    when "tasks_2", "alltasks_2" then @layout = "all_tasks"
    end

    @view, @pages = get_view(MiqTask, :conditions => tasks_condition(@tasks_options[@tabform]))
    @user_names = MiqTask.distinct.pluck("userid").delete_if(&:blank?) if @active_tab.to_i == 2
  end

  # Cancel a single selected job
  def cancel_task
    assert_privileges("miq_task_canceljob")
    task_id = find_checked_items
    task = MiqTask.find_by(:id => task_id)
    message = if task.nil?
                task_id.empty? ? _("No task were selected to cancel") : _("Task %{id} not found") % {:id => task_id}
              elsif task.state.downcase == "finished"
                _("Finished Task cannot be cancelled")
              else
                task.process_cancel
              end
    add_flash(message, :error)
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete selected tasks
  def delete_tasks
    assert_privileges("miq_task_delete")
    delete_tasks_from_table(find_checked_items, "Delete selected tasks")
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete all finished job(s)
  def delete_all_tasks
    assert_privileges("miq_task_deleteall")
    task_ids = []
    session[:view].table.data.each do |rec|
      task_ids.push(rec["id"])
    end
    delete_tasks_from_table(task_ids, "Delete all finished tasks")
    jobs
    @refresh_partial = "layouts/tasks"
  end

  # Delete all task(s) older than selected task(s)
  def delete_older_tasks
    assert_privileges("miq_task_deleteolder")
    taskid = find_checked_items
    task = MiqTask.find_by(:id => taskid)
    if task
      MiqTask.delete_older(task.updated_on, tasks_condition(@tasks_options[@tabform], false))
      message = _("Delete started for records older than %{date}, conditions: %{conditions}") %
                {:date => task.updated_on, :conditions => @tasks_options[@tabform].inspect}
      AuditEvent.success(:userid       => session[:userid],
                         :event        => "Delete older tasks",
                         :message      => message,
                         :target_class => "MiqTask")
      add_flash(_("Deleting all Tasks older than %{date} from the %{product} Database initiated") %
                 {:date => task.updated_on, :product => I18n.t('product.name')})
    else
      add_flash(_("The selected task no longer exists, Delete all older Tasks was not completed"), :warning)
    end
    jobs
    @refresh_partial = "layouts/tasks"
  end


  TASK_X_BUTTON_ALLOWED_ACTIONS =  {
    "miq_task_delete"      => :delete_tasks,
    "miq_task_deleteall"   => :delete_all_tasks,
    "miq_task_deleteolder" => :delete_older_tasks,
    "miq_task_canceljob"   => :cancel_task,
    "miq_task_reload"      => :reload_tasks,
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

  def delete_tasks_from_table(task_ids, event_message)
    if task_ids.empty?
      add_flash(_("No task were selected to delete"), :error)
    else
      MiqTask.delete_by_id(task_ids)
      AuditEvent.success(:userid       => session[:userid],
                         :event        => event_message,
                         :message      => _("Delete started for record ids: %{id}") % {:id => task_ids.inspect},
                         :target_class => "MiqTask")
      add_flash(n_("Delete initiated for %{count} Task from the %{product} Database",
                   "Delete initiated for %{count} Tasks from the %{product} Database",
                   task_ids.length) % {:count => task_ids.length, :product => I18n.t('product.name')})
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
      :states       => UiConstants::TASK_STATES,
      :state_choice => "all",
      :time_period  => 0,
    }

    @tasks_options[@tabform][:zone]        = "<all>"
    @tasks_options[@tabform][:user_choice] = "all" if "tasks_2" == @tabform
  end

  # Create a condition from the passed in options
  def tasks_condition(opts, use_times = true)
    cond = [[]]
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
    cond = add_to_condition(cond, *build_query_for_zone(opts)) if opts[:zone] && opts[:zone] != "<all>"

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
    sql = "miq_tasks.userid=?"
    if "tasks_1" == @tabform
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
    ["(miq_tasks.state=? OR miq_tasks.state=?)", %w(Waiting_to_start Queued)]
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
    sql = "(miq_tasks.state=? AND miq_tasks.status=?)"
    [sql, ["Finished", status.try(:capitalize)]]
  end

  def build_query_for_running
    sql = "(miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)"
    [sql, %w(Finished Waiting_to_start Queued)]
  end

  def build_query_for_status_none_selected
    sql = "(miq_tasks.status!=? AND miq_tasks.status!=? AND miq_tasks.status!=? AND "\
          "miq_tasks.state!=? AND miq_tasks.state!=? AND miq_tasks.state!=?)"
    [sql, %w(Ok Error Warn Finished Queued Waiting_to_start)]
  end

  def build_query_for_time_period(opts)
    t = format_timezone(opts[:time_period].to_i != 0 ? opts[:time_period].days.ago : Time.now, Time.zone, "raw")
    ["miq_tasks.updated_on>=? AND miq_tasks.updated_on<=?", [t.beginning_of_day, t.end_of_day]]
  end

  def build_query_for_zone(opts)
    ["miq_tasks.zone=?", opts[:zone]]
  end

  def build_query_for_state(opts)
    ["miq_tasks.state=?", opts[:state_choice]]
  end

  def reload_tasks
    assert_privileges("miq_task_reload")
    jobs
    @refresh_partial = "layouts/tasks"
  end

  def get_layout
    %w(my_tasks all_tasks).include?(session[:layout]) ? session[:layout] : "my_tasks"
  end

  def get_session_data
    super
    @layout = get_layout
    @tabform       = session[:tabform]  if session[:tabform]
    @tasks_options = session[:tasks_options] || ""
  end

  def set_session_data
    super
    session[:tabform]             = @tabform
    session[:layout]              = @layout
    session[:tasks_options]       = @tasks_options unless @tasks_options.nil?
  end

  menu_section :set
end
