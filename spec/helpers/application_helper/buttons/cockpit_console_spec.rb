describe ApplicationHelper::Button::CockpitConsole do
  describe '#disabled?' do
    before do
      @record = FactoryBot.create(:vm)

      allow(@record).to receive(:platform).and_return('linux')
      allow(@record).to receive(:power_state).and_return('on')
    end

    let(:view_context) { setup_view_context_with_sandbox({}) }
    let(:button) { described_class.new(view_context, {}, {:record => @record}, {}) }

    context 'passes checks' do
      before do
        MiqServer.first.update!(:status => "started")
        server_role = ServerRole.find_by(:name => 'cockpit_ws')
        FactoryBot.create(
          :assigned_server_role,
          :miq_server_id  => MiqServer.first.id,
          :server_role_id => server_role.id,
          :active         => true,
          :priority       => 1
        )
      end

      it 'returns false' do
        expect(button.disabled?).to be false
      end
    end

    context 'returns true and disables button' do
      context 'when cockpit_ws role' do
        it 'is disabled' do
          expect(button.disabled?).to be true
        end
      end

      context 'when power_state' do
        it "is not 'on'" do
          allow(@record).to receive(:power_state).and_return('unknown')
          expect(button.disabled?).to be true
        end
      end

      context 'when platform' do
        it 'is Windows' do
          allow(@record).to receive(:platform).and_return('windows')
          expect(button.disabled?).to be true
        end
      end
    end
  end
end
