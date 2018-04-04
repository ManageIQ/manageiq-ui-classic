describe DialogLocalService do
  let(:service) { described_class.new }

  describe "#determine_dialog_locals_for_svc_catalog_provision" do
    let(:resource_action) { instance_double("ResourceAction", :id => 456, :dialog_id => 654) }
    let(:target) { instance_double("ServiceTemplate", :class => ServiceTemplate, :id => 321, :service_template_catalog_id => 123) }
    let(:finish_submit_endpoint) { "finishsubmitendpoint" }
    let(:target_ansible) { instance_double("ServiceTemplateAnsiblePlaybook", :class => ServiceTemplateAnsiblePlaybook, :id => 987, :service_template_catalog_id => 798) }

    it "returns a hash" do
      expect(service.determine_dialog_locals_for_svc_catalog_provision(
        resource_action, target, finish_submit_endpoint
      )).to eq(
        :resource_action_id     => 456,
        :target_id              => 321,
        :target_type            => 'service_template',
        :dialog_id              => 654,
        :force_old_dialog_use   => false,
        :api_submit_endpoint    => "/api/service_catalogs/123/service_templates/321",
        :api_action             => "order",
        :finish_submit_endpoint => "finishsubmitendpoint",
        :cancel_endpoint        => "/catalog/explorer"
      )
    end

    it "uses the base class for service_template derived classes" do
      allow(target_ansible).to receive(:kind_of?).with(ServiceTemplate).and_return(true)
      expect(service.determine_dialog_locals_for_svc_catalog_provision(resource_action, target_ansible, finish_submit_endpoint)).to eq(:resource_action_id     => 456,
                                                                                                                                       :target_id              => 987,
                                                                                                                                       :target_type            => 'service_template',
                                                                                                                                       :dialog_id              => 654,
                                                                                                                                       :force_old_dialog_use   => false,
                                                                                                                                       :api_submit_endpoint    => "/api/service_catalogs/798/service_templates/987",
                                                                                                                                       :api_action             => "order",
                                                                                                                                       :finish_submit_endpoint => "finishsubmitendpoint",
                                                                                                                                       :cancel_endpoint        => "/catalog/explorer")
    end
  end

  describe "#determine_dialog_locals_for_custom_button" do
    let(:button_name) { "custom-button-name" }
    let(:resource_action) { instance_double("ResourceAction", :id => 321, :dialog_id => 654) }

    context "when the object is a CloudTenant" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::CloudTenant, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'cloud_tenant',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/cloud_tenants/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/cloud_tenant",
          :cancel_endpoint        => "/cloud_tenant"
        )
      end
    end

    context "when the object is a CloudVolume" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::CloudVolume, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'cloud_volume',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/cloud_volumes/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/cloud_volume",
          :cancel_endpoint        => "/cloud_volume"
        )
      end
    end

    context "when the object is a ContainerNode" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::ContainerNode, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'container_node',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/container_nodes/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/container_node",
          :cancel_endpoint        => "/container_node"
        )
      end
    end

    context "when the object is an EmsCluster" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::EmsCluster, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'ems_cluster',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/clusters/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/ems_cluster",
          :cancel_endpoint        => "/ems_cluster"
        )
      end
    end

    context "when the object is a GenericObject" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::GenericObject, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'generic_object',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/generic_objects/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/service/explorer",
          :cancel_endpoint        => "/service/explorer"
        )
      end
    end

    context "when the object is a Host" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Host, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'host',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/hosts/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/host",
          :cancel_endpoint        => "/host"
        )
      end
    end

    context "when the object is an InfraManager" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'infra_manager',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/providers/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/ems_infra",
          :cancel_endpoint        => "/ems_infra"
        )
      end
    end

    context "when the object is a Template" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Template, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'miq_template',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/templates/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/vm_or_template/explorer",
          :cancel_endpoint        => "/vm_or_template/explorer"
        )
      end
    end

    context "when the object is a Service" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Service, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'service',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/services/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/service/explorer",
          :cancel_endpoint        => "/service/explorer"
        )
      end
    end

    context "when the object is a Storage" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Storage, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'storage',
          :dialog_id              => 654,
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/datastores/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/storage/explorer",
          :cancel_endpoint        => "/storage/explorer"
        )
      end
    end

    context "when the object is a Vm" do
      context "when there is a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Vm, :id => 123) }
        let(:display_options) { {:cancel_endpoint => "/vm_cloud/explorer"} }

        it "returns a hash" do
          expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action, display_options)).to eq(
            :resource_action_id     => 321,
            :target_id              => 123,
            :target_type            => 'vm',
            :dialog_id              => 654,
            :force_old_dialog_use   => false,
            :api_submit_endpoint    => "/api/vms/123",
            :api_action             => "custom-button-name",
            :finish_submit_endpoint => "/vm_cloud/explorer",
            :cancel_endpoint        => "/vm_cloud/explorer"
          )
        end
      end

      context "when there is not a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Vm, :id => 123) }

        it "returns a hash" do
          expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
            :resource_action_id     => 321,
            :target_id              => 123,
            :target_type            => 'vm',
            :dialog_id              => 654,
            :force_old_dialog_use   => false,
            :api_submit_endpoint    => "/api/vms/123",
            :api_action             => "custom-button-name",
            :finish_submit_endpoint => "/vm_infra/explorer",
            :cancel_endpoint        => "/vm_infra/explorer"
          )
        end
      end
    end

    context "when the object does not support new dialogs" do
      let(:obj) { double(:id => 123) }

      it "returns a hash with 'force_old_dialog_use' set to true" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action)).to eq(
          :force_old_dialog_use => true
        )
      end
    end
  end
end
