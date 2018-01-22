describe MiddlewareServerController do
  let(:server) do
    FactoryGirl.create(:hawkular_middleware_server, :properties              => {},
                                                    :middleware_server_group => nil)
  end
  let!(:user) { stub_user(:features => :all) }

  render_views

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    let(:deployment) { FactoryGirl.create(:middleware_deployment, :middleware_server => server) }
    let(:datasource) { FactoryGirl.create(:middleware_datasource, :middleware_server => server) }
    let(:jms_queue) do
      FactoryGirl.create(:hawkular_middleware_messaging_initialized_queue,
                         :middleware_server => server)
    end

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :params => {:id => server.id} }

    it 'show associated server entities' do
      assert_nested_list(server, [deployment], 'middleware_deployments', 'All Middleware Deployments')
      assert_nested_list(server, [datasource], 'middleware_datasources', 'All Middleware Datasources')
    end
  end

  context '#tags_edit' do
    let!(:user) { stub_user(:features => :all) }
    let(:classification) { FactoryGirl.create(:classification, :name => 'department', :description => 'Department') }
    let(:tag1) { FactoryGirl.create(:classification_tag, :name   => 'tag1', :parent => classification) }
    let(:tag2) { FactoryGirl.create(:classification_tag, :name   => 'tag2', :parent => classification) }

    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      allow(server).to receive(:tagged_with).with(:cat => user.userid).and_return('my tags')
      allow(Classification).to receive(:find_assigned_entries).with(server).and_return([tag1, tag2])
      session[:tag_db] = 'MiddlewareServer'
      edit = {
        :key        => "MiddlewareServer_edit_tags__#{server.id}",
        :tagging    => 'MiddlewareServer',
        :object_ids => [server.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it 'builds tagging screen' do
      post :button, :params => { :pressed => 'middleware_server_tag', :format => :js, :id => server.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it 'cancels tags edit' do
      session[:breadcrumbs] = [{:url => "middleware_server/show/#{server.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => 'cancel', :format => :js, :id => server.id }
      expect(assigns(:flash_array).first[:message]).to include('was cancelled by the user')
      expect(assigns(:edit)).to be_nil
    end

    it 'save tags' do
      session[:breadcrumbs] = [{:url => "middleware_server/show/#{server.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => 'save', :format => :js, :id => server.id }
      expect(assigns(:flash_array).first[:message]).to include('Tag edits were successfully saved')
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "Diagnostic report:" do
    let!(:mw_server) { FactoryGirl.create(:hawkular_middleware_server) }
    let!(:mw_dr) do
      report = FactoryGirl.build(:hawkular_jdr_report, :middleware_server => mw_server)
      report.status = report.class::STATUS_READY
      report.binary_blob = BinaryBlob.create(:name => 'diagnostic_report.zip', :data_type => 'tzip')
      report.binary_blob.binary = 'Report content'
      report.save!
      report
    end
    let!(:mw_dr_erred) do
      report = FactoryGirl.build(:hawkular_jdr_report, :middleware_server => mw_server)
      report.status = report.class::STATUS_ERROR
      report.save!
      report
    end
    let!(:mw_dr_missing) do
      FactoryGirl.build(:hawkular_jdr_report, :middleware_server => mw_server)
    end

    it 'should stream diagnostic report file to client for download' do
      get :dr_download, :params => {:id => mw_server.id, :key => mw_dr.id }

      expect(response.headers['Content-Disposition']).to eq('attachment; filename=diagnostic_report.zip')
      expect(response.headers['Content-Length']).to eq(mw_dr.binary_blob.size)
      expect(response.body).to eq('Report content')
    end

    it 'should not stream deleted diagnostic report file to client for download' do
      action = get :dr_download, :params => {:id => mw_server.id, :key => mw_dr_missing.id }

      expect(action).to redirect_to(
        :action      => 'show',
        :id          => mw_server.id,
        :flash_msg   => 'Unable to locate a report in database, please try again.',
        :flash_error => true
      )
    end

    it 'should delete one report if requested' do
      action = post :dr_delete, :params => { :id => mw_server.id, :mw_dr_selected => mw_dr.id }

      expect { mw_dr.reload }.to raise_exception(ActiveRecord::RecordNotFound)
      expect(mw_dr_erred.reload).to be_truthy
      expect(action).to redirect_to(:action => 'show', :id => mw_server.id)
      expect(assigns(:flash_array).first[:message]).to include(
        'Deletion of one JDR report succeeded.'
      )
    end

    it 'should delete more than one report if requested' do
      action = post :dr_delete, :params => {
        :id             => mw_server.id,
        :mw_dr_selected => [mw_dr.id, mw_dr_erred.id]
      }

      expect { mw_dr.reload }.to raise_exception(ActiveRecord::RecordNotFound)
      expect { mw_dr_erred.reload }.to raise_exception(ActiveRecord::RecordNotFound)
      expect(action).to redirect_to(:action => 'show', :id => mw_server.id)
      expect(assigns(:flash_array).first[:message]).to include(
        'Deletion of 2 JDR reports succeeded.'
      )
    end

    it 'should not delete a nonexistent report if requested' do
      action = post :dr_delete, :params => {
        :id             => mw_server.id,
        :mw_dr_selected => mw_dr_missing.id
      }

      expect(mw_dr.reload).to be_truthy
      expect(mw_dr_erred.reload).to be_truthy
      expect(action).to redirect_to(:action => 'show', :id => mw_server.id)
      expect(assigns(:flash_array)).to eq(
        [{:message => "Unable to locate all reports in database, please try again.", :level => :error}]
      )
    end
  end

  describe '#report_data' do
    context 'list of middleware servers' do
      let!(:server) { FactoryGirl.create(:middleware_server) }

      subject { assert_report_data_response }

      it 'returns a single middleware server that has an image but not an icon' do
        report_data_request(:model => 'MiddlewareServer', :explorer => false)

        expect(subject["data"]["rows"].length).to eq(1)
        expect(subject["data"]["rows"][0]["cells"][2]["text"]).to eq(server.name)
        expect(subject["data"]["rows"][0]["cells"][1]["icon"]).not_to be_nil
      end
    end
  end
end
