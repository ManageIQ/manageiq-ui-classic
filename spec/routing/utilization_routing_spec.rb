require 'routing/shared_examples'

describe UtilizationController do
  let(:controller_name) { 'utilization' }

  describe '#index' do
    it 'routes with GET' do
      expect(get('/utilization')).to route_to('utilization#index')
    end
  end

  describe '#report_download' do
    it 'routes with GET' do
      expect(get('/utilization/report_download')).to route_to('utilization#report_download')
    end
  end

  describe '#timeline_data' do
    it 'routes with GET' do
      expect(get('/utilization/timeline_data')).to route_to('utilization#timeline_data')
    end
  end

  describe '#change_tab' do
    it 'routes with POST' do
      expect(post('/utilization/change_tab')).to route_to('utilization#change_tab')
    end
  end

  describe '#chart_chooser' do
    it 'routes with POST' do
      expect(post('/utilization/chart_chooser')).to route_to('utilization#chart_chooser')
    end
  end

  describe '#tree_autoload' do
    it 'routes with POST' do
      expect(post('/utilization/tree_autoload')).to route_to('utilization#tree_autoload')
    end
  end

  describe '#tree_select' do
    it 'routes with POST' do
      expect(post('/utilization/tree_select')).to route_to('utilization#tree_select')
    end
  end

  describe '#wait_for_task' do
    it 'routes with POST' do
      expect(post('/utilization/wait_for_task')).to route_to('utilization#wait_for_task')
    end
  end
end
