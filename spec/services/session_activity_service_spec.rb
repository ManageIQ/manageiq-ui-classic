describe SessionActivityService do
  let(:user_id) { 123 }
  let(:current_time) { Time.zone.local(2025, 10, 30, 14, 30, 0) }
  let(:mock_client) { double("Dalli::Client") }

  before do
    Timecop.freeze(current_time)
    # Reset the cached client before each test
    SessionActivityService.instance_variable_set(:@dalli_client, nil)
    # Mock the Dalli client to avoid actual memcache calls in tests
    allow(MiqMemcached).to receive(:client).and_return(mock_client)
  end

  after do
    Timecop.return
  end

  describe '.update_last_transaction_time' do
    it 'stores the current time for a user' do
      expect(mock_client).to receive(:set).with(
        "user_activity:#{user_id}",
        current_time.iso8601,
        (::Settings.session.timeout * 2).to_i
      )

      described_class.update_last_transaction_time(user_id)
    end

    it 'does nothing when user_id is nil' do
      expect(mock_client).not_to receive(:set)
      described_class.update_last_transaction_time(nil)
    end
  end

  describe '.get_last_transaction_time' do
    it 'retrieves the stored time for a user' do
      stored_time = current_time - 5.minutes
      expect(mock_client).to receive(:get).with("user_activity:#{user_id}").and_return(stored_time.iso8601)

      result = described_class.get_last_transaction_time(user_id)
      expect(result).to be_within(1.second).of(stored_time)
    end

    it 'returns nil when no time is stored' do
      expect(mock_client).to receive(:get).with("user_activity:#{user_id}").and_return(nil)

      result = described_class.get_last_transaction_time(user_id)
      expect(result).to be_nil
    end

    it 'returns nil when user_id is nil' do
      expect(mock_client).not_to receive(:get)

      result = described_class.get_last_transaction_time(nil)
      expect(result).to be_nil
    end
  end

  describe '.session_active?' do
    context 'when session is active' do
      it 'returns true when last activity is within timeout period' do
        stored_time = current_time - (::Settings.session.timeout / 2)
        allow(described_class).to receive(:get_last_transaction_time).with(user_id).and_return(stored_time)

        expect(described_class.session_active?(user_id)).to be true
      end
    end

    context 'when session is inactive' do
      it 'returns false when last activity is beyond timeout period' do
        stored_time = current_time - (::Settings.session.timeout + 1.minute)
        allow(described_class).to receive(:get_last_transaction_time).with(user_id).and_return(stored_time)

        expect(described_class.session_active?(user_id)).to be false
      end

      it 'returns false when no activity is recorded' do
        allow(described_class).to receive(:get_last_transaction_time).with(user_id).and_return(nil)

        expect(described_class.session_active?(user_id)).to be false
      end

      it 'returns false when user_id is nil' do
        expect(described_class.session_active?(nil)).to be false
      end
    end
  end
end
