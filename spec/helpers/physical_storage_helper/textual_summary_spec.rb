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
      expect(subject.items.size).to eq(8)
    end

    it 'shows main properties' do
      expect(subject.items).to include(
        :name,
        :product_name,
        :serial_number,
        :health_state,
        :enclosures,
        :drive_bays,
        :uid_ems,
        :description
      )
    end
  end

  describe '.textual_group_relationships' do
    subject { textual_group_relationships }

    it 'has the right title' do
      expect(subject.title).to eq('Relationships')
    end

    it 'shows 2 relationships' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(3)
    end

    it 'shows main relationships' do
      expect(subject.items).to include(:ext_management_system, :physical_rack, :physical_chassis)
    end
  end

  describe '.textual_group_asset_details' do
    subject { textual_group_asset_details }

    it 'shows 7 asset_details info' do
      expect(subject.items).to be_kind_of(Array)
      expect(subject.items.size).to eq(7)
    end

    it 'shows main storage asset details' do
      expect(subject.items).to include(
        :machine_type,
        :model,
        :contact,
        :location,
        :room,
        :rack_name,
        :lowest_rack_unit
      )
    end
  end

  #
  # Properties
  #
  describe '.textual_name' do
    subject { textual_name }

    it 'show the storage name' do
      expect(subject).to eq(:label => 'Name', :value => 'S2200-Test')
    end
  end

  describe '.textual_product_name' do
    subject { textual_product_name }

    it 'show the storage product name' do
      expect(subject).to eq(:label => 'Product Name', :value => 'S2200')
    end
  end

  describe '.textual_serial_number' do
    subject { textual_serial_number }

    it 'show the storage Serial Number' do
      expect(subject).to eq(:label => 'Serial Number', :value => '2647DA')
    end
  end

  describe '.textual_health_state' do
    subject { textual_health_state }

    it 'show the storage Health State' do
      expect(subject).to eq(:label => 'Health State', :value => 'Warning')
    end
  end

  describe '.textual_enclosures' do
    subject { textual_enclosures }

    it 'show the storage Enclosure Count' do
      expect(subject).to eq(:label => 'Enclosure Count', :value => 1)
    end
  end

  describe '.textual_drive_bays' do
    subject { textual_drive_bays }

    it 'show the storage Drive Bays' do
      expect(subject).to eq(:label => 'Drive Bays', :value => 24)
    end
  end

  describe '.textual_uid_ems' do
    subject { textual_uid_ems }

    it 'show the storage UUID' do
      expect(subject).to eq(:label => 'UUID', :value => '208000C0FF2647DA')
    end
  end

  describe '.textual_description' do
    subject { textual_description }

    it 'show the storage description' do
      expect(subject).to eq(:label => 'Description', :value => 'S2200 used to test dh-storage-irm')
    end
  end

  #
  # Relashionships
  #
  describe '.textual_ext_management_system' do
    subject { textual_ext_management_system }

    it 'show the storage provider' do
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

    it 'show the storage physical rack' do
      expect(subject).to eq(
        :label => "Physical Racks",
        :value => "Rack XYZ",
        :icon  => "pficon pficon-enterprise",
        :image => nil
      )
    end
  end

  #
  # Asset Details
  #
  describe '.textual_machine_type' do
    subject { textual_machine_type }

    it 'show the storage Machine Type' do
      expect(subject).to eq(:label => 'Machine Type', :value => '6411')
    end
  end

  describe '.textual_model' do
    subject { textual_model }

    it 'show the storage Model' do
      expect(subject).to eq(:label => 'Model', :value => 'S2200')
    end
  end

  describe '.textual_contact' do
    subject { textual_contact }

    it 'show the storage Contact' do
      expect(subject).to eq(:label => 'Contact', :value => 'Jonas Arioli')
    end
  end

  describe '.textual_location' do
    subject { textual_location }

    it 'show the storage Location' do
      expect(subject).to eq(:label => 'Location', :value => 'teste')
    end
  end

  describe '.textual_room' do
    subject { textual_room }

    it 'show the storage Room' do
      expect(subject).to eq(:label => 'Room', :value => 'Room')
    end
  end

  describe '.textual_rack_name' do
    subject { textual_rack_name }

    it 'show the storage Rack Name' do
      expect(subject).to eq(:label => 'Rack Name', :value => 'teste')
    end
  end

  describe '.textual_lowest_rack_unit' do
    subject { textual_lowest_rack_unit }

    it 'show the storage Lowest Rack Unit' do
      expect(subject).to eq(:label => 'Lowest Rack Unit', :value => '46')
    end
  end
end
