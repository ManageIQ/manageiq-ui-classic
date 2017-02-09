module ChargebackPreview
  extend ActiveSupport::Concern

  def vm_chargeback
    @sb[:action] ||= 'chargeback'
    @vm = @record = identify_record(params[:id], VmOrTemplate)

    if params[:task_id]
      miq_task = MiqTask.find(params[:task_id])
      if !miq_task.results_ready?
        add_flash(_("Report preview generation returned: Status [%{status}] Message [%{message}]") %
                  {:status => miq_task.status, :message => miq_task.message}, :error)
      else
        rr = miq_task.miq_report_result
        @html = report_build_html_table(rr.report_results, rr.html_rows.join)
        @refresh_partial = 'vm_common/chargeback'
        miq_task.destroy
      end
    else
      rpt = perf_get_chart_rpt('vm_chargeback')
      rpt.db_options[:options][:entity_id] = @vm.id
      # TODO: Use user's timezone
      initiate_wait_for_task(:task_id => rpt.async_generate_table(:userid => session[:userid]))
    end
  end
end
