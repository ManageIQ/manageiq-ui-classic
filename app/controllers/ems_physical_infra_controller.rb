class EmsPhysicalInfraController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include EmsCommon # common methods for EmsInfra/Cloud controllers
  include Mixins::EmsCommonAngular

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::PhysicalInfraManager
  end

  def self.table_name
    @table_name ||= "ems_physical_infra"
  end

  def ems_path(*args)
    ems_physical_infra_path(*args)
  end

  def new_ems_path
    new_ems_physical_infra_path
  end

  def ems_physical_infra_form_fields
    ems_form_fields
  end

  private

  ############################
  # Special EmsCloud link builder for restful routes
  def show_link(ems, options = {})
    ems_path(ems.id, options)
  end

  def log_and_flash_message(message)
    add_flash(message, :error)
    $log.error(message)
  end

  def restful?
    true
  end
  public :restful?

  menu_section :phy
end
