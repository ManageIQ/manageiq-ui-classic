shared_context :shared_network_manager_context do |t|
  before do
    @ems_cloud      = FactoryBot.create("ems_#{t}".to_sym,
                                         :name => "Cloud Manager")
    @ems            = @ems_cloud.network_manager
    @security_group = FactoryBot.create("security_group_#{t}".to_sym,
                                         :ext_management_system => @ems,
                                         :name                  => 'Security Group')
    @vm             = FactoryBot.create("vm_#{t}".to_sym,
                                         :name                  => "Instance",
                                         :ext_management_system => @ems)
    if t == 'openstack'
      @cloud_network        = FactoryBot.create("cloud_network_private_#{t}".to_sym,
                                                 :name                  => "Cloud Network",
                                                 :ext_management_system => @ems)
      @cloud_network_public = FactoryBot.create("cloud_network_public_#{t}".to_sym,
                                                 :name                  => "Cloud Network Public",
                                                 :ext_management_system => @ems)
    else
      @cloud_network        = FactoryBot.create("cloud_network_#{t}".to_sym,
                                                 :name                  => "Cloud Network",
                                                 :ext_management_system => @ems)
      @cloud_network_public = nil
    end

    @network_router = FactoryBot.create("network_router_#{t}".to_sym,
                                         :cloud_network         => @cloud_network_public,
                                         :name                  => "Network Router",
                                         :ext_management_system => @ems)
    @cloud_subnet   = FactoryBot.create("cloud_subnet_#{t}".to_sym,
                                         :network_router        => @network_router,
                                         :cloud_network         => @cloud_network,
                                         :ext_management_system => @ems,
                                         :name                  => "Cloud Subnet")
    @child_subnet   = FactoryBot.create("cloud_subnet_#{t}".to_sym,
                                         :name                  => "Child Cloud Subnet",
                                         :parent_cloud_subnet   => @cloud_subnet,
                                         :ext_management_system => @ems)
    @floating_ip    = FactoryBot.create("floating_ip_#{t}".to_sym,
                                         :address               => "192.0.2.1",
                                         :ext_management_system => @ems)

    @vm.network_ports << @network_port = FactoryBot.create("network_port_#{t}".to_sym,
                                                            :name                  => "eth0",
                                                            :mac_address           => "06:04:25:40:8e:79",
                                                            :device                => @vm,
                                                            :security_groups       => [@security_group],
                                                            :floating_ip           => @floating_ip,
                                                            :ext_management_system => @ems)

    @load_balancer = FactoryBot.create(:load_balancer)
    @load_balancer.network_ports << @network_port = FactoryBot.create("network_port_#{t}".to_sym,
                                                                      :name                  => "eth0",
                                                                      :mac_address           => "06:04:25:40:8e:79",
                                                                      :device                => @load_balancer,
                                                                      :security_groups       => [@security_group],
                                                                      :floating_ip           => @floating_ip,
                                                                      :ext_management_system => @ems)

    FactoryBot.create(:cloud_subnet_network_port,
                       :cloud_subnet => @cloud_subnet,
                       :network_port => @network_port,
                       :address      => "10.10.0.2")

  end
end
