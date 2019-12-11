module ApplicationController::SessionSize
  extend ActiveSupport::Concern

  # Check for session threshold limits and write log messages if exceeded
  def get_data_size(data, indent = 0)
    begin
      # TODO: (FB 9144) Determine how the session store handles singleton object so it does not throw errors.
      data_size = Marshal.dump(data).size
    rescue StandardError => err
      data_size = 0
      $log.warn(format_log_message("get_data_size error: <#{err}>\n#{err.backtrace.join("\n")}"))
    end

    if indent.zero?
      puts "Session:\t #{data.class.name} of Size #{data_size}, Elements #{data.size}\n=================================" if Rails.env.development?
      return if data_size < ::Settings.session.log_threshold.to_i_with_method

      msg = format_log_message("Session object size of #{number_to_human_size(data_size)} exceeds threshold of #{number_to_human_size(::Settings.session.log_threshold.to_i_with_method)}")
      Rails.env.development? ? puts(msg) : $log.warn(msg)
    end

    return unless data_size > ::Settings.session.element_threshold.to_i_with_method

    deep_visit_data(data, :get_data_size, indent)
  end

  def deep_visit_data(data, method, indent)
    if data.kind_of?(Hash)
      data.each { |k, v| process_pair(k, v, indent, method) }
    elsif data.kind_of?(Array)
      data.each_with_index { |v, k| process_pair(k, v, indent, method) }
    end
  end

  def process_pair(k, value, indent, method)
    log_data_size(k, value, indent)
    send(method, value, indent + 1) if value.kind_of?(Hash) || value.kind_of?(Array)
  end

  def format_log_message(message)
    "MIQ(#{controller_name}_controller-#{action_name}): #{message}"
  end

  # Dump the entire session contents to the evm.log
  def dump_session_data(data, indent = 0)
    $log.warn(format_log_message('===============BEGIN SESSION DUMP===============')) if indent.zero?
    deep_visit_data(data, :dump_session_data, indent)
    $log.warn(format_log_message('===============END SESSION DUMP===============')) if indent.zero?
  end

  # Log sizes and values from get_data_size and dump_session_data methods
  def log_data_size(el, value, indent)
    indentation = '  ' * indent
    val_size = if value.kind_of?(Hash) || value.kind_of?(Array) || value.kind_of?(ActiveRecord::Base) || !value.respond_to?("size")
                 Marshal.dump(value).size
               else
                 value.size
               end

    line = "#{indentation}#{el} <#{value.class.name}> Size #{val_size}"
    line << " Elements #{value.size}" if value.kind_of?(Hash) || value.kind_of?(Array)
    line << " ActiveRecord Object!!" if value.kind_of?(ActiveRecord::Base)
    $log.warn(format_log_message(line))

    return if value.kind_of?(Hash) || value.kind_of?(Array) || value.kind_of?(ActiveRecord::Base)

    $log.debug { "Value #{value.inspect[0...2000]}" }
  end
end
