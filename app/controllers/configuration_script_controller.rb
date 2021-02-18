class ConfigurationScriptController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :at
  feature_for_actions controller_name, *ADV_SEARCH_ACTIONS

  def self.table_name
    @table_name ||= "configuration_script"
  end

  def button
    case params[:pressed]
    when "configuration_script_tag"
      tag(self.class.model)
    end
  end

  def download_data
    assert_privileges('configuration_script_view')
    super
  end

  def download_summary_pdf
    assert_privileges('configuration_script_view')
    super
  end

  def configuration_script_service_dialog
    assert_privileges("configuration_script_service_dialog")
    cs = ConfigurationScript.find_by(:id => params[:miq_grid_checks] || params[:id])
    @edit = {:rec_id => cs.id}
    @in_a_form = true
  end

  private

  def textual_group_list
    [%i[properties tags]]
  end
  helper_method :textual_group_list

  def locals_for_service_dialog
    {:action_url => 'service_dialog',
     :no_reset   => true,
     :record_id  => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]}
  end

  def update_service_dialog_partials(presenter)
    presenter.update(:main_div, r[:partial => 'configscript_service_dialog',
                                  :locals  => locals_for_service_dialog])
  end

  def get_session_data
    @title = _("Templates")
    @layout = "configuration_script"
    @lastaction = session[:configuration_script_lastaction]
    @display = session[:configuration_script_display]
    @current_page = session[:configuration_script_current_page]
  end

  def set_session_data
    super
    session[:layout]                 = @layout
    session[:configuration_script_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Templates"), :url => controller_url},
      ],
    }
  end
end
