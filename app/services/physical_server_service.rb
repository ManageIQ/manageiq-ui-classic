class PhysicalServerService
  include UiServiceMixin


  def initialize(server_id, controller)
    @server_id = server_id
    @server = PhysicalServer.find(@server_id) unless @server_id.blank?
    @controller = controller
  end




end
