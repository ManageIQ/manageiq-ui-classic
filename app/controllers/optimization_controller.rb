class OptimizationController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.model
    MiqReport
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _('Overview')},
        {
          :title => _('Optimization'),
          :url   => url_for_only_path(:controller => 'optimization', :action => 'show_list'),
        },
      ],
    }
  end

  def index
    redirect_to(:action => 'show_list')
  end

  def show
    render :text => "TODO"
  end

  def show_list
    render :text => "TODO"
  end
end
