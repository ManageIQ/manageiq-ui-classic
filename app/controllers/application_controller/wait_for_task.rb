module ApplicationController::WaitForTask
  extend ActiveSupport::Concern

  ###########################################################################
  # Use ajax to retry until the passed in task is complete, then rerun the original action
  # This action can be called directly or via URL
  # If called directly, options will have the task_id
  # Otherwise, task_id will be in the params
  ###########################################################################
  def wait_for_task
    @edit = session[:edit]  # If in edit, need to preserve @edit object
    raise Forbidden, _('Invalid input for "wait_for_task".') unless params[:task_id]

    async_interval = params[:async_interval] || 1000 # Default interval to 1 second

    task = MiqTask.find(params[:task_id].to_i)
    if task.state != "Finished" # Task not done --> retry
      browser_refresh_task(params[:task_id], async_interval)
    else # Task done
      async_params = task.context_data[:async_params]
      async_params.each { |k, v| @_params[k] = v } # Merge in the original params and
      send(async_params[:action]) # call the orig. method
    end
  end

  def browser_refresh_task(task_id, async_interval, should_flash: false)
    async_interval = 1000 if async_interval.to_i < 1000 # if it is not an integer, assign to 1 second
    async_interval += 250 if async_interval < 5000 # Slowly move up to 5 second retries
    render :update do |page|
      page << javascript_prologue
      ajax_call = remote_function(:url => {:action => 'wait_for_task', :task_id => task_id, :async_interval => async_interval})
      page << "setTimeout(\"#{ajax_call}\", #{async_interval});"
      page.replace("flash_msg_div", :partial => "layouts/flash_msg") if should_flash
      page << "miqScrollTop();" if @flash_array.present?
    end
  end
  private :browser_refresh_task

  #
  # @option options :task_id [Numeric] id of task to wait for
  # @option options :action  [String] action to be called when the task finishes
  # @option options :rx_action [String]  a method to create a RxJs message
  # @option options :flash [Boolean] output queued flash messages *while waiting*
  # @option options :extra_params [Hash] asynchronous
  #
  def initiate_wait_for_task(options = {})
    task_id = options[:task_id]
    async_interval = 1000 # Default interval to 1 second

    # save the incoming params + extra_params
    async_params = params.to_unsafe_h.merge(options[:extra_params] || {})
    async_params[:task_id] = task_id

    # override method to be called, when the task is done
    async_params[:action] = options[:action] if options.key?(:action)

    if options.key?(:rx_action)
      raise "Unsupported combination" if options.key?(:action)

      async_params[:action] = 'wait_for_task_rx'
      async_params[:rx_action] = options[:rx_action]
    end

    task = MiqTask.find(task_id)
    task.context_data = (task.context_data || {}).merge(:async_params => async_params)
    task.save!

    browser_refresh_task(task_id, async_interval, :should_flash => !!options[:flash])
  end
  private :initiate_wait_for_task

  # used for any task with rx_action
  def wait_for_task_rx
    task_id = params[:task_id]
    task = MiqTask.find(task_id)
    async_params = task.context_data[:async_params]
    rx_action = async_params[:rx_action]

    result = send(rx_action, task)
    raise "Non-hash rx_action return" unless result.kind_of?(Hash)

    presenter = ExplorerPresenter.rx(:rx => result)
    render :json => presenter.for_render
  end
  private :wait_for_task_rx
end
