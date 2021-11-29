class HostInitiatorGroupController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w[cloud_volumes]
  end

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
    super
  end

  private

  def textual_group_list
    [%i[properties san_addresses], %i[tags]]
  end
  helper_method :textual_group_list

  def set_session_data
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Host Initiator Groups"), :url => controller_url},
      ],
    }
  end

  menu_section "host_initiator_group"

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_show_list", :download_data
  feature_for_actions "#{controller_name}_show", :download_summary_pdf

  toolbar :host_initiator_group, :host_initiator_groups
end
