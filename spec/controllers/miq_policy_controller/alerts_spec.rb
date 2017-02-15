describe MiqPolicyController do
  context "::Alerts" do
    describe '#alert_delete' do
      before do
        login_as FactoryGirl.create(:user, :features => "alert_delete")
      end

      let(:alert) { FactoryGirl.create(:miq_alert, :read_only => readonly) }

      context 'read only alert' do
        let(:readonly) { true }

        it 'renders a flash message' do
          controller.params[:id] = alert.id
          controller.instance_variable_set(:@sb, {})
          expect(controller).to receive(:x_node)
          expect(controller).to receive(:get_node_info)
          expect(controller).to receive(:replace_right_cell)
          expect(controller).not_to receive(:process_alerts)
          controller.send(:alert_delete)
        end
      end
    end

    context "#alert_build_edit_screen" do
      before do
        login_as FactoryGirl.create(:user, :features => "alert_admin")
      end

      before :each do
        @miq_alert = FactoryGirl.create(:miq_alert)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree
                                        )
      end

      it "it should skip id when copying all attributes of an existing alert" do
        controller.instance_variable_set(:@_params, :id => @miq_alert.id, :copy => "copy")
        controller.send(:alert_build_edit_screen)
        expect(assigns(:alert).id).to eq(nil)
      end

      it "it should select correct record when editing an existing alert" do
        controller.instance_variable_set(:@_params, :id => @miq_alert.id)
        controller.send(:alert_build_edit_screen)
        expect(assigns(:alert).id).to eq(@miq_alert.id)
      end
    end

    context 'test click on toolbar button' do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryGirl.create(:user, :features => %w(alert_edit alert_profile_assign alert_delete alert_copy alert_profile_new))
        #login_as FactoryGirl.create(:user, :features => "alert_admin")
        @miq_alert = FactoryGirl.create(:miq_alert)
        allow(controller).to receive(:x_active_tree).and_return(:alert_tree)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree,
                                        )
      end

      let(:alert) { FactoryGirl.create(:miq_alert, :read_only => false) }

      it "alert edit" do
        post :x_button, :pressed => 'alert_edit', :id => alert.id
        expect(response.status).to eq(200)
      end

      it "alert copy" do
        post :x_button, :pressed => 'alert_copy', :id => alert.id
        expect(response.status).to eq(200)
      end

      it "alert new" do
        post :x_button, :pressed => 'alert_profile_new'
        expect(response.status).to eq(200)
      end

      it "tree select" do
        post :tree_select, :id => "al-#{@miq_alert.id}"
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => 'miq_policy/_alert_details')
      end
    end
  end
end
