describe PrivilegeCheckerService do
  let(:service) { described_class.new }
  let(:user) { double("User", :id => 123, :super_admin_user? => false) }
  let(:session) { {} }
  let(:server) { double("MiqServer", :logon_status => :ready) }

  before do
    allow(MiqServer).to receive(:my_server).and_return(server)
  end

  describe '#valid_session?' do
    context 'when user is signed in' do
      context 'when session is active' do
        before do
          allow(SessionActivityService).to receive(:session_active?).with(user.id).and_return(true)
        end

        it 'returns true when server is ready' do
          expect(service.valid_session?(session, user)).to be true
        end

        it 'returns true when user is super admin' do
          allow(user).to receive(:super_admin_user?).and_return(true)
          allow(server).to receive(:logon_status).and_return(:not_ready)

          expect(service.valid_session?(session, user)).to be true
        end

        it 'returns false when server is not ready' do
          allow(server).to receive(:logon_status).and_return(:not_ready)

          expect(service.valid_session?(session, user)).to be false
        end
      end

      context 'when session is not active' do
        before do
          allow(SessionActivityService).to receive(:session_active?).with(user.id).and_return(false)
        end

        it 'returns false' do
          expect(service.valid_session?(session, user)).to be false
        end
      end
    end

    context 'when user is not signed in' do
      it 'returns false' do
        expect(service.valid_session?(session, nil)).to be false
      end
    end
  end

  describe '#user_session_timed_out?' do
    context 'when user is signed in' do
      it 'returns true when session is not active' do
        allow(SessionActivityService).to receive(:session_active?).with(user.id).and_return(false)

        expect(service.user_session_timed_out?(session, user)).to be true
      end

      it 'returns false when session is active' do
        allow(SessionActivityService).to receive(:session_active?).with(user.id).and_return(true)

        expect(service.user_session_timed_out?(session, user)).to be false
      end
    end

    context 'when user is not signed in' do
      it 'returns false' do
        expect(service.user_session_timed_out?(session, nil)).to be false
      end
    end
  end
end
