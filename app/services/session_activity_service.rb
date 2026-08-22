class SessionActivityService
  # Key prefix for storing session activity data in memcache
  SESSION_ACTIVITY_PREFIX = "user_activity:".freeze

  # Class variables to cache the Dalli client instance
  @@dalli_client = nil
  @@dalli_client_mutex = Mutex.new

  # Get the last transaction time for a user
  # @param user_id [String, Integer] The user ID
  # @return [Time, nil] The last transaction time or nil if not found
  def self.get_last_transaction_time(user_id)
    return nil unless user_id

    value = dalli_client.get(activity_key(user_id))
    value ? Time.parse(value) : nil
  end

  # Update the last transaction time for a user
  # @param user_id [String, Integer] The user ID
  # @param time [Time] The time to set (defaults to current time)
  def self.update_last_transaction_time(user_id, time = Time.current)
    return unless user_id

    dalli_client.set(activity_key(user_id), time.iso8601, ttl)
  end

  # Check if a user session is active based on last transaction time
  # @param user_id [String, Integer] The user ID
  # @return [Boolean] True if the session is active, false otherwise
  def self.session_active?(user_id)
    last_time = get_last_transaction_time(user_id)
    return false unless last_time

    Time.current - last_time <= ::Settings.session.timeout
  end

  # Generate the key for storing user activity data
  # @param user_id [String, Integer] The user ID
  # @return [String] The key for memcache
  def self.activity_key(user_id)
    "#{SESSION_ACTIVITY_PREFIX}#{user_id}"
  end

  # Get a cached Dalli client for interacting with memcache
  # Thread-safe implementation using a mutex to ensure only one client is created
  # @return [Dalli::Client] A configured Dalli client
  def self.dalli_client
    # Return the cached client if it exists
    return @@dalli_client if @@dalli_client

    # Use a mutex to ensure thread safety when creating the client
    @@dalli_client_mutex.synchronize do
      # Check again inside the mutex in case another thread created the client
      return @@dalli_client if @@dalli_client

      require 'dalli'
      options = {
        :namespace => "MIQ:USER_ACTIVITY",
        :expires_in => ttl
      }

      @@dalli_client = MiqMemcached.client(options)
    end

    @@dalli_client
  end

  # Get the TTL for user activity data
  # @return [Integer] The TTL in seconds
  def self.ttl
    # Set TTL to double the session timeout to ensure we keep the data
    # long enough for proper timeout detection
    (::Settings.session.timeout * 2).to_i
  end

  private_class_method :activity_key, :dalli_client, :ttl
end
