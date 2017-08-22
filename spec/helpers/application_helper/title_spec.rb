describe ApplicationHelper::Title do
  context "#title_from_layout" do
    let(:title) { I18n.t('product.name') }
    subject { helper.title_from_layout(@layout) }

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

    it "when layout = 'rss'" do
      @layout = "rss"
      expect(subject).to eq(title + ": RSS")
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

    it "when layout = 'miq_capacity_planning'" do
      @layout = "miq_capacity_planning"
      expect(subject).to eq(title + ": Planning")
    end

    it "when layout = 'miq_capacity_bottlenecks'" do
      @layout = "miq_capacity_bottlenecks"
      expect(subject).to eq(title + ": Bottlenecks")
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

  context "#title_for_hosts" do
    it "returns 'Hosts / Nodes' when there are both openstack & non-openstack hosts" do
      FactoryGirl.create(:host_vmware_esx, :ext_management_system => FactoryGirl.create(:ems_vmware))
      FactoryGirl.create(:host_openstack_infra, :ext_management_system => FactoryGirl.create(:ems_openstack_infra))

      expect(helper.title_for_hosts).to eq("Hosts / Nodes")
    end

    it "returns 'Hosts' when there are only non-openstack hosts" do
      FactoryGirl.create(:host_vmware_esx, :ext_management_system => FactoryGirl.create(:ems_vmware))

      expect(helper.title_for_hosts).to eq("Hosts")
    end

    it "returns 'Nodes' when there are only openstack hosts" do
      FactoryGirl.create(:host_openstack_infra, :ext_management_system => FactoryGirl.create(:ems_openstack_infra))

      expect(helper.title_for_hosts).to eq("Nodes")
    end
  end

  context "#title_for_host" do
    it "returns 'Host' for non-openstack host" do
      FactoryGirl.create(:host_vmware, :ext_management_system => FactoryGirl.create(:ems_vmware))

      expect(helper.title_for_host).to eq("Host")
    end

    it "returns 'Node' for openstack host" do
      FactoryGirl.create(:host_openstack_infra, :ext_management_system => FactoryGirl.create(:ems_openstack_infra))

      expect(helper.title_for_host).to eq("Node")
    end
  end

  context "#title_for_clusters" do
    before(:each) do
      @ems1 = FactoryGirl.create(:ems_vmware)
      @ems2 = FactoryGirl.create(:ems_openstack_infra)
    end

    it "returns 'Clusters / Deployment Roles' when there are both openstack & non-openstack clusters" do
      FactoryGirl.create(:ems_cluster, :ems_id => @ems1.id)
      FactoryGirl.create(:ems_cluster, :ems_id => @ems2.id)

      result = helper.title_for_clusters
      expect(result).to eq("Clusters / Deployment Roles")
    end

    it "returns 'Clusters' when there are only non-openstack clusters" do
      FactoryGirl.create(:ems_cluster, :ems_id => @ems1.id)

      result = helper.title_for_clusters
      expect(result).to eq("Clusters")
    end

    it "returns 'Deployment Roles' when there are only openstack clusters" do
      FactoryGirl.create(:ems_cluster, :ems_id => @ems2.id)

      result = helper.title_for_clusters
      expect(result).to eq("Deployment Roles")
    end
  end

  context "#title_for_cluster" do
    before(:each) do
      @ems1 = FactoryGirl.create(:ems_vmware)
      @ems2 = FactoryGirl.create(:ems_openstack_infra)
    end

    it "returns 'Cluster' for non-openstack cluster" do
      FactoryGirl.create(:ems_cluster, :ems_id => @ems1.id)

      result = helper.title_for_cluster
      expect(result).to eq("Cluster")
    end

    it "returns 'Deployment Role' for openstack cluster" do
      FactoryGirl.create(:ems_cluster, :ems_id => @ems2.id)

      result = helper.title_for_cluster
      expect(result).to eq("Deployment Role")
    end
  end
end
