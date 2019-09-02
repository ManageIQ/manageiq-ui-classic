describe TreeBuilderPolicySimulation do
  context 'TreeBuilderPolicySimulation' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Policy Simulation Group")
      login_as FactoryBot.create(:user, :userid => 'policy_simulation_wilma', :miq_groups => [@group])
      @policy_options = {:out_of_scope => true, :passed => true, :failed => true}
      exp = {"FIND"   => {"checkcount" => {">=" => {"value" => "1", "field" => "<count>"}},
                          "search"     => {"INCLUDES" => {"value" => "nb", "field" => "Vm.filesystems-name"}}},
             "result" => false}
      @data = [{'id'          => 1,
                'result'      => 'allow',
                'description' => 'Description',
                'policies'    => [{'id'          => 2,
                                   'result'      => 'N/A',
                                   'description' => 'Not Available',
                                   'active'      => true,
                                   'conditions'  => [{'id'          => 3,
                                                      'result'      => 'deny',
                                                      'description' => 'Description',
                                                      'active'      => true,
                                                      'scope'       => exp}]},
                                  {'id'          => 5,
                                   'result'      => 'deny',
                                   'description' => 'Seems Denied',
                                   'active'      => true,
                                   'conditions'  => [{'id'          => 6,
                                                      'result'      => 'N/A',
                                                      'description' => 'Description',
                                                      'active'      => true,
                                                      'expression'  => exp}]}]}]

      @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                                {},
                                                                true,
                                                                :root      => @data,
                                                                :root_name => 'Policy Simulation',
                                                                :options   => @policy_options)
    end

    it 'sets tree as not lazy' do
      tree_options = @policy_simulation_tree.send(:tree_init_options)
      expect(tree_options[:lazy]).not_to be_truthy
    end

    it 'sets root correctly' do
      root = @policy_simulation_tree.send(:root_options)
      expect(root).to eq(
        :text       => "<strong>Policy Simulation</strong>",
        :tooltip    => 'Policy Simulation',
        :icon       => 'pficon pficon-virtual-machine',
        :selectable => false
      )
    end

    it 'sets icon correctly' do
      deny = @policy_simulation_tree.send(:node_icon, 'deny')
      allow = @policy_simulation_tree.send(:node_icon, 'allow')
      na = @policy_simulation_tree.send(:node_icon, 'N/A')
      expect(deny).to eq('pficon-error-circle-o')
      expect(allow).to eq('pficon pficon-ok')
      expect(na).to eq('fa fa-ban')
    end

    it 'sets Policy Profile node correctly' do
      node = @policy_simulation_tree.send(:x_get_tree_roots).first
      expect(node[:text]).to eq("<strong>Policy Profile:</strong> #{@data.first['description']}")
      expect(node[:icon]).to eq("pficon pficon-ok")
      expect(node[:tip]).to eq(@data.first['description'])
      expect(node[:policies].count).to eq(2)
    end

    it 'sets Policy nodes correctly' do
      node = @policy_simulation_tree.send(:x_get_tree_roots).first
      kids = @policy_simulation_tree.send(:x_get_tree_hash_kids, node, false)
      expect(kids.first[:text]).to eq("<strong>Policy:</strong> #{@data.first['policies'].first['description']}")
      expect(kids.first[:icon]).to eq('fa fa-ban')
      expect(kids.first[:tip]).to eq(@data.first['policies'].first['description'])
      expect(kids.first[:conditions].count).to eq(1)
      expect(kids.last[:text]).to eq("<strong>Policy:</strong> #{@data.first['policies'].last['description']}")
      expect(kids.last[:icon]).to eq('pficon-error-circle-o')
      expect(kids.last[:tip]).to eq(@data.first['policies'].last['description'])
      expect(kids.last[:conditions].count).to eq(1)
    end

    it 'sets Condition nodes correctly' do
      root = @policy_simulation_tree.send(:x_get_tree_roots).first
      parent_one = @policy_simulation_tree.send(:x_get_tree_hash_kids, root, false).first
      kid_one = @policy_simulation_tree.send(:x_get_tree_hash_kids, parent_one, false).first
      parent_two = @policy_simulation_tree.send(:x_get_tree_hash_kids, root, false).last
      kid_two = @policy_simulation_tree.send(:x_get_tree_hash_kids, parent_two, false).first
      expect(kid_one[:text]).to eq("<strong>Condition:</strong> #{@data.first['policies'].first['conditions'].first['description']}")
      expect(kid_one[:icon]).to eq('pficon-error-circle-o')
      expect(kid_one[:tip]).to eq(@data.first['policies'].first['conditions'].first['description'])
      expect(kid_two[:text]).to eq("<strong>Condition:</strong> #{@data.first['policies'].last['conditions'].first['description']}")
      expect(kid_two[:icon]).to eq('fa fa-ban')
      expect(kid_two[:tip]).to eq(@data.first['policies'].last['conditions'].first['description'])
    end

    it 'sets Condition nodes correctly' do
      root = @policy_simulation_tree.send(:x_get_tree_roots).first
      grand_parent_one = @policy_simulation_tree.send(:x_get_tree_hash_kids, root, false).first
      parent_one = @policy_simulation_tree.send(:x_get_tree_hash_kids, grand_parent_one, false).first
      grand_parent_two = @policy_simulation_tree.send(:x_get_tree_hash_kids, root, false).last
      parent_two = @policy_simulation_tree.send(:x_get_tree_hash_kids, grand_parent_two, false).first
      kid_one = @policy_simulation_tree.send(:x_get_tree_hash_kids, parent_one, false).first
      kid_two = @policy_simulation_tree.send(:x_get_tree_hash_kids, parent_two, false).first
      expect(kid_one[:text]).to eq("<strong>Scope:</strong> <font color=\"red\">FIND VM and Instance.Files : Name INCLUDES &quot;nb&quot; CHECK COUNT &gt;= 1</font>")
      expect(kid_one[:icon]).to eq('fa fa-ban')
      expect(kid_one[:tip]).to eq("FIND VM and Instance.Files : Name INCLUDES \"nb\" CHECK COUNT &gt;= 1")
      expect(kid_two[:text]).to eq("<strong>Expression:</strong> <font color=\"red\">FIND VM and Instance.Files : Name INCLUDES &quot;nb&quot; CHECK COUNT &gt;= 1</font>")
      expect(kid_two[:icon]).to eq('fa fa-ban')
      expect(kid_two[:tip]).to eq("FIND VM and Instance.Files : Name INCLUDES \"nb\" CHECK COUNT &gt;= 1")
    end
  end
  context 'TreeBuilderPolicySimulation without data' do
    before do
      role = MiqUserRole.find_by(:name => "EvmRole-operator")
      @group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "No node Group")
      login_as FactoryBot.create(:user, :userid => 'no_node_wilma', :miq_groups => [@group])
      @policy_options = {:out_of_scope => true, :passed => true, :failed => true}
      @policy_simulation_tree = TreeBuilderPolicySimulation.new(:policy_simulation_tree,
                                                                {},
                                                                true,
                                                                :root      => {},
                                                                :root_name => 'Policy Simulation',
                                                                :options   => @policy_options)
    end
    it 'sets Policy Profile node correctly if no data found' do
      node = @policy_simulation_tree.send(:x_get_tree_roots).first
      expect(node[:text]).to eq("Items out of scope")
      expect(node[:icon]).to eq("fa fa-ban")
      expect(node[:selectable]).to eq(false)
    end
  end
end
