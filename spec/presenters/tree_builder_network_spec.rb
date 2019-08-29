describe TreeBuilderNetwork do
  context 'TreeBuilderNetwork' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Network Group")
      login_as FactoryBot.create(:user, :userid => 'network_wilma', :miq_groups => [@group])
      vm = FactoryBot.create(:vm)
      hardware = FactoryBot.create(:hardware, :vm_or_template => vm)
      guest_device_with_vm = FactoryBot.create(:guest_device, :hardware => hardware)
      guest_device = FactoryBot.create(:guest_device)
      lan = FactoryBot.create(:lan, :guest_devices => [guest_device_with_vm])
      switch = FactoryBot.create(:switch, :guest_devices => [guest_device], :lans => [lan])
      network = FactoryBot.create(:host, :switches => [switch])
      @network_tree = TreeBuilderNetwork.new(:network_tree, {}, true, :root => network)
    end

    it 'returns Host as root' do
      root = @network_tree.send(:root_options)
      expect(root).to eq(
        :text       => @network_tree.instance_variable_get(:@root).name,
        :tooltip    => "Host: %{name}" % {:name => @network_tree.instance_variable_get(:@root).name},
        :icon       => 'pficon pficon-container-node',
        :selectable => false
      )
    end

    it 'returns Switch as root child' do
      kid = @network_tree.send(:x_get_tree_roots)
      expect(kid.first).to be_a_kind_of(Switch)
    end

    it 'returns GuestDevice and Lan as Switch children' do
      parent = @network_tree.send(:x_get_tree_roots).first
      kids = @network_tree.send(:x_get_tree_switch_kids, parent, false)
      expect(kids[0]).to be_a_kind_of(GuestDevice)
      expect(kids[1]).to be_a_kind_of(Lan)
    end

    it 'returns Vm as Lan child' do
      parent = @network_tree.send(:x_get_tree_roots).first.lans.first
      kid = @network_tree.send(:x_get_tree_lan_kids, parent, false)
      expect(kid.first).to be_a_kind_of(Vm)
    end

    it 'returns nothing as GuestDevice child' do
      parent = @network_tree.send(:x_get_tree_roots).first.guest_devices.first
      number_of_kids = @network_tree.send(:x_get_tree_objects, parent, true, nil)
      expect(number_of_kids).to eq(0)
    end
  end
end
