class ContainerImageController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def textual_group_list
    [
      %i(properties container_labels compliance),
      %i(relationships smart_management configuration openscap_failed_rules),
      %i(env container_docker_labels)
    ]
  end
  helper_method :textual_group_list

  def show_list
    process_show_list(:where_clause => 'container_images.deleted_on IS NULL')
  end

  def guest_applications
    show_association('guest_applications', _('Packages'), 'guest_application', :guest_applications, GuestApplication)
  end

  def openscap_rule_results
    show_association('openscap_rule_results', 'Openscap', 'openscap_rule_result', :openscap_rule_results,
                     OpenscapRuleResult)
  end

  def openscap_html
    @record = identify_record(params[:id])

    send_data(@record.openscap_result.html, :filename => "openscap_result.html")
  end

  def handled_buttons
    %(
      container_image_tag
      container_image_scan
      container_image_protect
      container_image_check_compliance
    )
  end

  def handle_container_image_protect
    assign_policies(ContainerImage)
  end

  def handle_container_image_check_compliance
    check_compliance(ContainerImage)
  end

  # Scan all selected or single displayed image(s)
  def handle_container_image_scan
    assert_privileges("image_scan")
    showlist = @lastaction == "show_list"
    ids = showlist ? find_checked_items : find_current_item(ContainerImage)

    if ids.empty?
      add_flash(_("No %{model} were selected for Analysis") % {:model => ui_lookup(:tables => "container_image")},
                :error)
    else
      process_scan_images(ids)
    end

    showlist ? show_list : show
    ids.count

    if @lastaction == "show"
      javascript_flash
    else
      replace_main_div :partial => "layouts/gtl"
    end
  end

  menu_section :cnt
end
