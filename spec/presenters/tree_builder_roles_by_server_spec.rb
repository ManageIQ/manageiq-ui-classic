describe TreeBuilderRolesByServer do
  context 'TreeBuilderRolesByServer' do
    before do
      @miq_server = MiqServer.first
      @server_role = ServerRole.find_by(:name => "smartproxy")

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
      server_nodes = @server_tree.send(:x_get_tree_roots, false, {})
      expect(server_nodes).to eq([@miq_server])
    end

    it 'returns Roles by Servers' do
      nodes = [{'key'        => "svr-#{@miq_server.id}",
                'text'       => "<strong>Server: #{@miq_server.name} [#{@miq_server.id}] (current) ()</strong>",
                'tooltip'    => "Server: #{@miq_server.name} [#{@miq_server.id}] (current) ()",
                'icon'       => "pficon pficon-server",
                'selectable' => true,
                'nodes'      => [
                  {
                    'key'            => "asr-#{@assigned_server_role1.id}",
                    'text'           => "<strong>Role: SmartProxy</strong> (unavailable)",
                    'icon'           => 'pficon pficon-off',
                    'iconBackground' => '#CC0000',
                    'selectable'     => true,
                    'state'          => {'expanded' => true},
                    'class'          => 'red'
                  },
                  {
                    'key'            => "asr-#{@assigned_server_role2.id}",
                    'text'           => "<strong>Role: SmartProxy</strong> (unavailable)",
                    'icon'           => 'pficon pficon-off',
                    'iconBackground' => '#CC0000',
                    'selectable'     => true,
                    'state'          => {'expanded' => true},
                    'class'          => ''
                  },
                ],
                'state'      => {'expanded' => true},
                'class'      => ''}]
      expect(JSON.parse(@server_tree.locals_for_render[:bs_tree])).to eq(nodes)
    end
  end
end
