describe TreeBuilderPolicySimulationResults do
  context 'TreeBuilderPolicySimulationResults' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Policy Simulation Group")
      login_as FactoryBot.create(:user, :userid => 'policy_simulation_results_wilma', :miq_groups => [@group])
      @policy_options = {:out_of_scope => true, :passed => true, :failed => true}
      @event = FactoryBot.create(:miq_event_definition, :id => 123)
      @data = {:event_value => 123, :results => [{:id => 76, :name => "DevRHEL002", :result => "allow", :profiles => []},
                                                 {:id       => 69,
                                                  :name     => "DevLin002",
                                                  :result   => "deny",
                                                  :profiles => [{:id          => 58,
                                                                 :name        => 'Name',
                                                                 :description => "Compliance: DMZ Configuration",
                                                                 :result      => "deny",
                                                                 :policies    => [{:id          => 15,
                                                                                   :name        => 'name',
                                                                                   :description => "Configuration: VM - Internal Network",
                                                                                   :result      => "deny",
                                                                                   :conditions  => [{:id          => 12,
                                                                                                     :description => "vm - internal vlan check",
                                                                                                     :result      => "deny"}],
                                                                                   :actions     => [{:id          => 37,
                                                                                                     :description => "Email - DMZ",
                                                                                                     :result      => "deny"},
                                                                                                    {:id          => 9,
                                                                                                     :description => "Shutdown Virtual Machine Guest OS",
                                                                                                     :result      => "deny"}]}]}]}]}
      @rsop_tree = TreeBuilderPolicySimulationResults.new(:rsop_tree, {}, true, :root => @data)
    end

    it 'sets root correctly' do
      root_options = @rsop_tree.send(:root_options)
      expect(root_options).to eq(
        :text       => "Policy Simulation Results for Event [%{description}]" % {:description => @event.description},
        :icon       => @event.decorate.fonticon,
        :selectable => false
      )
    end

    it 'sets vm nodes correctly' do
      vms = @rsop_tree.send(:x_get_tree_roots)
      original_vms = @data[:results].sort_by { |a| a[:name].downcase }
      vms.each_with_index do |vm, i|
        expect(vm[:text]).to eq("<strong>VM:</strong> #{original_vms[i][:name]}")
        expect(vm[:icon]).to eq('pficon pficon-virtual-machine')
        expect(vm[:profiles]).to eq(original_vms[i][:profiles])
      end
    end

    it 'sets profile nodes correctly' do
      vms = @rsop_tree.send(:x_get_tree_roots)
      original_vms = @data[:results].sort_by { |a| a[:name].downcase }
      profiles_one = @rsop_tree.send(:x_get_tree_hash_kids, vms.first, false)
      profiles_two = @rsop_tree.send(:x_get_tree_hash_kids, vms.last, false)
      expect(profiles_one.first[:text]).to eq("<strong>Profile:</strong> #{original_vms.first[:profiles].first[:description]}")
      expect(profiles_one.first[:icon]).to eq(@rsop_tree.send(:node_icon, original_vms.first[:profiles].first[:result]))
      expect(profiles_two).to eq([])
    end

    it 'sets policy nodes correctly' do
      vms = @rsop_tree.send(:x_get_tree_roots)
      original_vms = @data[:results].sort_by { |a| a[:name].downcase }
      profiles = @rsop_tree.send(:x_get_tree_hash_kids, vms.first, false)
      policies = @rsop_tree.send(:x_get_tree_hash_kids, profiles.first, false)
      expect(policies.first[:text]).to eq("<strong>Policy (Inactive):</strong> #{original_vms.first[:profiles].first[:policies].first[:description]}")
      expect(policies.first[:icon]).to eq('pficon pficon-error-circle-o')
    end

    it 'sets condition and action nodes correctly' do
      vms = @rsop_tree.send(:x_get_tree_roots)
      original_vms = @data[:results].sort_by { |a| a[:name].downcase }
      profiles = @rsop_tree.send(:x_get_tree_hash_kids, vms.first, false)
      policies = @rsop_tree.send(:x_get_tree_hash_kids, profiles.first, false)
      conditions_and_actions = @rsop_tree.send(:x_get_tree_hash_kids, policies.first, false)
      expect(conditions_and_actions.first[:text]).to eq("<strong>Condition:</strong> #{original_vms.first[:profiles].first[:policies].first[:conditions].first[:description]}")
      expect(conditions_and_actions.first[:icon]).to eq('pficon pficon-error-circle-o')
      expect(conditions_and_actions[1][:text]).to eq("<strong>Action:</strong> #{original_vms.first[:profiles].first[:policies].first[:actions][0][:description]}")
      expect(conditions_and_actions[1][:icon]).to eq('pficon pficon-error-circle-o')
    end
  end
end
