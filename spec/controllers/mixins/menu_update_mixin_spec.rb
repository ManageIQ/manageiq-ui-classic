RSpec.configure do |c|
  c.infer_base_class_for_anonymous_controllers = false
end

describe Mixins::MenuUpdateMixin do
  context 'when included by a controller', :type => :controller do
    controller do
      include Mixins::MenuUpdateMixin
    end

    before do
      session[:tab_url] = {:vi => '/url/before'}
    end

    it "updates session[:tab_url]" do
      controller.params = {:section => :vi, :url => '/url/after%26'}
      controller.send(:menu_section_url)
      expect(session[:tab_url][:vi]).to eq('/url/after&')
    end
  end
end
