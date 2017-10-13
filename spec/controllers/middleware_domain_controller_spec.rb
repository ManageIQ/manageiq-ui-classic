describe MiddlewareDomainController do
  render_views

  let!(:user) { stub_user(:features => :all) }

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    let(:domain) { FactoryGirl.create(:hawkular_middleware_domain, :properties => {}) }
    let(:server_group) do
      FactoryGirl.create(:hawkular_middleware_server_group, :properties        => {},
                                                            :middleware_domain => domain)
    end

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :params => { :id => domain.id } }

    context 'render' do
      render_views

      it 'display textual groups' do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end

      it 'display listnav partial' do
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_domain')
      end

      it 'show associated server_group entities' do
        assert_nested_list(domain, [server_group], 'middleware_server_groups', 'All Middleware Server Groups')
      end
    end
  end

  describe 'domain operations:' do
    let(:ems) { FactoryGirl.create(:ems_hawkular) }
    let(:mw_domain) do
      FactoryGirl.create(
        :hawkular_middleware_domain,
        :ext_management_system => ems,
        :ems_ref               => '/t;hawkular/f;master.Unnamed%20Domain/r;Local~~/r;Local~%2Fhost%3Dmaster'
      )
    end

    before(:each) do
      MiqServer.seed
    end

    it 'stop operation should create timeline event' do
      allow(controller).to receive(:trigger_mw_operation)

      post :button, :params => {
        :id      => mw_domain.id,
        :pressed => :middleware_domain_stop
      }

      # Simulate queue delivery, and test that the event has been placed in the timeline
      MiqQueue.last.deliver
      event = EmsEvent.last
      expect(event.ems_id).to eq(ems.id)
      expect(event.source).to eq('EVM')
      expect(event.event_type).to eq('MwDomain.Stop.UserRequest')
      expect(event.middleware_domain_id).to eq(mw_domain.id)
      expect(event.middleware_domain_name).to eq(mw_domain.name)
      expect(event.username).to eq(user.userid)
    end
  end
end
