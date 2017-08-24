describe 'layouts/_explorer.html.haml' do
  let(:tree_1) { TreeBuilderConfigurationManager.new('tree_1', 'tree_1', {}) }
  let(:accord) { {:title => 'foo', :name => 'tree_1'} }

  before do
    set_controller_for_view('provider_foreman')
    assign(:sb, {})
    assign(:trees, [tree_1])
    assign(:accords, [accord])
  end

  it 'renders the explorer listnav' do
    render :partial => 'layouts/listnav/explorer'
    expect(view).to render_template(:partial => 'layouts/listnav/_explorer')
  end
end
