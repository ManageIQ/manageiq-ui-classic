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
        @record = FactoryGirl.create(:storage)
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
        @record = FactoryGirl.create(:storage)
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
end
