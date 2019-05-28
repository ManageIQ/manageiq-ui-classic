describe TreeBuilderServersByRole do
  context 'TreeBuilderServersByRole' do
    before do
      zone = FactoryBot.create(:zone)
      @miq_server = FactoryBot.create(:miq_server, :zone => zone)
      allow(MiqServer).to receive(:my_zone).and_return(zone)
      @server_role = ServerRole.find_by(:name => "smartproxy")

      @assigned_server_role1 = FactoryBot.create(
        :assigned_server_role,
        :miq_server_id  => @miq_server.id,
        :server_role_id => @server_role.id,
        :active         => false,
        :priority       => 1
      )

      @assigned_server_role2 = FactoryBot.create(
        :assigned_server_role,
        :miq_server_id  => @miq_server.id,
        :server_role_id => @server_role.id,
        :active         => true,
        :priority       => 2
      )
      @sb = {:active_tree => :diagnostics_tree}
      parent = zone
      @sb[:selected_server_id] = parent.id
      @sb[:selected_typ] = "miq_region"
      @server_tree = TreeBuilderServersByRole.new(:servers_by_role_tree, @sb, true, :root => parent)
    end

    it "is not lazy" do
      tree_options = @server_tree.send(:tree_init_options)
      expect(tree_options[:lazy]).not_to be_truthy
    end

    it 'returns server nodes as root kids' do
      server_nodes = @server_tree.send(:x_get_tree_roots, false, {})
      expect(server_nodes).to eq([@server_role])
    end

    it 'returns Servers by Roles' do
      nodes = [{'key'        => "role-#{@server_role.id}",
                'text'       => "Role: SmartProxy (active)",
                'tooltip'    => "Role: SmartProxy (active)",
                "icon"       => "ff ff-user-role",
                'selectable' => true,
                'nodes'      => [
                  {
                    'key'            => "asr-#{@assigned_server_role1.id}",
                    'text'           => "<strong>Server: smartproxy [#{@assigned_server_role1.id}]</strong> (available, PID=)",
                    'icon'           => 'pficon pficon-asleep',
                    'iconBackground' => '#FF9900',
                    'selectable'     => true,
                    'state'          => { 'expanded' => true },
                    'class'          => 'red',
                  },
                  {
                    'key'            => "asr-#{@assigned_server_role2.id}",
                    'text'           => "<strong>Server: smartproxy [#{@assigned_server_role2.id}]</strong> (active, PID=)",
                    'icon'           => 'pficon pficon-on',
                    'iconBackground' => '#3F9C35',
                    'selectable'     => true,
                    'state'          => { 'expanded' => true },
                    'class'          => ''
                  }
                ],
                'state'      => { 'expanded' => true},
                'class'      => '' }]
      expect(JSON.parse(@server_tree.locals_for_render[:bs_tree])).to eq(nodes)
    end
  end
end
