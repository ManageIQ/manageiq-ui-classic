describe ComplianceSummaryHelper do
  include ApplicationHelper

  before do
    server  = FactoryBot.build(:miq_server)
    @record = FactoryBot.build(:vm_vmware, :miq_server => server)
    @compliance1 = FactoryBot.build(:compliance)
    @compliance2 = FactoryBot.build(:compliance)
    allow(self).to receive(:role_allows?).and_return(true)
  end

  context "when @explorer is set" do
    before do
      allow(controller).to receive(:controller_name).and_return("vm_infra")
      allow(controller.class).to receive(:model).and_return(VmOrTemplate)
      @explorer = true
    end

    it "#textual_compliance_status" do
      @record.compliances = [@compliance1]
      @record.save
      date = @compliance1.timestamp
      expect(helper.textual_compliance_status).to eq(:label    => "Status",
                                                     :icon     => "pficon pficon-ok",
                                                     :value    => "Compliant as of #{time_ago_in_words(date.in_time_zone(Time.zone)).titleize} Ago",
                                                     :title    => "Show Details of Compliance Check on #{format_timezone(date)}",
                                                     :explorer => true,
                                                     :link     => "/vm_infra/show/#{@record.id}?count=1&display=compliance_history")
    end

    it "#textual_compliance_history" do
      @record.compliances = [@compliance1, @compliance2]
      @record.save
      expect(helper.textual_compliance_history).to eq(:label    => "History",
                                                      :icon     => "pficon pficon-history",
                                                      :value    => "Available",
                                                      :explorer => true,
                                                      :title    => "Show Compliance History of this VM or Template (Last 10 Checks)",
                                                      :link     => "/vm_infra/show/#{@record.id}?display=compliance_history")
    end
  end

  context "for classic screens when @explorer is not set" do
    before do
      allow(controller).to receive(:controller_name).and_return("host")
      allow(controller.class).to receive(:model).and_return(Host)
    end

    it "#textual_compliance_status" do
      @record.compliances = [@compliance1]
      @record.save
      date = @compliance1.timestamp
      expect(helper.textual_compliance_status).to eq(:label => "Status",
                                                     :icon  => "pficon pficon-ok",
                                                     :value => "Compliant as of #{time_ago_in_words(date.in_time_zone(Time.zone)).titleize} Ago",
                                                     :title => "Show Details of Compliance Check on #{format_timezone(date)}",
                                                     :link  => "/host/show/#{@record.id}?count=1&display=compliance_history")
    end

    it "#textual_compliance_history" do
      @record.compliances = [@compliance1, @compliance2]
      @record.save
      expect(helper.textual_compliance_history).to eq(:label => "History",
                                                      :icon  => "pficon pficon-history",
                                                      :value => "Available",
                                                      :title => "Show Compliance History of this Host / Node (Last 10 Checks)",
                                                      :link  => "/host/show/#{@record.id}?display=compliance_history")
    end
  end
end
