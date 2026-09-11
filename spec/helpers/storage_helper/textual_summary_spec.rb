describe StorageHelper do
  include NumberHelper

  describe '.textual_format_used_space' do
    it 'returns 0 for 0 amount' do
      expect(textual_format_used_space(100, 10, 0)).to eq(0)
    end

    it 'returns formated plural message for number>1' do
      expect(textual_format_used_space(100, 10, 1000)).to eq('100 Bytes (10% of Used Space, 1000 files)')
    end

    it 'returns formated singular message for number=1' do
      expect(textual_format_used_space(100, 10, 1)).to eq('100 Bytes (10% of Used Space, 1 file)')
    end

    it 'rounds number of bytes to 2 decimal points' do
      expect(textual_format_used_space(3331, 10, 1)).to eq('3.25 KB (10% of Used Space, 1 file)')
    end
  end

  describe '#textual methods' do
    context 'for zero VMs' do
      before do
        @record = FactoryBot.create(:storage)
      end

      it 'returns correct Hash' do
        expect(textual_registered_vms).to eq(:label => "Managed/Registered VMs",
                                             :icon  => "pficon pficon-virtual-machine",
                                             :value => 0)
      end
      it 'returns correct Hash' do
        expect(textual_unregistered_vms).to eq(:label => "Managed/Unregistered VMs",
                                               :icon  => "pficon pficon-virtual-machine",
                                               :value => 0)
      end
      it 'returns correct Hash' do
        expect(textual_unmanaged_vms).to eq(:label => "Unmanaged VMs",
                                            :title => "Unmanaged VMs are no longer available",
                                            :icon  => "pficon pficon-virtual-machine",
                                            :value => 0)
      end
    end

    context 'for any number of VMs' do
      before do
        @record = FactoryBot.create(:storage)
        allow(self).to receive(:role_allows?).and_return(true)
        allow(self).to receive(:url_for_only_path).and_return('link')
      end

      it 'returns correct Hash' do
        allow(@record).to receive(:total_managed_registered_vms).and_return(1)
        expect(textual_registered_vms).to eq(:label => "Managed/Registered VMs",
                                             :icon  => "pficon pficon-virtual-machine",
                                             :value => 1,
                                             :link  => "link",
                                             :title => "Show all Managed/Registered VMs")
      end
      it 'returns correct Hash' do
        allow(@record).to receive(:total_unregistered_vms).and_return(1)
        expect(textual_unregistered_vms).to eq(:label => "Managed/Unregistered VMs",
                                               :icon  => "pficon pficon-virtual-machine",
                                               :value => 1,
                                               :link  => "link",
                                               :title => "Show all Managed/Unregistered VMs")
      end
      it 'returns correct Hash' do
        allow(@record).to receive(:total_unmanaged_vms).and_return(1)
        expect(textual_unmanaged_vms).to eq(:label => "Unmanaged VMs",
                                            :title => "Unmanaged VMs are no longer available",
                                            :icon  => "pficon pficon-virtual-machine",
                                            :value => 1)
      end
    end
  end

  before do
    instance_variable_set(:@record, "total_space" => 150)
  end

  include_examples "textual_group", "Properties", %i(store_type free_space used_space total_space)

  include_examples "textual_group", "Information for Registered VMs", %i(uncommitted_space used_uncommitted_space),
                   "registered_vms"

  include_examples "textual_group", "Relationships", %i(
    hosts
    managed_vms
    managed_miq_templates
    registered_vms
    unregistered_vms
    unmanaged_vms
    custom_button_events
  )

  include_examples "textual_group_smart_management"

  include_examples "textual_group", "Content", %i(files disk_files snapshot_files vm_ram_files vm_misc_files debris_files)

  describe 'when free_space is not supported' do
    before do
      @record = FactoryBot.create(:storage, :total_space => 1.gigabyte)
      stub_supports_not(@record, :free_space, "Free space is not available for this storage type")
      stub_supports_not(@record, :uncommitted, "Uncommitted is not available for this storage type")
    end

    describe '#textual_free_space' do
      it 'returns N/A with the unsupported reason as tooltip' do
        result = textual_free_space
        expect(result[:label]).to eq("Free Space")
        expect(result[:value]).to eq("N/A")
        expect(result[:title]).to eq("Free space is not available for this storage type")
      end
    end

    describe '#textual_used_space' do
      it 'returns nil to suppress the used space row' do
        expect(textual_used_space).to be_nil
      end
    end

    describe '#textual_total_space' do
      it 'uses the "Total Claimed Capacity" label' do
        result = textual_total_space
        expect(result[:label]).to eq("Total Claimed Capacity")
      end

      it 'still shows the total_space value' do
        result = textual_total_space
        expect(result[:value]).to match(/GiB|GB|Bytes/)
      end
    end

    describe '#textual_uncommitted_space' do
      it 'returns N/A with the unsupported reason as tooltip' do
        result = textual_uncommitted_space
        expect(result[:label]).to eq("Uncommitted Space")
        expect(result[:value]).to eq("N/A")
        expect(result[:title]).to eq("Uncommitted is not available for this storage type")
      end
    end

    describe '#textual_group_registered_vms' do
      it 'omits used_uncommitted_space from the group' do
        group = textual_group_registered_vms
        expect(group.items).not_to include(:used_uncommitted_space)
      end
    end
  end

  describe 'when free_space is supported' do
    before do
      @record = FactoryBot.create(:storage, :total_space => 1.gigabyte, :free_space => 512.megabytes)
      stub_supports(@record, :free_space)
      stub_supports(@record, :uncommitted)
    end

    describe '#textual_free_space' do
      it 'shows the free space value and percentage' do
        result = textual_free_space
        expect(result[:label]).to eq("Free Space")
        expect(result[:value]).to match(/\d/)
      end
    end

    describe '#textual_used_space' do
      it 'returns the used space row' do
        result = textual_used_space
        expect(result[:label]).to eq("Used Space")
      end
    end

    describe '#textual_total_space' do
      it 'uses the standard "Total Space" label' do
        result = textual_total_space
        expect(result[:label]).to eq("Total Space")
      end
    end

    describe '#textual_uncommitted_space' do
      it 'returns the uncommitted space row' do
        result = textual_uncommitted_space
        expect(result[:label]).to eq("Uncommitted Space")
      end
    end

    describe '#textual_group_registered_vms' do
      it 'includes used_uncommitted_space in the group' do
        group = textual_group_registered_vms
        expect(group.items).to include(:used_uncommitted_space)
      end
    end
  end
end
