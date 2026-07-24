module PodRemote
  extend ActiveSupport::Concern

  def kube_exec_console
    params[:task_id] ? console_after_task('kube_exec') : console_before_task('kube_exec', params[:container])
  end

  private

  # Mirrors VmRemote#console_before_task — provider/protocol name comes from the caller, not hardcoded here
  def console_before_task(console_type, container_name = nil)
    ticket_type = console_type.to_sym
    record = identify_record(params[:id], ContainerGroup)

    container_id = container_name.present? ? record.containers.find_by(:name => container_name)&.id : nil

    task_id = record.remote_console_acquire_ticket_queue(ticket_type, session[:userid], container_id)

    if task_id.kind_of?(Integer)
      render :json => {:task_id => task_id}
    else
      render :json => {:error => _("Console access failed: Task start failed")}
    end
  end

  # Mirrors VmRemote#console_after_task, but returns JSON instead of opening a window —
  # xterm.js needs the connection params in-page, it can't be handed a new browser window
  # the way VNC/WebMKS consoles are.
  def console_after_task(_console_type)
    miq_task = MiqTask.find(params.expect(:task_id))

    if miq_task.state == "Finished"
      if miq_task.status == "Ok"
        render :json => miq_task.task_results
      else
        render :json => {:error => miq_task.message}
      end
    else
      # Still queued/active — not an error, just not done yet
      render :json => {:state => miq_task.state}
    end
  end
end
