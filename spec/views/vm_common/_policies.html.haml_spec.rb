describe 'vm_common/_policies.html.haml' do
  before do
    assign(:policy_options, :out_of_scope => true, :passed => true, :failed => true)
    assign(:policy_simulation_tree, TreeBuilderPolicySimulation.new(:policy_simulation_tree, {}, true))
    assign(:record, FactoryBot.create(:vm_infra))
    set_controller_for_view('vm_or_template')
  end

  it 'renders Back button for non explorer screens' do
    render :partial => 'vm_common/policies'
    expect(response).to include('<a class="btn btn-default" alt="Back" title="Back" rel="nofollow" data-method="post" href="/vm/policy_sim?continue=true">Back</a>')
  end
end
