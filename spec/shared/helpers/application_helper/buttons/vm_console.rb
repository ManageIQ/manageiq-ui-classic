require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::VmConsole#visible?' do |options|
  let(:remote_console_type) { options[:console_type] }
  before { stub_settings(:server => {:remote_console_type => remote_console_type}) }

  context "when console supports #{options[:console_type]}" do
    options[:support_of_records].each do |type, support|
      context "and record is type of #{type}" do
        let(:record) { FactoryGirl.create(type) }
        it { expect(subject.visible?).to eq(support) }
      end
    end
  end
  context "when console does not support #{options[:console_type]}" do
    let(:remote_console_type) { "NOT_#{options[:console_type]}" }
    include_examples 'ApplicationHelper::Button::Basic hidden'
  end
end

shared_examples 'ApplicationHelper::Button::VmConsole power state' do |options|
  context 'when record.current_state == on' do
    let(:power_state) { 'on' }
    include_examples 'ApplicationHelper::Button::Basic enabled'
  end
  context 'when record.current_state == off' do
    let(:power_state) { 'off' }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     :error_message => options[:error_message]
  end
end
