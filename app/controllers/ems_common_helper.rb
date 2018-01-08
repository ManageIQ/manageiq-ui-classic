module EmsCommonHelper
  def add_task_flash(emss, action_name)
    msg_params = {
      :action_name => action_name,
      :count       => emss.length,
      :model       => _(table_name.humanize),
      :models      => _(table_name.humanize.pluralize)
    }
    add_flash(n_("%<action_name>s initiated for one %<model>s",
                 "%<action_name>s initiated for %<count>d %<models>s", emss.length) % msg_params)
  end

  def add_success_audit(emss, task)
    msg_params = {
      :task   => task,
      :model  => _(table_name.humanize),
      :models => _(table_name.humanize.pluralize),
    }
    msg = n_("'%<task>s' successfully initiated for %<model>s",
             "'%<task>s' successfully initiated for %<models>s", emss.length) % msg_params
    audit = {
      :userid       => session[:userid],
      :event        => "#{table_name}_#{task}",
      :target_class => model.to_s,
      :message      => msg,
    }
    AuditEvent.success(audit)
  end

  def find_ems_list_for_action(action_name)
    emss = find_records_with_rbac(model, checked_or_params)
    if emss.empty?
      msg_params = {
        :model       => _(table_name.humanize),
        :action_name => action_name
      }
      add_flash(_("No %<model>s were selected for %<action_name>s") % msg_params, :error)
      return
    end

    emss
  end

  def find_single_ems_for_action
    ems = find_record_with_rbac(model, params[:id])
    if ems.nil?
      add_flash(_("%<record>s no longer exists") % { :record => _(table_name.humanize) }, :error)
      return
    end

    ems
  end

  def find_emss_for_action(action_name)
    if @lastaction == "show_list"
      find_ems_list_for_action(action_name)
    else
      [find_single_ems_for_action]
    end
  end

  def refresh_or_capture_emss(task, action_name)
    emss = find_emss_for_action(action_name)
    return if emss.compact.empty?

    if task == "refresh_ems"
      model.refresh_ems(emss, true)
    elsif task == "capture_ems"
      emss.each(&:queue_metrics_capture)
    end

    add_task_flash(emss, action_name)
    add_success_audit(emss, task)

    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    else
      params[:display] = @display
    end
  end
end
