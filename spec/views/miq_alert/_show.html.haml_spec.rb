describe "miq_alert/show.html.haml" do
  before do
    @alert = FactoryBot.create(:miq_alert)
    ActionView::TestCase::TestController::SEVERITIES = MiqAlertController::SEVERITIES
    exp = {:eval_method => 'nothing', :mode => 'internal', :options => {}}
    allow(@alert).to receive(:expression).and_return(exp)
    set_controller_for_view("miq_policy")
  end

  it "Trap Number is displayed correctly" do
    opts = {:notifications => {:snmp => {:host => ['test.test.org'], :snmp_version => 'v1', :trap_id => '42'}}}
    allow(@alert).to receive(:options).and_return(opts)
    render
    expect(rendered).to include('Trap Number')
  end
end
