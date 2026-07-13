describe MiqAeCustomizationController do
  context "::Dialogs" do
    context "#dialog_delete" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => %w[dialog_delete old_dialogs_accord])
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

    # -----------------------------------------------------------------------
    # #editor — renders the React ServiceDialogForm with the correct props
    # -----------------------------------------------------------------------
    context "#editor" do
      before do
        EvmSpecHelper.local_miq_server
        stub_user(:features => :all)
      end

      context "creating a new dialog" do
        it "assigns a new Dialog record" do
          get :editor
          expect(assigns(:record)).to be_a_new(Dialog)
        end

        it "sets the title for a new dialog" do
          get :editor
          expect(assigns(:title)).to eq(_("Add a new Dialog"))
        end

        it "renders the editor template" do
          get :editor
          expect(response).to render_template('miq_ae_customization/editor')
        end

        it "produces a dialog_id_action with action=new and blank id" do
          get :editor
          expect(controller.dialog_id_action).to eq(:id => '', :action => 'new')
        end
      end

      context "editing an existing dialog" do
        let(:dialog) { FactoryBot.create(:dialog, :label => "My Dialog") }

        it "assigns the existing Dialog record" do
          get :editor, :params => {:id => dialog.id}
          expect(assigns(:record)).to eq(dialog)
        end

        it "sets the title to include the dialog name" do
          get :editor, :params => {:id => dialog.id}
          expect(assigns(:title)).to include("My Dialog")
        end

        it "produces a dialog_id_action with action=edit and the dialog id" do
          get :editor, :params => {:id => dialog.id}
          expect(controller.dialog_id_action).to eq(:id => dialog.id.to_s, :action => 'edit')
        end
      end

      context "copying an existing dialog" do
        let(:dialog) { FactoryBot.create(:dialog, :label => "Original Dialog") }

        it "assigns a new Dialog record (the copy target)" do
          get :editor, :params => {:copy => dialog.id}
          expect(assigns(:record)).to be_a_new(Dialog)
        end

        it "sets the title for a new dialog (copy is treated as new)" do
          get :editor, :params => {:copy => dialog.id}
          expect(assigns(:title)).to eq(_("Add a new Dialog"))
        end

        it "produces a dialog_id_action with action=copy and the source id" do
          get :editor, :params => {:copy => dialog.id}
          expect(controller.dialog_id_action).to eq(:id => dialog.id.to_s, :action => 'copy')
        end
      end
    end

    # -----------------------------------------------------------------------
    # #dialog_new_editor, #dialog_edit_editor, #dialog_copy_editor
    # redirect to the editor action with the correct params
    # -----------------------------------------------------------------------
    context "#dialog_new_editor redirect" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => %w[dialog_new_editor])
        allow(controller).to receive(:javascript_redirect) { |opts| @redirect_opts = opts }
      end

      it "redirects to editor with no id param" do
        controller.send(:dialog_new_editor)
        expect(@redirect_opts).to include(:action => 'editor')
        expect(@redirect_opts[:id]).to be_nil.or be_empty
      end
    end

    context "#dialog_edit_editor redirect" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => %w[dialog_edit_editor])
        allow(controller).to receive(:javascript_redirect) { |opts| @redirect_opts = opts }
        allow(controller).to receive(:find_records_with_rbac).and_return(dialog)
      end

      let(:dialog) { FactoryBot.create(:dialog) }

      it "redirects to editor with the dialog id" do
        controller.params = {:id => dialog.id}
        controller.send(:dialog_edit_editor)
        expect(@redirect_opts).to include(:action => 'editor', :id => dialog.id)
      end
    end

    context "#dialog_copy_editor redirect" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryBot.create(:user, :features => %w[dialog_copy_editor])
        allow(controller).to receive(:javascript_redirect) { |opts| @redirect_opts = opts }
        allow(controller).to receive(:find_record_with_rbac).and_return(dialog)
      end

      let(:dialog) { FactoryBot.create(:dialog) }

      it "redirects to editor with copy param set to the source dialog id" do
        controller.params = {:id => dialog.id}
        controller.send(:dialog_copy_editor)
        expect(@redirect_opts).to include(:action => 'editor', :copy => dialog.id)
      end
    end
  end
end
