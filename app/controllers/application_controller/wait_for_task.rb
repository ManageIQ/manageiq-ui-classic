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

    @edit = session[:edit]  # If in edit, need to preserve @edit object
    session[:async] ||= {}
    session[:async][:interval] ||= 1000 # Default interval to 1 second
    session[:async][:params] ||= {}

    if MiqTask.find(params[:task_id].to_i).state != "Finished" # Task not done --> retry
      browser_refresh_task(params[:task_id])
    else # Task done
      @_params.instance_variable_get(:@parameters).merge!(session[:async][:params]) # Merge in the original parms and
      send(session.fetch_path(:async, :params, :action)) # call the orig. method
    end
  end

  def browser_refresh_task(task_id)
    session[:async][:interval] += 250 if session[:async][:interval] < 5000 # Slowly move up to 5 second retries
    render :update do |page|
      page << javascript_prologue
      ajax_call = remote_function(:url => {:action => 'wait_for_task', :task_id => task_id})
      page << "setTimeout(\"#{ajax_call}\", #{session[:async][:interval]});"
    end
  end
  private :browser_refresh_task

  #
  # :task_id => id of task to wait for
  # :action  => 'action_to_call' -- action to be called when the task finishes
  #
  def initiate_wait_for_task(options = {})
    task_id = options[:task_id]
    session[:async] ||= {}
    session[:async][:interval] ||= 1000 # Default interval to 1 second
    session[:async][:params] ||= {}

    session[:async][:params] = params.deep_dup # Save the incoming parms
    session[:async][:params][:task_id] = task_id

    # override method to be called, when the task is done
    session[:async][:params][:action] = options[:action] if options.key?(:action)

    browser_refresh_task(task_id)
  end
  private :initiate_wait_for_task
end
