describe "layouts/listnav/_network_router.html.haml" do
  helper QuadiconHelper

  before do
    set_controller_for_view("network_router")
    assign(:panels, "ems_prop" => true, "ems_rel" => true)
    allow(view).to receive(:truncate_length).and_return(15)
    allow(view).to receive(:role_allows?).and_return(true)
  end

  %w(openstack amazon azure google).each do |t|
    before do
      allow_any_instance_of(User).to receive(:get_timezone).and_return(Time.zone)
      provider        = FactoryBot.create("ems_#{t}".to_sym)
      security_group  = FactoryBot.create("security_group_#{t}".to_sym,
                                           :ext_management_system => provider.network_manager,
                                           :name                  => 'A test')
      vm              = FactoryBot.create("vm_#{t}".to_sym)
      network         = FactoryBot.create("cloud_network_#{t}".to_sym)
      subnet          = FactoryBot.create("cloud_subnet_#{t}".to_sym,
                                           :cloud_network         => network,
                                           :ext_management_system => provider.network_manager)
      @network_router = FactoryBot.create("network_router_#{t}".to_sym,
                                           :cloud_subnets         => [subnet],
                                           :ext_management_system => provider.network_manager)
      floating_ip     = FactoryBot.create("floating_ip_#{t}".to_sym,
                                           :ext_management_system => provider.network_manager)
      vm.network_ports << network_port = FactoryBot.create("network_port_#{t}".to_sym,
                                                            :device          => vm,
                                                            :security_groups => [security_group],
                                                            :floating_ip     => floating_ip)

      FactoryBot.create(:cloud_subnet_network_port, :cloud_subnet => subnet, :network_port => network_port)
    end

    context "for #{t}" do
      it "relationships links uses restful path in #{t.camelize}" do
        @record = @network_router
        render
        expect(response).to include("href=\"/network_router/show/#{@record.id}?display=main\">Summary")
        expect(response).to include("Show this Network Router&#39;s parent Network Provider\" href=\"/ems_network/#{@record.ext_management_system.id}\">")
        expect(response).to include("Show all Instances\" href=\"/network_router/show/#{@record.id}?display=instances\">")
      end
    end
  end
end
