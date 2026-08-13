module Mixins
  module PodRemoteMixin
    def kube_exec_console
      assert_privileges("container_group_kube_exec_console")
      respond_to do |format|
        format.json do
          if params[:task_id]
            console_after_task('kube_exec')
          else
            console_before_task('kube_exec', params[:container])
          end
        end
      end
    end

    private

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

    def console_after_task(_console_type)
      miq_task = MiqTask.find(params.expect(:task_id))

      if miq_task.state == "Finished"
        if miq_task.status == "Ok"
          render :json => miq_task.task_results
        else
          render :json => {:error => miq_task.message}
        end
      else
        render :json => {:state => miq_task.state}
      end
    end
  end
end
