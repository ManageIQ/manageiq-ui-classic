describe Mixins::Actions::VmActions::Reconfigure do
  describe '#get_iso_options' do
    before do
      @host = FactoryBot.create(:host, :name =>'hostname1')
      @datastore = FactoryBot.create(:storage, :name => 'storage_name')
      @vm = FactoryBot.create(:vm_vmware, :host => @host)
      FactoryBot.create(:storage_file, :storage_id => @datastore.id, :ext_name => 'iso', :base_name => "good-stuff.iso")
      FactoryBot.create(:storage_file, :storage_id => 1, :ext_name => 'iso', :base_name => "some_other_storage.iso")
    end

    context 'populate list of Host files' do
      let(:controller) { VmInfraController.new }

      it "gets list of VM's host storages that have iso files" do
        @host.storages << @datastore
        storage_list = controller.send(:get_iso_options, @vm)
        expect(storage_list.count).to be(1)
      end

      it "gets empty list for VM's storage" do
        @vm.storages << @datastore
        storage_list = controller.send(:get_iso_options, @vm)
        expect(storage_list.count).to be(0)
      end
    end
  end
end
