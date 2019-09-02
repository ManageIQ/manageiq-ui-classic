describe TreeBuilderRolesByServer do
  context 'TreeBuilderRolesByServer' do
    before do
      MiqRegion.seed
      @miq_server = EvmSpecHelper.local_miq_server
      @server_role = FactoryBot.create(
        :server_role,
        :name              => "smartproxy",
        :description       => "SmartProxy",
        :max_concurrent    => 1,
        :external_failover => false,
        :role_scope        => "zone"
      )

      @assigned_server_role1 = FactoryBot.create(
        :assigned_server_role,
        :miq_server_id  => @miq_server.id,
        :server_role_id => @server_role.id,
        :active         => true,
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
      parent = MiqRegion.my_region
      @sb[:selected_server_id] = parent.id
      @sb[:selected_typ] = "miq_region"
      @server_tree = TreeBuilderRolesByServer.new(:roles_by_server_tree, @sb, true, :root => parent)
    end

    it "is not lazy" do
      tree_options = @server_tree.send(:tree_init_options)
      expect(tree_options[:lazy]).not_to be_truthy
    end

    it 'returns server nodes as root kids' do
      server_nodes = @server_tree.send(:x_get_tree_roots)
      expect(server_nodes).to eq([@miq_server])
    end

    it 'returns Roles by Servers' do
      nodes = [{'key'        => "svr-#{@miq_server.id}",
                'tooltip'    => "Server: #{@miq_server.name} [#{@miq_server.id}] (current) (started)",
                'icon'       => "pficon pficon-server",
                'text'       => "<strong>Server: #{@miq_server.name} [#{@miq_server.id}] (current) (started)</strong>",
                'selectable' => true,
                'nodes'      => [{'key'            => "asr-#{@assigned_server_role1.id}",
                                  'icon'           => 'pficon pficon-on',
                                  'iconBackground' => '#3F9C35',
                                  'text'           => "<strong>Role: SmartProxy</strong> (primary, active, PID=)",
                                  'state'          => {'expanded' => true},
                                  'selectable'     => true},
                                 {'key'            => "asr-#{@assigned_server_role2.id}",
                                  'icon'           => 'pficon pficon-on',
                                  'iconBackground' => '#3F9C35',
                                  'text'           => "<strong>Role: SmartProxy</strong> (secondary, active, PID=)",
                                  'state'          => {'expanded' => true},
                                  'selectable'     => true}],
                'state'      => {'expanded' => true, 'selected' => true}}]
      expect(JSON.parse(@server_tree.locals_for_render[:bs_tree])).to eq(nodes)
    end
  end
end
