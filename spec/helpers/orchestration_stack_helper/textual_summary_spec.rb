describe OrchestrationStackHelper::TextualSummary do
  before { @record = FactoryBot.build(:orchestration_stack) }

  it "#textual_group_lifecycle includes retirement_date" do
    expect(textual_group_lifecycle.items).to eq(%i[retirement_date])
  end

  describe "#textual_retirement_date value" do
    it "with no :retires_on returns 'Never'" do
      expect(textual_retirement_date[:value]).to eq("Never")
    end

    it "with :retires_on returns date in %x %R %Z format" do
      @record.retires_on = Date.new(2015, 11, 0o1).in_time_zone('UTC')
      expect(textual_retirement_date[:value]).to eq("11/01/15 00:00 UTC")
    end
  end

  include_examples "textual_group", "Properties", %i[name description type status status_reason]

  include_examples "textual_group", "Lifecycle", %i[retirement_date]

  include_examples "textual_group", "Relationships", %i[
    ems_cloud
    service
    parent_orchestration_stack
    child_orchestration_stack
    orchestration_template
    instances
    security_groups
    cloud_networks
    parameters
    outputs
    resources
  ]
end
