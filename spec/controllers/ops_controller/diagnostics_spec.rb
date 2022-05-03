shared_examples "logs_collect" do |type|
  let(:klass) { type.classify.constantize }
  before do
    sb_hash = {
      :trees            => {:diagnostics_tree => {:active_node => active_node}},
      :active_tree      => :diagnostics_tree,
      :diag_selected_id => instance_variable_get("@#{type}").id,
      :active_tab       => "diagnostics_roles_servers"
    }
    controller.instance_variable_set(:@sb, sb_hash)
    EvmSpecHelper.local_miq_server
  end
end

describe OpsController do
  render_views

  describe '#report_data' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      FactoryBot.create(:miq_worker, :miq_server => server)
    end

    let(:server) { FactoryBot.create(:miq_server) }

    it 'returns workers with checkboxes' do
      report_data_request(
        :model       => 'MiqWorker',
        :parent_id   => nil,
        :named_scope => [['with_miq_server_id', server.id]],
        :explorer    => true,
        :gtl_dbname  => nil
      )
      results = assert_report_data_response
      expect(results['data']['rows'].length).to eq(1)
      expect(results['data']['rows'][0]["cells"][0]).to have_key("is_checkbox")
      expect(results['data']['rows'][0]["cells"][0]["is_checkbox"]).to be_truthy
    end
  end

  context "#tree_select" do
    it "renders zone list for diagnostics_tree root node" do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      MiqRegion.seed

      session[:sandboxes] = {"ops" => {:active_tree => :diagnostics_tree}}
      post :tree_select, :params => { :id => 'root', :format => :js }

      expect(response).to render_template('ops/_diagnostics_zones_tab')
      expect(response.status).to eq(200)
    end
  end

  context "::Diagnostics" do
    let!(:user) { stub_user(:features => :all) }
    before do
      EvmSpecHelper.local_miq_server
      MiqRegion.seed
      _guid, @miq_server, @zone = EvmSpecHelper.remote_guid_miq_server_zone
      @miq_server_to_delete = FactoryBot.create(:miq_server)
      @miq_server_to_delete.last_heartbeat -= 20.minutes
      @miq_server_to_delete.save
    end

    it "#restart_server returns successful message" do
      expect(@miq_server).to receive(:restart_queue).and_return(true)

      expect(MiqServer).to receive(:find).and_return(@miq_server)

      post :restart_server

      expect(response.body).to include("flash_msg_div")
      expect(response.body).to include("%{product} Appliance restart initiated successfully" % {:product => Vmdb::Appliance.PRODUCT_NAME})
    end

    it "#delete_server returns successful message" do
      sb_hash = {
        :trees            => {:diagnostics_tree => {:active_node => "z-#{@zone.id}"}},
        :active_tree      => :diagnostics_tree,
        :diag_selected_id => @miq_server.id,
        :active_tab       => "diagnostics_roles_servers"
      }
      @miq_server.update(:status => "stopped")
      allow(controller).to receive(:build_server_tree)
      controller.instance_variable_set(:@sb, sb_hash)

      expect(controller).to receive(:render)

      controller.send(:delete_server)

      flash_message = assigns(:flash_array).first
      expect(flash_message[:message]).to include("Delete successful")
      expect(flash_message[:level]).to be(:success)
    end

    describe '#delete_server' do
      context "server does exist" do
        it 'deletes server and refreshes screen' do
          server = FactoryBot.create(:miq_server, :zone => @zone)
          sb_hash = {
            :trees            => {:diagnostics_tree => {:active_node => "z-#{@zone.id}"}},
            :active_tree      => :diagnostics_tree,
            :diag_selected_id => @miq_server_to_delete.id,
            :active_tab       => "diagnostics_roles_servers"
          }
          @server_role = FactoryBot.create(
            :server_role,
            :name              => "smartproxy",
            :description       => "SmartProxy",
            :max_concurrent    => 1,
            :external_failover => false,
            :role_scope        => "zone"
          )
          @assigned_server_role = FactoryBot.create(
            :assigned_server_role,
            :miq_server_id  => server.id,
            :server_role_id => @server_role.id,
            :active         => true,
            :priority       => 1
          )
          controller.instance_variable_set(:@sb, sb_hash)
          controller.params = {:pressed => "zone_delete_server"}
          expect(controller).to receive :render

          controller.send(:delete_server)

          flash_array = assigns(:flash_array)

          diag_selected_id = controller.instance_variable_get(:@sb)[:diag_selected_id]
          expect(diag_selected_id).not_to eq(@miq_server_to_delete.id)
          expect(flash_array.size).to eq 1
          expect(flash_array.first[:message]).to match(/Server .*: Delete successful/)
        end
      end

      context ':diag_selected_id is not set' do
        it 'should set the flash saying that server no longer exists' do
          controller.instance_variable_set(:@sb, {})
          expect(controller).to receive :refresh_screen

          controller.send(:delete_server)

          expect(assigns(:flash_array)).to eq [
            {
              :message => 'EVM Server no longer exists',
              :level   => :error
            }
          ]
        end
      end

      context "server doesn't exist" do
        it 'should set the flash saying that server no longer exists' do
          controller.instance_variable_set(:@sb, :diag_selected_id => -100500)
          expect(controller).to receive :refresh_screen

          controller.send(:delete_server)

          expect(assigns(:flash_array)).to eq [
            {
              :message => 'The selected EVM Server was deleted',
              :level   => :success
            }
          ]
        end
      end

      context "server does exist, but something goes wrong during deletion" do
        it 'should set the flash saying that server no longer exists' do
          controller.instance_variable_set(:@sb, :diag_selected_id => @miq_server.id)
          expect(controller).to receive :refresh_screen
          expect_any_instance_of(MiqServer).to receive(:destroy).and_raise 'boom'

          controller.send(:delete_server)

          flash_array = assigns(:flash_array)
          expect(flash_array.size).to eq 1

          expect(flash_array.first[:level]).to eq :error
          expect(flash_array.first[:message]).to match /Server .*: Error during 'destroy': boom/
        end
      end

      context "#role_start" do
        before do
          assigned_server_role = FactoryBot.create(
            :assigned_server_role,
            :miq_server_id  => 1,
            :server_role_id => 1,
            :active         => false,
            :priority       => 1
          )
          sb_hash = {
            :trees            => {:diagnostics_tree => {:active_node => "root"}},
            :active_tree      => :diagnostics_tree,
            :diag_selected_id => assigned_server_role.id,
            :active_tab       => "diagnostics_roles_servers"
          }

          controller.instance_variable_set(:@sb, sb_hash)
          controller.params = {:pressed => "role_start", :action => "x_button"}
          expect(controller).to receive :build_server_tree
          expect(controller).to receive(:render)
        end

        it 'sets selected_server to selected region record in diagnostics tree' do
          controller.send(:role_start)
          expect(assigns(:selected_server)).to eq(MiqRegion.my_region)
        end

        it 'sets selected_server to selected zone record in diagnostics tree' do
          controller.x_node = "z-#{@zone.id}"
          controller.send(:role_start)
          expect(assigns(:selected_server)).to eq(@zone)
        end
      end
    end
  end
end
