describe PhysicalStorageHelper::TextualSummary do
  include ApplicationHelper

  let(:ems) do
    FactoryBot.create(:physical_infra,
                       :name      => 'LXCA',
                       :hostname  => 'my.physicalinfra.com',
                       :port      => '443',
                       :ipaddress => '1.2.3.4')
  end

  let(:asset_detail) do
    FactoryBot.create(:asset_detail,
                       :machine_type     => '6411',
                       :model            => 'S2200',
                       :contact          => 'Jonas Arioli',
                       :location         => 'teste',
                       :room             => 'Room',
                       :rack_name        => 'teste',
                       :lowest_rack_unit => '46',
                       :product_name     => 'S2200',
                       :manufacturer     => 'IBM',
                       :serial_number    => '2647DA',
                       :description      => 'S2200 used to test dh-storage-irm')
  end

  let(:physical_rack) do
    FactoryBot.create(:physical_rack, :name => 'Rack XYZ')
  end

  let(:physical_storage) do
    FactoryBot.create(:physical_storage,
                       :ems_id               => ems.id,
                       :uid_ems              => '208000C0FF2647DA',
                       :name                 => 'S2200-Test',
                       :health_state         => 'Warning',
                       :access_state         => 'Online',
                       :overall_health_state => 'Warning',
                       :drive_bays           => 24,
                       :enclosures           => 1,
                       :canister_slots       => 2,
                       :asset_detail         => asset_detail,
                       :physical_rack        => physical_rack)
  end

  before do
    @record = physical_storage
  end

  describe '.textual_group_list' do
    subject { textual_group_list }

    it "Matches the expected hash" do
      expect(
        subject.map { |bg| bg.map(&:to_h) }
      ).to(eq(
             [[{:title => "Properties",
                :items =>
                          [{:label => "Name", :value => "S2200-Test"},
                           {:value => "S2200", :label => "Product Name"},
                           {:value => "2647DA", :label => "Serial Number"},
                           {:value => "Warning", :label => "Health State"},
                           {:value => 1, :label => "Enclosure Count"},
                           {:value => 24, :label => "Drive Bays"},
                           {:value => "208000C0FF2647DA", :label => "UUID"},
                           {:value => "S2200 used to test dh-storage-irm", :label => "Description"}]},
               {:title => "Relationships",
                :items =>
                          [{:label => "Physical Infrastructure Provider",
                            :value => "LXCA",
                            :icon  => nil,
                            :image => "svg/vendor-lenovo_ph_infra.svg"},
                           {:label => "Physical Rack",
                            :value => "Rack XYZ",
                            :icon  => "pficon pficon-enterprise",
                            :image => nil}]},
               {:title => "Asset Details",
                :items =>
                          [{:value => "6411", :label => "Machine Type"},
                           {:value => "S2200", :label => "Model"},
                           {:value => "Jonas Arioli", :label => "Contact"},
                           {:value => "teste", :label => "Location"},
                           {:value => "Room", :label => "Room"},
                           {:value => "teste", :label => "Rack Name"},
                           {:value => "46", :label => "Lowest Rack Unit"}]}]]
           ))
    end
  end
end
