describe ApplicationController::Filter do
  describe '#available_adv_searches' do
    let(:user)           { FactoryBot.create(:user) }
    let!(:user_search)   { FactoryBot.create(:miq_search_user, :search_key => user.userid) }
    let!(:user_search2)  { FactoryBot.create(:miq_search_user, :search_key => user.userid) }
    let(:expression)     { ApplicationController::Filter::Expression.new.tap { |e| e.exp_model = 'Vm' } }

    before do
      login_as user
    end

    it 'returns user searches' do
      expect(expression.available_adv_searches).to eq [
        [user_search.description,  user_search.id],
        [user_search2.description, user_search2.id]
      ]
    end

    context 'with global searches' do
      let!(:global_search)  { FactoryBot.create(:miq_search_global) }
      let!(:global_search2) { FactoryBot.create(:miq_search_global) }

      it 'returns global searches and then user searches' do
        expect(expression.available_adv_searches).to eq [
          ["Global - #{global_search.description}",  global_search.id],
          ["Global - #{global_search2.description}", global_search2.id],
          [user_search.description,                  user_search.id],
          [user_search2.description,                 user_search2.id]
        ]
      end
    end

    it 'does not include searches from other users' do
      FactoryBot.create(:miq_search_user, :search_key => -1) # A search from another "user"

      expect(expression.available_adv_searches).to eq [
        [user_search.description,  user_search.id],
        [user_search2.description, user_search2.id]
      ]
    end
  end

  context 'selected and last loaded filter' do
    let(:expression) { ApplicationController::Filter::Expression.new }
    let(:search) { FactoryBot.create(:miq_search) }

    describe '#filter_info' do
      it 'returns id, name, description and type of the search' do
        expect(expression.filter_info(search)).to eq(:id => search.id, :name => search.name, :description => search.description, :typ => search.search_type)
      end
    end

    describe '#last_loaded_filter' do
      it 'sets expression.exp_last_loaded' do
        expression.last_loaded_filter(search)
        expect(expression.exp_last_loaded).to eq(:id => search.id, :name => search.name, :description => search.description, :typ => search.search_type)
      end
    end

    describe '#select_filter' do
      it 'sets expression.selected and expression.exp_last_loaded' do
        expression.select_filter(search, true)
        expect(expression.selected).to eq(:id => search.id, :name => search.name, :description => search.description, :typ => search.search_type)
        expect(expression.exp_last_loaded).to eq(expression.selected)
      end

      it 'sets only expression.selected' do
        expression.select_filter(search)
        expect(expression.selected).to eq(:id => search.id, :name => search.name, :description => search.description, :typ => search.search_type)
        expect(expression.exp_last_loaded).to be_nil
      end
    end
  end

  describe ReportController do
    let(:expression) do
      ApplicationController::Filter::Expression.new.tap do |e|
        e.exp_model  = 'PolicyEvent'
        e.exp_typ    = 'field'
        e.exp_key    = 'BEFORE'
        e.expression = {"BEFORE" => {"field" => "PolicyEvent.miq_actions-created_on", "value" => "Today"}}
      end
    end

    describe '#update_from_expression_editor' do
      it "resets value of exp_key based upon type of field selected" do
        edit = {:record_filter => expression}
        edit[:new] = {:record_filter => {:test => "foo", :token => 1}}
        session[:edit] = edit
        controller.instance_variable_set(:@expkey, :record_filter)
        controller.params = {:chosen_field => "PolicyEvent-chain_id"}
        expect(controller).to receive(:render)
        controller.send(:exp_changed)
        expect(expression.exp_key).to eq('=')
        controller.params = {:chosen_field => "PolicyEvent.miq_actions-created_on"}
        expect(controller).to receive(:render)
        controller.send(:exp_changed)
        expect(expression.exp_key).to eq('IS')
        controller.instance_variable_set(:@expkey, :record_filter)
        controller.params = {:chosen_field => "Flavor.cloud_tenants-id"}
        expect(controller).to receive(:render)
        controller.send(:exp_changed)
        expect(expression.exp_key).to_not eq('CONTAINS')
        expect(expression.exp_key).to eq('=')
      end
    end
  end
end
