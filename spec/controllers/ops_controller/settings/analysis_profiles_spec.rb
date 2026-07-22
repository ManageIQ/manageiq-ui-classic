describe OpsController do
  before do
    allow(controller).to receive(:assert_privileges)
  end

  describe '#ap_form_data' do
    context 'GET — loading an existing profile' do
      let!(:scan) { FactoryBot.create(:scan_item_set, :name => 'My Profile', :mode => 'Vm') }

      it 'returns JSON with the profile data' do
        controller.params = {:id => scan.id.to_s}
        allow(controller).to receive(:find_record_with_rbac).and_return(scan)
        allow(scan).to receive(:members).and_return([])
        allow(controller.request).to receive(:post?).and_return(false)

        expect(controller).to receive(:render).with(
          :json => hash_including(:name => 'My Profile', :scan_mode => 'Vm')
        )

        controller.send(:ap_form_data)
      end
    end

    context 'GET — new profile' do
      it 'returns empty JSON defaults' do
        controller.params = {:id => 'new', :scan_mode => 'Host'}
        allow(controller.request).to receive(:post?).and_return(false)

        expect(controller).to receive(:render).with(
          :json => hash_including(:name => '', :scan_mode => 'Host')
        )

        controller.send(:ap_form_data)
      end
    end

    context 'POST — saving a new profile' do
      let(:form_data) do
        {
          :name        => 'Name1',
          :description => 'Test description',
          :scan_mode   => 'Vm',
          :file        => [{'target' => '/tmp/test', 'content' => true}]
        }.to_json
      end

      it 'renders a success JSON response' do
        controller.params = {:id => 'new', :form_data => form_data}
        allow(controller.request).to receive(:post?).and_return(true)

        expect(controller).to receive(:render).with(
          :json => hash_including(:success => true, :message => 'Analysis Profile "Name1" was saved', :id => kind_of(Integer))
        )

        controller.send(:ap_form_data)
      end
    end

    context 'POST — saving without a name' do
      let(:form_data) { {:scan_mode => 'Vm', :file => [{'target' => '/tmp/test', 'content' => true}]}.to_json }

      it 'renders 422 with an error' do
        controller.params = {:id => 'new', :form_data => form_data}
        allow(controller.request).to receive(:post?).and_return(true)

        expect(controller).to receive(:render).with(:json => {:error => 'Name is required'}, :status => 422)

        controller.send(:ap_form_data)
      end
    end

    context 'POST — saving without any scan items' do
      let(:form_data) { {:name => 'Name1', :scan_mode => 'Vm'}.to_json }

      it 'renders 422 with an error' do
        controller.params = {:id => 'new', :form_data => form_data}
        allow(controller.request).to receive(:post?).and_return(true)

        expect(controller).to receive(:render).with(
          :json   => {:error => 'At least one item must be entered to create Analysis Profile'},
          :status => 422
        )

        controller.send(:ap_form_data)
      end
    end
  end

  describe '#ap_edit' do
    before do
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:replace_right_cell)
    end

    it 'sets up a new Vm profile and renders the explorer cell' do
      controller.params = {:typ => 'Vm'}

      controller.send(:ap_edit)

      expect(assigns(:in_a_form)).to be(true)
      expect(assigns(:scan)).to be_a(ScanItemSet)
      expect(assigns(:scan).mode).to eq('Vm')
    end

    it 'sets up a new Host profile' do
      controller.params = {:typ => 'Host'}

      controller.send(:ap_edit)

      expect(assigns(:scan).mode).to eq('Host')
    end
  end
end
