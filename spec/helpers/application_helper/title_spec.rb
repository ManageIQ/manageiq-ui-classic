describe ApplicationHelper::Title do
  context "#title_from_layout" do
    let(:title) { Vmdb::Appliance.PRODUCT_NAME }
    subject { helper.productized_title(helper.title_from_layout(@layout)) }

    it "when layout is blank" do
      @layout = ""
      expect(subject).to eq(title)
    end

    it "when layout = 'miq_server'" do
      @layout = "miq_server"
      expect(subject).to eq(title + ": Servers")
    end

    it "when layout = 'usage'" do
      @layout = "usage"
      expect(subject).to eq(title + ": VM Usage")
    end

    it "when layout = 'scan_profile'" do
      @layout = "scan_profile"
      expect(subject).to eq(title + ": Analysis Profiles")
    end

    it "when layout = 'miq_policy_rsop'" do
      @layout = "miq_policy_rsop"
      expect(subject).to eq(title + ": Policy Simulation")
    end

    it "when layout = 'all_tasks'" do
      @layout = "all_tasks"
      expect(subject).to eq(title + ": All Tasks")
    end

    it "when layout = 'management_system'" do
      @layout = "management_system"
      expect(subject).to eq(title + ": Management Systems")
    end

    it "when layout = 'ops'" do
      @layout = "ops"
      expect(subject).to eq(title + ": Configuration")
    end

    it "when layout = 'pxe'" do
      @layout = "pxe"
      expect(subject).to eq(title + ": PXE")
    end

    it "when layout = 'vm_or_template'" do
      @layout = "vm_or_template"
      expect(subject).to eq(title + ": Workloads")
    end

    it "when layout likes 'miq_ae_*'" do
      @layout = "miq_ae_some_thing"
      expect(subject).to eq(title + ": Automation")
    end

    it "when layout likes 'miq_policy*'" do
      @layout = "miq_policy_some_thing"
      expect(subject).to eq(title + ": Control")
    end

    it "when layout = 'miq_capacity_utilization'" do
      @layout = "miq_capacity_utilization"
      expect(subject).to eq(title + ": Utilization")
    end

    it "when layout likes 'miq_request*'" do
      @layout = "miq_request_some_thing"
      expect(subject).to eq(title + ": Requests")
    end

    it "otherwise" do
      @layout = "xxx"
      expect(subject).to eq(title + ": #{ui_lookup(:tables => @layout)}")
    end
  end
end
