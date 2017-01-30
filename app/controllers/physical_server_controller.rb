class PhysicalServerController  < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin



  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data


	def self.model
		ManageIQ::Providers::PhysicalServer
	end

  def self.table_name
    @table_name ||= "physical_servers"
  end





end
