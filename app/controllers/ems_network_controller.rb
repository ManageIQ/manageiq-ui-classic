class EmsNetworkController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon
  include Mixins::EmsCommonAngular
  include Mixins::GenericSessionMixin
  include Mixins::NetworksBreadcrumbMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::NetworkManager
  end

  def self.table_name
    @table_name ||= "ems_network"
  end

  def ems_path(*args)
    ems_network_path(*args)
  end

  def new_ems_path
    {:action => 'new'}
  end

  def ems_network_form_fields
    ems_form_fields
  end

  def restful?
    true
  end
  public :restful?

  def model_feature_for_action(action)
    case action
    when :edit
      :ems_network_new
    end
  end

  def breadcrumbs_options
    @breadcrumbs_start = [{:title => _("Networks")}, {:title => _("Providers")}]
    @show_list_title = _("Network Managers")
    @custom_record = {"title" => @ems.name, "id" => @ems.id} unless @ems.nil?
    @notshow = "true"
  end

  menu_section :net
  has_custom_buttons
end
