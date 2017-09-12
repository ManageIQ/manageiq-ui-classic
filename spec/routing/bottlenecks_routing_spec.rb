require 'routing/shared_examples'

describe BottlenecksController do
  let(:controller_name) { 'bottlenecks' }

  describe '#index' do
    it 'routes with GET' do
      expect(get('/bottlenecks')).to route_to('bottlenecks#index')
    end
  end

  describe '#timeline_data' do
    it 'routes with GET' do
      expect(get('/bottlenecks/timeline_data')).to route_to('bottlenecks#timeline_data')
    end
  end

  describe '#reload' do
    it 'routes with POST' do
      expect(post('/bottlenecks/reload')).to route_to('bottlenecks#reload')
    end
  end

  describe '#tl_chooser' do
    it 'routes with POST' do
      expect(post('/bottlenecks/tl_chooser')).to route_to('bottlenecks#tl_chooser')
    end
  end

  describe '#tree_select' do
    it 'routes with POST' do
      expect(post('/bottlenecks/tree_select')).to route_to('bottlenecks#tree_select')
    end
  end

  describe '#wait_for_task' do
    it 'routes with POST' do
      expect(post('/bottlenecks/wait_for_task')).to route_to('bottlenecks#wait_for_task')
    end
  end
end
