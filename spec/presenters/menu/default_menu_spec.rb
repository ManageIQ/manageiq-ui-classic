describe Menu::DefaultMenu do
  include Spec::Support::MenuHelper

  context 'default_menu' do
    it "does not call gettext translations" do
      expect(Menu::DefaultMenu).not_to receive(:ui_lookup).with(any_args)
      expect(Menu::DefaultMenu).not_to receive(:_)
      expect(Menu::DefaultMenu).not_to receive(:n_)
      Menu::DefaultMenu.default_menu
    end

    it "calls gettext marker" do
      expect(Menu::DefaultMenu).to receive(:N_).at_least(:once).and_call_original
      Menu::DefaultMenu.default_menu
    end
  end

  context "infrastructure_menu_section" do
    before do
      @ems_openstack = FactoryBot.create(:ems_openstack_infra)
      @ems_vmware = FactoryBot.create(:ems_vmware)
    end

    it "shows correct titles for Hosts & Clusters" do
      menu = Menu::DefaultMenu.infrastructure_menu_section.items.map(&:name)
      result = ["Providers", "Clusters", "Hosts", "Virtual Machines", "Resource Pools",
                "Datastores", "PXE", "Firmware Registry", "Networking", "Topology"]
      expect(menu).to eq(result)
    end
  end

  describe "#storage_menu_section" do
    let(:menu) { Menu::DefaultMenu }

    context "when the configuration storage product setting is set to true" do
      it "still does not contain the NetApp item" do
        stub_settings(:product => {:storage => true})
        expect(menu.storage_menu_section.items.map(&:name)).to include(
          "Block Storage",
          "Object Storage",
        )
      end
    end

    context "when the configuration storage product setting is not true" do
      it "does not contain the NetApp item" do
        stub_settings(:product => {:storage => "juliet" })
        expect(menu.storage_menu_section.items.map(&:name)).to include(
          "Block Storage",
          "Object Storage",
        )
      end
    end
  end

  context "block_storage_menu_section" do
    let(:menu) { Menu::DefaultMenu }

    it "shows correct content for Block Storage submenu" do
      menu = Menu::DefaultMenu.block_storage_menu_section.items.map(&:name)
      result = ["Managers", "Volumes", "Volume Snapshots", "Volume Backups", "Volume Types"]
      expect(menu).to eq(result)
    end
  end

  context "object_storage_menu_section" do
    let(:menu) { Menu::DefaultMenu }

    it "shows correct content for Object Storage submenu" do
      menu = Menu::DefaultMenu.object_storage_menu_section.items.map(&:name)
      result = ["Managers", "Object Store Containers", "Object Store Objects"]
      expect(menu).to eq(result)
    end
  end

  describe "#automate_menu_section" do
    let(:menu) { Menu::DefaultMenu }

    context "when the configuration generic object product setting is set to true" do
      it "contains the generic objects item" do
        stub_settings(:product => {:generic_object => true})
        expect(menu.automate_menu_section.items.map(&:name)).to include(
          "Explorer",
          "Simulation",
          "Customization",
          "Generic Objects",
          "Import / Export",
          "Log",
          "Requests"
        )
      end
    end

    context "when the configuration generic object product setting is not true" do
      it "does not contain the generic objects item" do
        stub_settings(:product => {:generic_object => "potato"})
        expect(menu.automate_menu_section.items.map(&:name)).to include(
          "Explorer",
          "Simulation",
          "Customization",
          "Import / Export",
          "Log",
          "Requests"
        )

        expect(menu.automate_menu_section.items.map(&:rbac_feature)). to match_array([{:feature => "miq_ae_domain_view"},
                                                                             {:feature => "miq_ae_class_simulation"},
                                                                             {:feature => "miq_ae_customization_explorer", :any => true},
                                                                             {:feature => "generic_object_definition"},
                                                                             {:feature => "miq_ae_class_import_export"},
                                                                             {:feature => "miq_ae_class_log"},
                                                                             {:feature => "ae_miq_request_show_list"}])
      end
    end
  end
end
