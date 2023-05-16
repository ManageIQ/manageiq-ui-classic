module Jasmine
  class << self
    alias old_server_is_listening_on server_is_listening_on

    def server_is_listening_on(_hostname, port)
      # HACK: around Travis resolving localhost to IPv6 and failing
      old_server_is_listening_on('127.0.0.1', port)
    end
  end

  class Configuration
    alias old_initialize initialize

    def initialize
      # HACK: around Travis resolving localhost to IPv6 and failing
      @host = 'http://127.0.0.1'
      old_initialize
    end
  end
end
