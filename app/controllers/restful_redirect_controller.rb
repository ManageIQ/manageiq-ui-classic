class RestfulRedirectController < ApplicationController
  before_action :check_privileges

  def index
    case params[:model]
    when 'MiqRequest'
      redirect_to :controller => 'miq_request', :action => 'show', :id => params[:id]
    when 'VmOrTemplate'
      klass = VmOrTemplate.select(:id, :type).find(params[:id]).try(:class)
      controller = if klass && (VmCloud > klass || TemplateCloud > klass)
                     'vm_cloud'
                   else
                     'vm_infra'
                   end
      redirect_to :controller => controller, :action => 'show', :id => params[:id]
    else
      flash_to_session(_("Could not find the given \"%{model}\" record.") % {:model => ui_lookup(:model => params[:model])}, :error)
      redirect_to(:controller => 'dashboard', :action => 'show')
    end
  end
end
