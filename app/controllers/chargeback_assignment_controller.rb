class ChargebackAssignmentController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  def self.table_name
    @table_name ||= "chargeback_assignment"
  end

  def index
    assert_privileges("chargeback_assignments")

    @tabform = ChargebackRate::VALID_CB_RATE_TYPES.include?(params[:tab]) ? params[:tab] : "Compute"
  end

  private ############################

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Overview")},
        {:title => _("Chargeback")},
        {:title => _("Assignments"), :url => controller_url},
      ],
    }
  end

  menu_section :chargeback
end
