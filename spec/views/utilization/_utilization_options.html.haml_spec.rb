describe "utilization/_utilization_options.html.haml" do
  before do
    set_controller_for_view("utilization")
    assign(:record, Struct.new(:id).new(2))
    assign(:sb, :options => {:days         => 2,
                             :time_profile => "1",
                             :chart_date   => "asdf"},
                :tags    => {:asdf => "fdsa"})
  end
  it "check if correct fields are being displayed if cap_type is not set" do
    # render with default cap_type variable value
    render :partial => "utilization/utilization_options",
           :locals  => {:cap_type => nil}
  end
  it "check if correct fields are being displayed if cap_type is set" do
    expect(response).not_to have_selector('label', :text => 'Selected Day')
    # render with cap_type variable set
    render :partial => "utilization/utilization_options",
           :locals  => {:cap_type => "summ"}
    expect(response).to have_selector('label', :text => 'Selected Day')
  end
end
