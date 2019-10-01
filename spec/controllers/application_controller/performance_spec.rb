describe ApplicationController do

  describe '#skip_days_from_time_profile' do
    subject { ->(l) { described_class.new.send(:skip_days_from_time_profile, l) } }

    it 'should return empty array for whole week' do
      expect(subject.call((0..6).to_a)).to eq([])
    end

    it 'should return whole week for empty array' do
      expect(subject.call([])).to eq((1..7).to_a)
    end

    it 'should handle Sundays' do
      expect(subject.call((1..6).to_a)).to eq([7])
    end
  end

  context 'peformance charts generation' do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    describe 'perf_gen_tag_data_before_wait' do
      %w(Hourly Daily).each do |type|
        it "calls initiate_wait_for_task for '#{type}'" do
          controller.instance_variable_set(:@perf_record, FactoryBot.create(:host))
          controller.instance_variable_set(
            :@perf_options,
            :typ          => type,
            :daily_date   => '12/12/2017',
            :hourly_date  => '12/12/2017',
            :tz           => TimeProfile.rollup_daily_metrics.all_timezones.first,
            :cat          => 'foobar',
            :time_profile => 'bar'
          )
          expect(controller).to receive(:initiate_wait_for_task)
          controller.send(:perf_gen_tag_data_before_wait)
        end
      end
    end

    describe 'perf_gen_tag_data_after_wait' do
      it 'calls Classification.lookup_by_name and other specific methods' do
        task = double(:task)
        allow(task).to receive_message_chain(:miq_report_result, :report_results)
        expect(task).to receive(:destroy)

        expect(MiqTask).to receive(:find).and_return(task)

        cat = double(:cat)
        allow(cat).to receive(:description)
        expect(Classification).to receive(:lookup_by_name).with('cat').and_return(cat)

        controller.instance_variable_set(:@sb, {})
        controller.instance_variable_set(:@perf_record, FactoryBot.create(:host))
        controller.instance_variable_set(
          :@perf_options,
          :typ   => 'Hourly',
          :cat   => 'cat',
          :model => 'Host',
        )
        expect(controller).to receive(:prepare_perf_tag_chart).at_least(:once)
        expect(controller).to receive(:gen_perf_chart).at_least(:once)
        allow(controller).to receive(:perf_zoom_url)
        expect(controller).to receive(:perf_report_to_html)
        controller.send(:perf_gen_tag_data_after_wait)
      end
    end
  end
end
