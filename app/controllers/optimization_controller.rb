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

  def self.hardcoded_reports
    [
      # 400_Operations- Virtual Machines/045_VMs_ Offline VMs with Snapshot.yaml
      MiqReport.find_by!(:menu_name => 'Offline VMs with Snapshot'),
      # 425_VM Sprawl - Candidates/052_VMs with Volume Free Space -= 75%.yaml
      MiqReport.find_by!(:menu_name => 'VMs with Volume Free Space >= 75%'),
      # 650_Performance by Asset Type - Virtual Machines/160_Top CPU Consumers weekly.yaml
      MiqReport.find_by!(:menu_name => 'Top CPU Consumers (weekly)'),
      # 650_Performance by Asset Type - Virtual Machines/170_Top Memory Consumers weekly.yaml
      MiqReport.find_by!(:menu_name => 'Top Memory Consumers (weekly)'),
      # 770_Trending - Hosts/120_Host CPU Trends last week.yaml
      MiqReport.find_by!(:menu_name => 'Host CPU Trends (last week)'),
      # 770_Trending - Hosts/140_Host Memory Trends last week.yaml
      MiqReport.find_by!(:menu_name => 'Host Memory Trends (last week)'),
    ].sort_by(&:title)
  end
end
