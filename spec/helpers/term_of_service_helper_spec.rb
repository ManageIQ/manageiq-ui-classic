describe TermOfServiceHelper do
  context "#ASSIGN_TOS" do
    it "verify that other CI values have been merged into Vm hash" do
      vm_values = {
        "ems_folder"                 => "Selected Folders",
        "resource_pool"              => "Selected Resource Pools",
        "resource_pool-tags"         => "Tagged Resource Pools",
        "vm-tags"                    => "Tagged VMs and Instances",
        "host"                       => "Selected Hosts",
        "host-tags"                  => "Tagged Hosts",
        "ems_cluster"                => "Selected Clusters",
        "ems_cluster-tags"           => "Tagged Clusters",
        "enterprise"                 => "The Enterprise",
        "ext_management_system"      => "Selected Providers",
        "ext_management_system-tags" => "Tagged Providers"
      }
      expect(TermOfServiceHelper::ASSIGN_TOS["Vm"]).to eq(vm_values)
      expect(TermOfServiceHelper::ASSIGN_TOS["Vm"].length).to eq(11)
    end

    it "verify that there is a value for PhysicalServer in the hash" do
      expect(TermOfServiceHelper::ASSIGN_TOS["PhysicalServer"]). to eq("physical_server" => "Selected Servers")
      expect(TermOfServiceHelper::ASSIGN_TOS["PhysicalServer"].length). to eq(1)
    end
  end
end
