module ManageIQ
  module UI
    module Classic
      class JsCompressor < Sprockets::UglifierCompressor
        def initialize(options = {})
          warn "\e[33m** Using #{self.class.name} with Uglifier.new(:harmony => true) from: #{__FILE__}:#{__LINE__}\e[0m"
          options[:harmony] = true
          super(options)
        end
      end
    end
  end
end
