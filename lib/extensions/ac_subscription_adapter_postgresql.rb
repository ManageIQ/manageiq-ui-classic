module ActionCableSubscriptionAdapterPostgresqlPatch
  def with_subscriptions_connection(&block) # :nodoc:
    # Action Cable is taking ownership over this database connection, and will
    # perform the necessary cleanup tasks.
    # We purposely avoid #checkout to not end up with a pinned connection
    ar_conn = ActiveRecord::Base.connection_pool.send(:new_connection)
    pg_conn = ar_conn.raw_connection

    verify!(pg_conn)

    pg_conn.exec("SET application_name = #{pg_conn.escape_identifier(identifier)}")
    yield pg_conn
  ensure
    ar_conn&.disconnect!
  end
end

# https://www.github.com/rails/rails/pull/53891 and https://www.github.com/rails/rails/issues/53883
# Backported to 7-2-stable in https://github.com/rails/rails/commit/3e6e684c259e139db22f471069cd2cc0720d4bb4
# Not yet released.
ActiveSupport.on_load(:action_cable) do
  if ActionCable.version >= Gem::Version.new("7.2.3")
    message = "Patching ActionCable::SubscriptionAdapter::PostgreSQL - this is no longer needed in Rails 7.2.3 or newer! See: #{__FILE__}"
    Rails.logger.warn(message)
    message = "\e[33m#{message}\e[0m" if $stdout.tty?
    warn(message)
  end
  ActionCable::SubscriptionAdapter::PostgreSQL.prepend(ActionCableSubscriptionAdapterPostgresqlPatch)
end
