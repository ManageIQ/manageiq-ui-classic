class GuestDeviceController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    @model ||= "GuestDevice".safe_constantize
  end

  def title
    _('Guest Devices')
  end

  def model
    self.class.model
  end

  def self.table_name
    @table_name ||= "guest_devices"
  end

  def session_data
    @title  = _("Guest Devices")
    @layout = "guest_device"
    @lastaction = session[:guest_device_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:guest_device_lastaction] = @lastaction
  end

  def show_list
    options = {:model => "GuestDevice", :named_scope => [:with_ethernet_type]}
    process_show_list(options)
  end
end
