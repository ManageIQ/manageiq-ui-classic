describe MiqAeCustomizationController do
  context "::Dialogs" do
    context "#dialog_delete" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => "dialog_delete")
        allow(controller).to receive(:check_privileges).and_return(true)
      end

      it "flash message displays Dialog Label being deleted" do
        dialog = FactoryBot.create(:dialog, :label       => "Test Label",
                                             :description => "Test Description",
                                             :buttons     => "submit,reset,cancel")

        controller.instance_variable_set(:@sb,
                                         :trees       => {
                                           :dlg_tree => {:active_node => dialog.id.to_s}
                                         },
                                         :active_tree => :dlg_tree)
        session[:settings] = {:display   => {:locale => 'default'}}

        controller.instance_variable_set(:@settings, :display => {:locale => 'default'})
        allow(controller).to receive(:replace_right_cell)

        # Now delete the Dialog
        controller.params = {:id => dialog.id}
        controller.send(:dialog_delete)

        # Check for Dialog Label to be part of flash message displayed
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Dialog \"Test Label\": Delete successful")

        expect(controller.send(:flash_errors?)).to be_falsey
      end
    end

    context "restricted user access" do
      let(:permissions) { %w(dialog_new_editor dialog_edit_editor) }

      before do
        EvmSpecHelper.seed_specific_product_features(permissions)
        allow(controller).to receive(:find_records_with_rbac).and_return(dialog)
        allow(controller).to receive(:javascript_redirect)
      end

      let(:features) { MiqProductFeature.find_all_by_identifier(permissions) }
      let(:role_with_access) { FactoryBot.create(:miq_user_role, :miq_product_features => features) }
      let(:tenant) { FactoryBot.create(:tenant, :parent => Tenant.root_tenant) }
      let(:group) { FactoryBot.create(:miq_group, :tenant => tenant, :miq_user_role => role_with_access) }
      let(:user)  { FactoryBot.create(:user, :miq_groups => [group]) }
      let(:dialog) { FactoryBot.create(:dialog) }

      it "grants permissions" do
        User.with_user(user) do
          expect do
            controller.dialog_new_editor
            controller.dialog_edit_editor
          end.not_to raise_error
        end
      end

      let(:role_without_access) { FactoryBot.create(:miq_user_role, :miq_product_features => []) }
      let(:group_without_access) { FactoryBot.create(:miq_group, :tenant => tenant, :miq_user_role => role_without_access) }
      let(:user_without_access)  { FactoryBot.create(:user, :miq_groups => [group_without_access]) }

      it "doesn't grant permissions for dialog_edit_editor" do
        User.with_user(user_without_access) do
          expect do
            controller.dialog_new_editor
            controller.dialog_edit_editor
          end.to raise_exception(MiqException::RbacPrivilegeException)
        end
      end
    end
  end
end
