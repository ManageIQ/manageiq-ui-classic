class RestfulRedirectController < ApplicationController
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
      flash_to_session(_("Could not find %{model}[id=%{id}]") % {:model => params[:model], :id => params[:id]})
      redirect_to(:controller => 'dashboard')
    end
  end
end
