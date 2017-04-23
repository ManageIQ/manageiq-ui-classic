require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ZoneCollectLogs do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:zone, :log_file_depot => file_depot) }
  let(:file_depot) { FactoryGirl.create(:file_depot) }
  let(:miq_server) { FactoryGirl.create(:miq_server, :status => server_status) }

  def tear_down
    LogFile.delete_all
    MiqTask.delete_all
    MiqServer.delete_all
  end

  describe '#calculate_properties' do
    let(:setup_log_files) {}
    let(:setup_tasks) {}
    let(:log_state) { 'not_collecting' }
    before(:each) do
      setup_log_files
      setup_tasks
      record.miq_servers << miq_server
      subject.calculate_properties
    end
    after(:each) { tear_down }

    context 'when some miq_servers are started' do
      let(:server_status) { 'started' }
      let(:setup_log_files) do
        log_file = FactoryGirl.create(:log_file, :resource => record, :state => log_state)
        log_file.save
        miq_server.log_files << log_file
      end

      context 'and Log Depot settings is configured' do
        context 'and log collection is not yet in progress' do
          include_examples 'ApplicationHelper::Button::Basic enabled'
        end
        context 'and log collection is currently in progress' do
          let(:log_state) { 'collecting' }
          include_examples 'ApplicationHelper::Button::Basic disabled',
                          'Log collection is already in progress for one or more Servers in this Zone'

          context 'and has an unfinished task' do
            let(:setup_tasks) do
              task = FactoryGirl.create(:miq_task, :name => 'Zipped log retrieval for XXX', :miq_server_id => record.id)
              task.save
            end
            include_examples 'ApplicationHelper::Button::Basic disabled',
                            'Log collection is already in progress for one or more Servers in this Zone'
          end
        end
      end
      context 'and Log Depot settings is not configured' do
        let(:file_depot) { nil }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                        'This Zone do not have Log Depot settings configured, collection not allowed'
      end
    end
    context 'when there is no miq_server started' do
      let(:server_status) { 'not_responding' }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       'Cannot collect current logs unless there are started Servers in the Zone'
    end
  end
end
