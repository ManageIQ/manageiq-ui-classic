describe ApplicationHelper::Button::CollectLogs do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:file_depot) { FactoryBot.create(:file_depot) }
  let(:record) { FactoryBot.create(:miq_server, :status => server_status, :log_file_depot => file_depot) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  def tear_down
    LogFile.delete_all
    MiqTask.delete_all
  end

  describe '#disabled?' do
    let(:setup_log_files) {}
    let(:setup_tasks) {}
    before do
      setup_log_files
      setup_tasks
    end
    after(:each) { tear_down }

    context 'when server is started' do
      let(:server_status) { 'started' }
      let(:setup_log_files) do
        log_file = FactoryBot.create(:log_file, :resource => record, :state => log_state)
        log_file.save
        record.log_files << log_file
      end

      context 'and log collection is not yet in progress' do
        let(:log_state) { 'not_collecting' }
        context 'and Log Depot settings is configured' do
          it_behaves_like 'an enabled button'
        end
        context 'and Log Depot settings is not configured' do
          let(:file_depot) { nil }
          it_behaves_like 'a disabled button', 'Log collection requires the Log Depot settings to be configured'
        end
      end
      context 'and log collection is currently in progress' do
        let(:log_state) { 'collecting' }
        it_behaves_like 'a disabled button', 'Log collection is already in progress for this Server'

        context 'and has an unfinished task' do
          let(:setup_tasks) do
            task = FactoryBot.create(:miq_task, :name => 'Zipped log retrieval for XXX', :miq_server_id => record.id)
            task.save
          end
          it_behaves_like 'a disabled button', 'Log collection is already in progress for this Server'
        end
      end
    end
    context 'when server is not started' do
      let(:server_status) { 'not_responding' }
      it_behaves_like 'a disabled button', 'Cannot collect current logs unless the Server is started'
    end
  end
end
