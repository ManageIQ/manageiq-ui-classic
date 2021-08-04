describe ApplicationHelper::Button::ZoneCollectLogs do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:file_depot) { FactoryBot.create(:file_depot) }
  let(:record) { FactoryBot.create(:zone, :log_file_depot => file_depot) }
  let(:miq_server) { FactoryBot.create(:miq_server, :status => server_status) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  def tear_down
    MiqTask.delete_all
    MiqServer.delete_all
  end

  describe '#calculate_properties' do
    let(:setup_log_files) {}
    let(:setup_tasks) {}
    let(:log_state) { 'not_collecting' }
    before do
      setup_log_files
      setup_tasks
      record.miq_servers << miq_server
      button.calculate_properties
    end
    after(:each) { tear_down }

    context 'when some miq_servers are started' do
      let(:server_status) { 'started' }
      let(:setup_log_files) do
        log_file = FactoryBot.create(:log_file, :resource => record, :state => log_state)
        log_file.save
        miq_server.log_files << log_file
      end

      context 'and Log Depot settings is configured' do
        context 'and log collection is not yet in progress' do
          it_behaves_like 'an enabled button'
        end
        context 'and log collection is currently in progress' do
          let(:log_state) { 'collecting' }
          it_behaves_like 'a disabled button',
                          'Log collection is already in progress for one or more Servers in this Zone'

          context 'and has an unfinished task' do
            let(:setup_tasks) do
              task = FactoryBot.create(:miq_task, :name => 'Zipped log retrieval for XXX', :miq_server_id => record.id)
              task.save
            end
            it_behaves_like 'a disabled button',
                            'Log collection is already in progress for one or more Servers in this Zone'
          end
        end
      end
      context 'and Log Depot settings is not configured' do
        let(:file_depot) { nil }
        it_behaves_like 'a disabled button',
                        'This Zone do not have Log Depot settings configured, collection not allowed'
      end
    end
    context 'when there is no miq_server started' do
      let(:server_status) { 'not_responding' }
      it_behaves_like 'a disabled button', 'Cannot collect current logs unless there are started Servers in the Zone'
    end
  end
end
