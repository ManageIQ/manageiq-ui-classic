class DatawarehouseNodeController < ApplicationController
  include DatawarehouseCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    @listicon = "datawarehouse_node"
    process_show_list
  end

  menu_section :dwh
end
