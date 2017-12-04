describe DialogLocalService do
  let(:service) { described_class.new }

  describe "#determine_dialog_locals_for_svc_catalog_provision" do
    let(:resource_action) { instance_double("ResourceAction", :id => 456, :dialog_id => 654) }
    let(:target) { instance_double("ServiceTemplate", :class => ServiceTemplate, :id => 321, :service_template_catalog_id => 123) }
    let(:finish_submit_endpoint) { "finishsubmitendpoint" }

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
  end

  describe "#determine_dialog_locals_for_custom_button" do
    let(:button_name) { "custom-button-name" }
    let(:resource_action_id) { 321 }

    context "when the object is a Vm" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Vm, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action_id)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'vm',
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/vms/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/vm_infra/explorer",
          :cancel_endpoint        => "/vm_infra/explorer"
        )
      end
    end

    context "when the object is a Service" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Service, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action_id)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'service',
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/services/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/service/explorer",
          :cancel_endpoint        => "/service/explorer"
        )
      end
    end

    context "when the object is a GenericObject" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::GenericObject, :id => 123) }

      it "returns a hash" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action_id)).to eq(
          :resource_action_id     => 321,
          :target_id              => 123,
          :target_type            => 'generic_object',
          :force_old_dialog_use   => false,
          :api_submit_endpoint    => "/api/generic_objects/123",
          :api_action             => "custom-button-name",
          :finish_submit_endpoint => "/generic_object/show_list",
          :cancel_endpoint        => "/generic_object/show_list"
        )
      end
    end
  end
end
