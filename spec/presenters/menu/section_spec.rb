describe Menu::Section do
  let(:admin) { FactoryBot.create(:user_admin) }
  let(:user)  { FactoryBot.create(:user, :features => ["vm_infra_explorer", "my_settings_view"]) }

  subject do
    Menu::Section.new(:outer_section, "Outer Section", nil, [
      Menu::Section.new(:inner_section, "Inner Section", nil, [
        Menu::Item.new('vm_infra',    'Virtual Machines', 'vm_infra_explorer', {:feature => 'vm_infra_explorer', :any => true}, '/vm_infra/explorer'),
        Menu::Item.new('ems_storage', 'Storage Managers', 'ems_storage',       {:feature => 'ems_storage_show_list'},           '/ems_storage/show_list'),
      ]),
      Menu::Item.new('configuration', 'My Settings',         'my_settings',  {:feature => 'my_settings_view', :any => true}, '/configuration/index'),
      Menu::Item.new('ops_explorer', 'Application Settings', 'ops_explorer', {:feature => 'ops_explorer',     :any => true}, '/ops/explorer'),
    ])
  end

  def each_menu_component(menu = subject, &block)
    yield menu
    menu.items.each { |i| each_menu_component(i, &block) }
  end

  describe "#visible?" do
    context "with a user with all permissions" do
      before { login_as(admin) }

      it "by default all are visible" do
        each_menu_component do |m|
          expect(m).to be_visible
        end
      end

      it "when a section is configured to be hidden" do
        allow(Vmdb::PermissionStores).to receive(:instance).and_return(
          Vmdb::PermissionStores.new(["ui-menu:inner_section"])
        )
        expected_hidden = [:inner_section]

        each_menu_component do |m|
          if expected_hidden.include?(m.id)
            expect(m).to_not be_visible
          else
            expect(m).to be_visible
          end
        end
      end

      it "when an item is configured to be hidden" do
        allow(Vmdb::PermissionStores).to receive(:instance).and_return(
          Vmdb::PermissionStores.new(["ui-menu:vm_infra"])
        )
        expected_hidden = ["vm_infra"]

        each_menu_component do |m|
          if expected_hidden.include?(m.id)
            expect(m).to_not be_visible
          else
            expect(m).to be_visible
          end
        end
      end
    end

    context "with a user with partial permissions" do
      before { login_as(user) }

      let(:default_visible) { [:outer_section, :inner_section, "vm_infra", "configuration"] }

      it "by default can only see items they have access to" do
        expected_visible = default_visible

        each_menu_component do |m|
          if expected_visible.include?(m.id)
            expect(m).to be_visible
          else
            expect(m).to_not be_visible
          end
        end
      end

      it "when a section is configured to be hidden" do
        allow(Vmdb::PermissionStores).to receive(:instance).and_return(
          Vmdb::PermissionStores.new(["ui-menu:inner_section"])
        )
        expected_visible = default_visible - [:inner_section]

        each_menu_component do |m|
          if expected_visible.include?(m.id)
            expect(m).to be_visible
          else
            expect(m).to_not be_visible
          end
        end
      end

      it "when an item is configured to be hidden" do
        allow(Vmdb::PermissionStores).to receive(:instance).and_return(
          Vmdb::PermissionStores.new(["ui-menu:configuration"])
        )
        expected_visible = default_visible - ["configuration"]

        each_menu_component do |m|
          if expected_visible.include?(m.id)
            expect(m).to be_visible
          else
            expect(m).to_not be_visible
          end
        end
      end
    end
  end
end
