require 'routing/shared_examples'

describe PlanningController do
  let(:controller_name) { 'planning' }

  describe '#index' do
    it 'routes with GET' do
      expect(get('/planning')).to route_to('planning#index')
    end
  end

  describe '#report_download' do
    it 'routes with GET' do
      expect(get('/planning/report_download')).to route_to('planning#report_download')
    end
  end

  describe '#change_tab' do
    it 'routes with POST' do
      expect(post('/planning/change_tab')).to route_to('planning#change_tab')
    end
  end

  describe '#option_changed' do
    it 'routes with POST' do
      expect(post('/planning/option_changed')).to route_to('planning#option_changed')
    end
  end

  describe '#plan' do
    it 'routes with POST' do
      expect(post('/planning/plan')).to route_to('planning#plan')
    end
  end

  describe '#reset' do
    it 'routes with POST' do
      expect(post('/planning/reset')).to route_to('planning#reset')
    end
  end

  describe '#wait_for_task' do
    it 'routes with POST' do
      expect(post('/planning/wait_for_task')).to route_to('planning#wait_for_task')
    end
  end
end
