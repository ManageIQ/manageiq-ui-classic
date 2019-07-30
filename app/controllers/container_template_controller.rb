class ContainerTemplateController < ApplicationController
  include ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  private

  def textual_group_list
    [%i[properties parameters objects], %i[relationships container_labels smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Templates"), :url => controller_url},
      ],
      :record_info  => (action_name == "service_dialog_from_ct" ? {:title => params["id"], :id => params["id"]} : nil),
      :record_title => :title,
    }.compact
  end

  menu_section :cnt

  has_custom_buttons
end
