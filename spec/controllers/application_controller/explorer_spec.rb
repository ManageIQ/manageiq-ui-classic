describe VmInfraController do
  describe "ApplicationController::Explorer concern" do
    context "#valid_active_node" do
      let(:active_tree) { :stcat_tree }

      it "root node" do
        active_node = "root"

        controller.instance_variable_set(:@sb, :trees => {active_tree => {:active_node => active_node}}, :active_tree => active_tree)
        res = controller.send(:valid_active_node, active_node)
        expect(controller.send(:flash_errors?)).not_to be_truthy
        expect(res).to eq(active_node)
      end

      it "valid node" do
        rec = FactoryBot.create(:service_template_catalog)
        active_node = "stc-#{rec.id}"

        controller.instance_variable_set(:@sb, :trees => {active_tree => {:active_node => active_node}}, :active_tree => active_tree)
        res = controller.send(:valid_active_node, active_node)
        expect(controller.send(:flash_errors?)).not_to be_truthy
        expect(res).to eq(active_node)
      end

      it "node no longer exists" do
        rec = FactoryBot.create(:service_template_catalog)
        active_node = "stc-#{rec.id + 1}"

        controller.instance_variable_set(:@sb, :trees => {active_tree => {:active_node => active_node}}, :active_tree => active_tree)
        res = controller.send(:valid_active_node, active_node)
        expect(controller.send(:flash_errors?)).to be_truthy
        expect(res).to eq("root")
      end
    end

    context "#rbac_filtered_objects" do
      let(:ems_folder) { FactoryBot.create(:ems_folder) }
      let!(:ems) { FactoryBot.create(:ems_vmware, :ems_folders => [ems_folder]) }
      let(:user)       { FactoryBot.create(:user_admin) }
      let(:vm)         { FactoryBot.create(:vm_vmware, :ext_management_system => ems) }

      before do
        EvmSpecHelper.create_guid_miq_server_zone

        user.current_group.entitlement = Entitlement.create!
        user.current_group.entitlement.set_managed_filters([["/managed/service_level/gold"]])
        user.current_group.save

        ems_folder.add_child(vm)
      end

      it "properly calls RBAC" do
        vm.tag_with('/managed/service_level/gold', :ns => '*')

        expect(Rbac.filtered(EmsFolder, :match_via_descendants => "VmOrTemplate", :user => user)).to eq([ems_folder])
      end
    end
  end
end

describe ReportController do
  context '#tree_add_child_nodes' do
    it 'calls tree_add_child_nodes TreeBuilder method' do
      widget = FactoryBot.create(:miq_widget)
      controller.instance_variable_set(:@sb,
                                       :trees       => {:widgets_tree => {:active_node => "root",
                                                                          :klass_name  => "TreeBuilderReportWidgets",
                                                                          :open_nodes  => []}},
                                       :active_tree => :widgets_tree)
      TreeBuilderReportWidgets.new('widgets_tree', {})
      nodes = controller.send(:tree_add_child_nodes, 'xx-r')
      expected = [{:key        => "xx-r_-#{widget.id}",
                   :text       => widget.name,
                   :icon       => 'fa fa-file-text-o',
                   :tooltip    => widget.name,
                   :state      => {:expanded => false},
                   :selectable => true}]
      expect(nodes).to eq(expected)
    end
  end
end
