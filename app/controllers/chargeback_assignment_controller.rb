class ChargebackAssignmentController < ApplicationController
  before_action :check_privileges
  after_action :cleanup_action

  include Mixins::BreadcrumbsMixin

  def self.table_name
    @table_name ||= "chargeback_assignment"
  end

  def index
    assert_privileges("chargeback_assignments")

    @layout  = self.class.table_name
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
