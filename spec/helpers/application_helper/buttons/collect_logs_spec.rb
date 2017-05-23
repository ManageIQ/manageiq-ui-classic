require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::CollectLogs do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:file_depot) { FactoryGirl.create(:file_depot) }
  let(:record) { FactoryGirl.create(:miq_server, :status => server_status, :log_file_depot => file_depot) }

  def tear_down
    LogFile.delete_all
    MiqTask.delete_all
  end

  describe '#calculate_properties' do
    let(:setup_log_files) {}
    let(:setup_tasks) {}
    before(:each) do
      setup_log_files
      setup_tasks
      subject.calculate_properties
    end
    after(:each) { tear_down }

    context 'when server is started' do
      let(:server_status) { 'started' }
      let(:setup_log_files) do
        log_file = FactoryGirl.create(:log_file, :resource => record, :state => log_state)
        log_file.save
        record.log_files << log_file
      end

      context 'and log collection is not yet in progress' do
        let(:log_state) { 'not_collecting' }
        context 'and Log Depot settings is configured' do
          include_examples 'ApplicationHelper::Button::Basic enabled'
        end
        context 'and Log Depot settings is not configured' do
          let(:file_depot) { nil }
          include_examples 'ApplicationHelper::Button::Basic disabled',
                           :error_message => 'Log collection requires the Log Depot settings to be configured'
        end
      end
      context 'and log collection is currently in progress' do
        let(:log_state) { 'collecting' }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'Log collection is already in progress for this Server'

        context 'and has an unfinished task' do
          let(:setup_tasks) do
            task = FactoryGirl.create(:miq_task, :name => 'Zipped log retrieval for XXX', :miq_server_id => record.id)
            task.save
          end
          include_examples 'ApplicationHelper::Button::Basic disabled',
                           :error_message => 'Log collection is already in progress for this Server'
        end
      end
    end
    context 'when server is not started' do
      let(:server_status) { 'not_responding' }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'Cannot collect current logs unless the Server is started'
    end
  end
end
