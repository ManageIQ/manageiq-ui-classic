class RestfulRedirectController < ApplicationController
  before_action :check_privileges

  def index
    case params[:model]
    when 'ExtManagementSystem'
      record = ExtManagementSystem.find_by(:id => params[:id])
      if record
        if record.kind_of?(EmsConfiguration)
          redirect_to(:controller => 'ems_configuration', :action => 'show', :id => params[:id])
        elsif record.kind_of?(ManageIQ::Providers::ExternalAutomationManager)
          redirect_to(:controller => 'ems_automation', :action => 'show', :id => params[:id])
        elsif record.kind_of?(ManageIQ::Providers::EmbeddedAnsible::AutomationManager)
          redirect_to(:controller => 'ansible_playbook', :action => 'show_list')
        else
          begin
            redirect_to(polymorphic_path(record))
          rescue NoMethodError
            flash_to_session(_("Cannot redirect to \"%{record}\" provider.") % {:record => record.name}, :error)
            redirect_to(:controller => 'ops', :action => 'explorer')
          end
        end
      else
        handle_missing_record
      end
    when 'MiqRequest'
      redirect_to(:controller => 'miq_request', :action => 'show', :id => params[:id])
    when 'VmOrTemplate'
      record = VmOrTemplate.select(:id, :type).find(params[:id])
      record ? handle_vm_redirect(record) : handle_missing_record
    else
      if params[:model].starts_with?('ExtManagementSystem')
        params[:model], params[:id] = params[:model].split('/')
        index
      else
        handle_missing_record
      end
    end
  end

  private

  def handle_vm_redirect(record)
    klass = record.class
    controller = if klass && (VmCloud > klass || TemplateCloud > klass)
                   'vm_cloud'
                 else
                   'vm_infra'
                 end
    redirect_to(:controller => controller, :action => 'show', :id => params[:id])
  end

  def handle_missing_record
    flash_to_session(_("Could not find the given \"%{model}\" record.") % {:model => ui_lookup(:model => params[:model])}, :error)
    redirect_to(:controller => 'dashboard', :action => 'show')
  end
end
