describe PhysicalChassisHelper::TextualSummary do
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
                      :product_name       => 'Lenovo XYZ Chassis x1000',
                      :manufacturer       => 'Lenovo',
                      :serial_number      => 'A1B2C3D4E5F6',
                      :part_number        => 'XXX18',
                      :description        => 'Physical Chassis used inside site A',
                      :location_led_state => 'Off')
  end

  let(:network) do
    FactoryBot.build(:network, :ipaddress => '192.168.1.1')
  end

  let(:guest_device) do
    FactoryBot.build(:guest_device,
                     :device_type => 'management',
                     :network     => network)
  end

  let(:hardware) do
    FactoryBot.build(:hardware, :guest_devices => [guest_device])
  end

  let(:computer_system) do
    FactoryBot.build(:computer_system, :hardware => hardware)
  end

  let(:physical_rack) do
    FactoryBot.create(:physical_rack, :name => 'Rack XYZ')
  end

  let(:physical_servers) do
    [
      FactoryBot.create(:physical_server, :name => 'Physical Server I'),
      FactoryBot.create(:physical_server, :name => 'Physical Server J'),
      FactoryBot.create(:physical_server, :name => 'Physical Server K')
    ]
  end

  let(:physical_storages) do
    [
      FactoryBot.create(:physical_storage, :name => 'Physical Storage A')
    ]
  end

  let(:physical_chassis) do
    FactoryBot.create(:physical_chassis,
                      :ems_id                       => ems.id,
                      :uid_ems                      => 'NVH20GH0T4HN268902G6Y2N-G28Y8YWG',
                      :name                         => 'Chassis ABC',
                      :health_state                 => 'Valid',
                      :asset_detail                 => asset_detail,
                      :computer_system              => computer_system,
                      :management_module_slot_count => 2,
                      :switch_slot_count            => 4,
                      :fan_slot_count               => 8,
                      :blade_slot_count             => 16,
                      :powersupply_slot_count       => 1,
                      :physical_rack                => physical_rack,
                      :physical_servers             => physical_servers,
                      :physical_storages            => physical_storages)
  end

  before do
    @record = physical_chassis
  end

  #
  # Textual Groups
  # Properties, Relationships, Management Network, Slots
  #
  describe '.textual_group_properties' do
    subject { textual_group_properties }

    it 'has the right title' do
      expect(subject.title).to eq('Properties')
    end

    it 'shows 8 fields' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(9)
    end

    it 'shows main properties' do
      expect(subject.items).to include(
        :name,
        :product_name,
        :manufacturer,
        :serial_number,
        :part_number,
        :health_state,
        :uid_ems,
        :description,
        :location_led_state
      )
    end
  end

  describe '.textual_group_relationships' do
    subject { textual_group_relationships }

    it 'has the right title' do
      expect(subject.title).to eq('Relationships')
    end

    it 'shows 4 relationships' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(4)
    end

    it 'shows main relationships' do
      expect(subject.items).to include(:ext_management_system, :physical_rack, :physical_servers, :physical_storages)
    end
  end

  describe '.textual_group_management_network' do
    subject { textual_group_management_network }

    it 'has the right title' do
      expect(subject.title).to eq('Management Network')
    end

    it 'shows 1 management ipaddress' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(1)
      expect(subject.items[0]).to eq(:ipaddress)
    end
  end

  describe '.textual_group_slots' do
    subject { textual_group_slots }

    it 'has the right title' do
      expect(subject.title).to eq('Chassis Slots')
    end

    it 'shows 5 slots info' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(5)
    end

    it 'shows main chassis slots' do
      expect(subject.items).to include(
        :mm_slot_count,
        :switch_slot_count,
        :fan_slot_count,
        :blade_slot_count,
        :powersupply_slot_count
      )
    end
  end

  #
  # Properties
  #
  describe '.textual_name' do
    subject { textual_name }

    it 'show the chassis name' do
      expect(subject).to eq(:label => 'Chassis name', :value => 'Chassis ABC')
    end
  end

  describe '.textual_product_name' do
    subject { textual_product_name }

    it 'show the chassis product name' do
      expect(subject).to eq(:label => 'Product Name', :value => 'Lenovo XYZ Chassis x1000')
    end
  end

  describe '.textual_manufacturer' do
    subject { textual_manufacturer }

    it 'show the chassis Manufacturer' do
      expect(subject).to eq(:label => 'Manufacturer', :value => 'Lenovo')
    end
  end

  describe '.textual_serial_number' do
    subject { textual_serial_number }

    it 'show the chassis Serial Number' do
      expect(subject).to eq(:label => 'Serial Number', :value => 'A1B2C3D4E5F6')
    end
  end

  describe '.textual_part_number' do
    subject { textual_part_number }

    it 'show the chassis Part Number' do
      expect(subject).to eq(:label => 'Part Number', :value => 'XXX18')
    end
  end

  describe '.textual_health_state' do
    subject { textual_health_state }

    it 'show the chassis Health State' do
      expect(subject).to eq(:label => 'Health State', :value => 'Valid')
    end
  end

  describe '.textual_uid_ems' do
    subject { textual_uid_ems }

    it 'show the chassis UUID' do
      expect(subject).to eq(:label => 'UUID', :value => 'NVH20GH0T4HN268902G6Y2N-G28Y8YWG')
    end
  end

  describe '.textual_description' do
    subject { textual_description }

    it 'show the chassis description' do
      expect(subject).to eq(:label => 'Description', :value => 'Physical Chassis used inside site A')
    end
  end

  describe '.textual_location_led_state' do
    subject { textual_location_led_state }

    it 'show the chassis location LED state' do
      expect(subject).to eq(:label => 'Identify LED State', :value => 'Off')
    end
  end

  #
  # Relashionships
  #
  describe '.textual_ext_management_system' do
    subject { textual_ext_management_system }

    it 'show the chassis provider' do
      expect(subject).to eq(
        :label => 'Physical Infrastructure Provider',
        :icon  => nil,
        :value => 'LXCA',
        :image => 'svg/vendor-lenovo_ph_infra.svg'
      )
    end
  end

  describe '.textual_physical_rack' do
    subject { textual_physical_rack }

    it 'show the chassis physical rack' do
      expect(subject).to eq(
        :label => "Physical Rack",
        :value => "Rack XYZ",
        :icon  => "pficon pficon-enterprise",
        :image => nil
      )
    end
  end

  describe '.textual_physical_servers' do
    subject { textual_physical_servers }

    it 'show the chassis physical servers' do
      expect(subject).to eq(
        :label => "Physical Servers",
        :value => "3",
        :icon  => "pficon pficon-server",
        :image => nil
      )
    end
  end

  describe '.textual_physical_storages' do
    subject { textual_physical_storages }

    it 'show the chassis physical storages' do
      expect(subject).to eq(
        :label => "Physical Storages",
        :value => "1",
        :icon  => "pficon pficon-container-node",
        :image => nil
      )
    end
  end

  #
  # Management Network
  #
  describe '.textual_ipaddress' do
    subject { textual_ipaddress }

    it 'show the chassis management ipaddress' do
      expect(subject).to eq(:label => 'IP', :value => '192.168.1.1')
    end
  end

  #
  # Chassis Slots
  #
  describe '.textual_mm_slot_count' do
    subject { textual_mm_slot_count }

    it 'show the chassis management module slot count' do
      expect(subject).to eq(:label => 'Management Module Slot Count', :value => 2)
    end
  end

  describe '.textual_switch_slot_count' do
    subject { textual_switch_slot_count }

    it 'show the chassis switch slot count' do
      expect(subject).to eq(:label => 'Switch Slot Count', :value => 4)
    end
  end

  describe '.textual_fan_slot_count' do
    subject { textual_fan_slot_count }

    it 'show the chassis fan slot count' do
      expect(subject).to eq(:label => 'Fan Slot Count', :value => 8)
    end
  end

  describe '.textual_blade_slot_count' do
    subject { textual_blade_slot_count }

    it 'show the chassis blade slot count' do
      expect(subject).to eq(:label => 'Blade Slot Count', :value => 16)
    end
  end

  describe '.textual_powersupply_slot_count' do
    subject { textual_powersupply_slot_count }

    it 'show the chassis management ipaddress' do
      expect(subject).to eq(:label => 'Power Supply Slot Count', :value => 1)
    end
  end
end
