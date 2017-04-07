shared_examples 'TopologyController' do |klass|
  render_views

  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
  end

  shared_examples 'a topology screen' do
    it 'renders topology template' do
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
      expect(response).to render_template('shared/topology')
    end
  end

  it 'redirects index to show' do
    get :index

    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show')
  end

  context 'provider id set' do
    let(:obj) { FactoryGirl.create(klass) }

    before { get :show, :params => { :id => obj.id } }

    it_behaves_like 'a topology screen'
  end

  context 'provider id not set' do
    before { get :show }

    it_behaves_like 'a topology screen'
  end
end
