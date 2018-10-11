class RestfulRedirectController < ApplicationController
  before_action :check_privileges

  def index
    case params[:model]
    when 'ExtManagementSystem'
      record = ExtManagementSystem.find_by(:id => params[:id])
      record ? redirect_to(polymorphic_path(record)) : handle_missing_record
    when 'ServiceTemplateTransformationPlanRequest'
      req = ServiceTemplateTransformationPlanRequest.select(:source_id).find(params[:id])
      req ? redirect_to(:controller => 'migration', :action => 'index', :anchor => "plan/#{req.source_id}") : handle_missing_record
    when 'MiqRequest'
      redirect_to(:controller => 'miq_request', :action => 'show', :id => params[:id])
    when 'VmOrTemplate'
      klass = VmOrTemplate.select(:id, :type).find(params[:id]).try(:class)
      controller = if klass && (VmCloud > klass || TemplateCloud > klass)
                     'vm_cloud'
                   else
                     'vm_infra'
                   end
      redirect_to(:controller => controller, :action => 'show', :id => params[:id])
    else
      handle_missing_record
    end
  end

  def handle_missing_record
    flash_to_session(_("Could not find the given \"%{model}\" record.") % {:model => ui_lookup(:model => params[:model])}, :error)
    redirect_to(:controller => 'dashboard', :action => 'show')
  end
end
