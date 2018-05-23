describe QuadiconHelper do
  describe '.settings_key' do
    subject { described_class.settings_key(klass, layout) }

    {
      :ems                => [ManageIQ::Providers::Vmware::InfraManager, 'ems_infra'],
      :ems_physical_infra => [ManageIQ::Providers::Lenovo::PhysicalInfraManager, 'ems_physical_infra'],
      :ems_cloud          => [ManageIQ::Providers::Openstack::CloudManager, 'ems_cloud'],
      :ems_network        => [ManageIQ::Providers::Amazon::NetworkManager, 'ems_network'],
      :ems_container      => [ManageIQ::Providers::Openshift::ContainerManager, 'ems_container'],
      :physical_switch    => [ManageIQ::Providers::Lenovo::PhysicalInfraManager::PhysicalSwitch, nil],
      :switch             => [Switch, nil]
    }.each do |result, input|
      context "class is #{input.first} with #{input.last} as layout" do
        let(:klass) { input.first }
        let(:layout) { input.last }

        it "returns with #{result}" do
          expect(subject).to eq(result)
        end
      end
    end
  end
end
