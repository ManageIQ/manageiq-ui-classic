module OpsHelper::MyServer
  def my_zone_name
    my_server.my_zone
  end

  def my_server
    MiqServer.my_server
  end
end
