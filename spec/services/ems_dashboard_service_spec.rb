describe EmsDashboardService do
  let(:ems1) { FactoryBot.create(:ems_openstack) }

  context '#format_data' do
    let(:resource) { 'ems_cloud' }
    let(:attributes) do
      [
        :flavors,
        :cloud_tenants,
        :miq_templates,
        :vms,
        :availability_zones,
        :security_groups,
        :cloud_networks,
        :cloud_volumes
      ]
    end
    let(:attr_icon) do
      {
        :flavors            => "pficon pficon-flavor",
        :cloud_tenants      => "pficon pficon-cloud-tenant",
        :miq_templates      => "fa fa-database",
        :vms                => "pficon pficon-virtual-machine",
        :availability_zones => "pficon pficon-zone",
        :security_groups    => "pficon pficon-cloud-security",
        :cloud_networks     => "pficon pficon-network",
        :cloud_volumes      => "pficon pficon-volume"
      }
    end
    let(:attr_url) do
      {
        :flavors            => "flavors",
        :cloud_tenants      => "cloud_tenants",
        :miq_templates      => "images",
        :vms                => "instances",
        :availability_zones => "availability_zones",
        :security_groups    => "security_groups",
        :cloud_networks     => "cloud_networks",
        :cloud_volumes      => "cloud_volumes"
      }
    end
    let(:attr_hsh) do
      {
        :flavors            => "Flavors",
        :cloud_tenants      => "Cloud Tenants",
        :miq_templates      => "Images",
        :vms                => "Instances",
        :availability_zones => "Availability Zones",
        :security_groups    => "Security Groups",
        :cloud_networks     => "Cloud Networks",
        :cloud_volumes      => "Cloud Volumes"
      }
    end

    subject { EmsDashboardService.new(ems1.id, "ems_cloud", EmsCloud) }

    it 'returns non-nil attributes' do
      allow(subject.ems).to receive(:cloud_networks).and_return(nil)
      data = subject.format_data(resource, attributes, attr_icon, attr_url, attr_hsh)
      expect(data.length).to eq(7)
      data.each { |d| expect(d[:id]).to_not be("Cloud Networks_#{subject.ems.id}") }
    end
  end
end
