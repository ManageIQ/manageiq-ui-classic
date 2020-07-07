class ContainerImageController < ApplicationController
  include ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def textual_group_list
    [
      %i[properties container_labels compliance],
      %i[relationships smart_management configuration openscap_failed_rules],
      %i[env container_docker_labels]
    ]
  end
  helper_method :textual_group_list

  def show_list
    process_show_list(:named_scope => :active)
  end

  def guest_applications
    show_association('guest_applications', _('Packages'), :guest_applications, GuestApplication)
  end

  def openscap_rule_results
    show_association('openscap_rule_results', 'Openscap', :openscap_rule_results,
                     OpenscapRuleResult)
  end

  def openscap_html
    @record = identify_record(params[:id])
    send_data(@record.openscap_result.html, :filename => openscap_filename(@record))
  end

  def openscap_filename(image)
    result = ''
    result << "#{image.container_image_registry.full_name}_" unless image.container_image_registry.nil?
    result << image.name.to_s
    result << ":#{image.tag}" unless image.tag.nil?
    result = 'openscap_report' if result.empty?
    result << '.html'
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Images")},
        {:url   => controller_url, :title => _("Container Images")},
      ],
    }
  end

  has_custom_buttons
end
