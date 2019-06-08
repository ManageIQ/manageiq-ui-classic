describe TreeBuilderServices do
  let(:builder) { TreeBuilderServices.new("x", {}) }

  it "generates tree" do
    User.current_user = FactoryBot.create(:user)
    allow(User).to receive(:server_timezone).and_return("UTC")
    create_deep_tree

    expect(root_nodes.size).to eq(4)
    expect(root_nodes).to match [
      a_hash_including(:id => 'asrv'),
      a_hash_including(:id => 'rsrv'),
      a_hash_including(:id => 'global'),
      a_hash_including(:id => 'my')
    ]

    active_nodes = kid_nodes(root_nodes[0])
    retired_nodes = kid_nodes(root_nodes[1])
    expect(active_nodes).to eq(
      @service => {
        @service_c1 => {
          @service_c11 => {},
          @service_c12 => {
            @service_c121 => {}
          }
        },
        @service_c2 => {}
      }
    )
    expect(retired_nodes).to eq(@service_c3 => {})
  end

  private

  def root_nodes
    builder.send(:x_get_tree_roots, false, {})
  end

  def kid_nodes(node)
    builder.send(:x_get_tree_custom_kids, node, false, {})
  end

  def create_deep_tree
    @service      = FactoryBot.create(:service, :display => true, :retired => false)
    @service_c1   = FactoryBot.create(:service, :service => @service, :display => true, :retired => false)
    @service_c11  = FactoryBot.create(:service, :service => @service_c1, :display => true, :retired => false)
    @service_c12  = FactoryBot.create(:service, :service => @service_c1, :display => true, :retired => false)
    @service_c121 = FactoryBot.create(:service, :service => @service_c12, :display => true, :retired => false)
    @service_c2   = FactoryBot.create(:service, :service => @service, :display => true, :retired => false)
    # hidden
    @service_c3   = FactoryBot.create(:service, :service => @service, :retired => true, :display => true)
  end
end
