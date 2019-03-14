describe TreeBuilderServices do
  let(:builder) { TreeBuilderServices.new("x", "y", {}) }

  it "generates tree" do
    User.current_user = FactoryGirl.create(:user)
    allow(User).to receive(:server_timezone).and_return("UTC")
    create_deep_tree

    expect(root_nodes.size).to eq(4)
    expect(root_nodes).to match [
      a_hash_including(:id => 'asrv'),
      a_hash_including(:id => 'rsrv'),
      a_hash_including(:id => 'global'),
      a_hash_including(:id => 'my')
    ]
  end

  private

  def root_nodes
    builder.send(:x_get_tree_roots, false, {})
  end

  def kid_nodes(node)
    builder.send(:x_get_tree_custom_kids, node, false, {})
  end

  def create_deep_tree
    @service      = FactoryGirl.create(:service, :display => true, :retired => false)
    @service_c1   = FactoryGirl.create(:service, :service => @service, :display => true, :retired => false)
    @service_c11  = FactoryGirl.create(:service, :service => @service_c1, :display => true, :retired => false)
    @service_c12  = FactoryGirl.create(:service, :service => @service_c1, :display => true, :retired => false)
    @service_c121 = FactoryGirl.create(:service, :service => @service_c12, :display => true, :retired => false)
    @service_c2   = FactoryGirl.create(:service, :service => @service, :display => true, :retired => false)
    # hidden
    @service_c3   = FactoryGirl.create(:service, :service => @service, :retired => true, :display => true)
  end
end
