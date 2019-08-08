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
        :real_target_type       => "ServiceTemplate",
        :dialog_id              => 654,
        :force_old_dialog_use   => false,
        :api_submit_endpoint    => "/api/service_catalogs/123/service_templates/321",
        :api_action             => "order",
        :finish_submit_endpoint => "finishsubmitendpoint",
        :cancel_endpoint        => "/catalog/explorer",
        :open_url               => false
      )
    end

    it "uses the base class for service_template derived classes" do
      allow(target_ansible).to receive(:kind_of?).with(ServiceTemplate).and_return(true)
      expect(service.determine_dialog_locals_for_svc_catalog_provision(resource_action, target_ansible, finish_submit_endpoint)).to eq(:resource_action_id     => 456,
                                                                                                                                       :target_id              => 987,
                                                                                                                                       :target_type            => 'service_template',
                                                                                                                                       :real_target_type       => "ServiceTemplate",
                                                                                                                                       :dialog_id              => 654,
                                                                                                                                       :force_old_dialog_use   => false,
                                                                                                                                       :api_submit_endpoint    => "/api/service_catalogs/798/service_templates/987",
                                                                                                                                       :api_action             => "order",
                                                                                                                                       :finish_submit_endpoint => "finishsubmitendpoint",
                                                                                                                                       :cancel_endpoint        => "/catalog/explorer",
                                                                                                                                       :open_url               => false)
    end
  end

  describe "#determine_dialog_locals_for_custom_button" do
    let(:button_name) { "custom-button-name" }
    let(:resource_action) { instance_double("ResourceAction", :id => 321, :dialog_id => 654) }
    let(:display_options) { {} }

    shared_examples_for "DialogLocalService#determine_dialog_locals_for_custom_button return value" do |target_type, real_target_type, collection_name, finish_endpoint|
      it "returns a hash with the proper parameters" do
        expect(service.determine_dialog_locals_for_custom_button(obj, button_name, resource_action, display_options))
          .to eq(
            :resource_action_id     => 321,
            :target_id              => 123,
            :target_type            => target_type,
            :real_target_type       => real_target_type,
            :dialog_id              => 654,
            :force_old_dialog_use   => false,
            :api_submit_endpoint    => "/api/#{collection_name}/123",
            :api_action             => "custom-button-name",
            :finish_submit_endpoint => finish_endpoint,
            :cancel_endpoint        => finish_endpoint,
            :open_url               => false,
          )
      end
    end

    context "when the object is a AvailabilityZone" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::CloudManager::AvailabilityZone, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "availability_zone", "AvailabilityZone", "availability_zones", "/availability_zone"
    end

    context "when the object is a CloudNetwork" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::NetworkManager::CloudNetwork, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_network", "CloudNetwork", "cloud_networks", "/cloud_network"
    end

    context "when the object is a NetworkManager" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::NetworkManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_network"
    end

    context "when the object is a private CloudNetwork" do
      let(:obj) { double(:class => ManageIQ::Providers::Openstack::NetworkManager::CloudNetwork::Private, :id => 123) }
      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_network", "CloudNetwork", "cloud_networks", "/cloud_network"
    end

    context "when the object is a CloudObjectStoreContainer" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::StorageManager::S3::CloudObjectStoreContainer, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_object_store_container", "CloudObjectStoreContainer", "cloud_object_store_containers", "/cloud_object_store_container"
    end

    context "when the object is a CloudSubnet" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::NetworkManager::CloudSubnet, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_subnet", "CloudSubnet", "cloud_subnets", "/cloud_subnet"
    end

    context "when the object is an EmsStorage" do
      let(:obj) { double(:class => ManageIQ::Providers::StorageManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_infra"
    end

    context "when the object is an Ebs" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::StorageManager::Ebs, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ems_storage", "ExtManagementSystem", "providers", "/ems_infra"
    end

    context "when the object is an CinderManager" do
      let(:obj) { double(:class => ManageIQ::Providers::StorageManager::CinderManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_block_storage"
    end

    context "when the object is an SwiftManager" do
      let(:obj) { double(:class => ManageIQ::Providers::StorageManager::SwiftManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_object_storage"
    end

    context "when the object is a CloudTenant" do
      let(:obj) { double(:class => ManageIQ::Providers::Openstack::CloudManager::CloudTenant, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_tenant", "CloudTenant", "cloud_tenants", "/cloud_tenant"
    end

    context "when the object is a CloudVolume" do
      let(:obj) { double(:class => ManageIQ::Providers::Openstack::CloudManager::CloudVolume, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "cloud_volume", "CloudVolume", "cloud_volumes", "/cloud_volume"
    end

    context "when the object is a ContainerGroup" do
      let(:obj) { double(:class => ManageIQ::Providers::Kubernetes::ContainerManager::ContainerGroup, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_group", "ContainerGroup", "container_groups", "/container_group"
    end

    context "when the object is a ContainerImage" do
      let(:obj) { double(:class => ManageIQ::Providers::Openshift::ContainerManager::ContainerImage, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_image", "ContainerImage", "container_images", "/container_image"
    end

    context "when the object is a ContainerNode" do
      let(:obj) { double(:class => ManageIQ::Providers::Kubernetes::ContainerManager::ContainerNode, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_node", "ContainerNode", "container_nodes", "/container_node"
    end

    context "when the object is a ContainerProject" do
      let(:obj) { double(:class => ContainerProject, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_project", "ContainerProject", "container_projects", "/container_project"
    end

    context "when the object is a ContainerTemplate" do
      let(:obj) { double(:class => ManageIQ::Providers::Kubernetes::ContainerManager::ContainerTemplate, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_template", "ContainerTemplate", "container_templates", "/container_template"
    end

    context "when the object is a ContainerVolume" do
      let(:obj) { double(:class => ContainerVolume, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "container_volume", "ContainerVolume", "container_volumes", "/persistent_volume/show/123"
    end

    context "when the object is an EmsCluster" do
      let(:obj) { double(:class => ManageIQ::Providers::Openstack::InfraManager::EmsCluster, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ems_cluster", "EmsCluster", "clusters", "/ems_cluster"
    end

    context "when the object is a GenericObject" do
      let(:obj) { double(:class => GenericObject, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "generic_object", "GenericObject", "generic_objects", "/service/explorer"
    end

    context "when the object is a Host" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Host, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "host", "Host", "hosts", "/host"
    end

    context "when the object is a HostEsx" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::HostEsx, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "host", "Host", "hosts", "/host"
    end

    context "when the object is an InfraManager" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_infra"
    end

    context "when the object is a CloudManager" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::CloudManager, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "ext_management_system", "ExtManagementSystem", "providers", "/ems_cloud"
    end

    context "when the object is a NetworkRouter" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::NetworkManager::NetworkRouter, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "network_router", "NetworkRouter", "network_routers", "/network_router"
    end

    context "when the object is an OrchestrationStack" do
      let(:obj) { double(:class => ManageIQ::Providers::Vmware::CloudManager::OrchestrationStack, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "orchestration_stack", "OrchestrationStack", "orchestration_stacks", "/orchestration_stack"
    end

    context "when the object is a SecurityGroup" do
      let(:obj) { double(:class => ManageIQ::Providers::Amazon::NetworkManager::SecurityGroup, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "security_group", "SecurityGroup", "security_groups", "/security_group"
    end

    context "when the object is a Service" do
      let(:obj) { double(:class => Service, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a ServiceAnsiblePlaybook" do
      let(:obj) { double(:class => ServiceAnsiblePlaybook, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a ServiceAnsibleTower" do
      let(:obj) { double(:class => ServiceAnsibleTower, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a ServiceContainerTemplate" do
      let(:obj) { double(:class => ServiceContainerTemplate, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a ServiceGeneric" do
      let(:obj) { double(:class => ServiceGeneric, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a ServiceOrchestration" do
      let(:obj) { double(:class => ServiceOrchestration, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "service", "Service", "services", "/service/explorer"
    end

    context "when the object is a Storage" do
      let(:obj) { double(:class => Storage, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "storage", "Storage", "data_stores", "/storage/explorer"
    end

    context "when the object is a Switch" do
      let(:obj) { double(:class => Switch, :id => 123) }

      include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                       "switch", "Switch", "switches", "/infra_networking/explorer"
    end

    context "when the object is a Template" do
      context "when there is a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::CloudManager::Template, :id => 123) }
        let(:display_options) { {:cancel_endpoint => "/vm_cloud/explorer"} }

        include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                         "miq_template", "VmOrTemplate", "templates", "/vm_cloud/explorer"
      end

      context "when there is not a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Template, :id => 123) }

        include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                         "miq_template", "VmOrTemplate", "templates", "/vm_or_template/explorer"
      end
    end

    context "when the object is a Vm" do
      context "when there is a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::CloudManager::Vm, :id => 123) }
        let(:display_options) { {:cancel_endpoint => "/vm_cloud/explorer"} }

        include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                         "vm", "VmOrTemplate", "vms", "/vm_cloud/explorer"
      end

      context "when there is not a cancel endpoint in the display options" do
        let(:obj) { double(:class => ManageIQ::Providers::Vmware::InfraManager::Vm, :id => 123) }

        include_examples "DialogLocalService#determine_dialog_locals_for_custom_button return value",
                         "vm", "VmOrTemplate", "vms", "/vm_infra/explorer"
      end
    end
  end
end
