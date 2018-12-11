describe "layouts/listnav/_security_group.html.haml" do
  helper QuadiconHelper

  before do
    set_controller_for_view("security_group")
    assign(:panels, "ems_prop" => true, "ems_rel" => true)
    allow(view).to receive(:truncate_length).and_return(15)
    allow(view).to receive(:role_allows?).and_return(true)
  end

  %w(openstack amazon azure google).each do |t|
    before do
      allow_any_instance_of(User).to receive(:get_timezone).and_return(Time.zone)
      provider        = FactoryBot.create("ems_#{t}".to_sym)
      @security_group = FactoryBot.create("security_group_#{t}".to_sym,
                                           :ext_management_system => provider.network_manager,
                                           :name                  => 'A test')
      vm              = FactoryBot.create("vm_#{t}".to_sym)
      network         = FactoryBot.create("cloud_network_#{t}".to_sym)
      subnet          = FactoryBot.create("cloud_subnet_#{t}".to_sym, :cloud_network => network)
      vm.network_ports << network_port = FactoryBot.create("network_port_#{t}".to_sym,
                                                            :device          => vm,
                                                            :security_groups => [@security_group])
      FactoryBot.create(:cloud_subnet_network_port, :cloud_subnet => subnet, :network_port => network_port)
    end

    context "for #{t}" do
      it "relationships links uses restful path in #{t.camelize}" do
        @record = @security_group
        render
        expect(response).to include("href=\"/security_group/show/#{@record.id}?display=main\">Summary")
        expect(response).to include("Show this Security Group&#39;s parent Network Provider\" href=\"/ems_network/#{@record.ext_management_system.id}\">")
        expect(response).to include("Show all Instances\" href=\"/security_group/show/#{@record.id}?display=instances\">")
      end
    end
  end
end
