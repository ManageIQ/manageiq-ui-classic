module ApplicationController::SessionSize
  extend ActiveSupport::Concern

  # Session data size logging constants
  case Rails.env
  when "test", "development"
    SESSION_LOG_THRESHOLD = 50.kilobytes
    SESSION_ELEMENT_THRESHOLD = 5.kilobytes
  else
    SESSION_LOG_THRESHOLD = 100.kilobytes
    SESSION_ELEMENT_THRESHOLD = 10.kilobytes
  end

  # Check for session threshold limits and write log messages if exceeded
  def get_data_size(data, indent = 0)
    begin
      # TODO: (FB 9144) Determine how the session store handles singleton object so it does not throw errors.
      data_size = Marshal.dump(data).size
    rescue => err
      data_size = 0
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): get_data_size error: <#{err}>\n#{err.backtrace.join("\n")}")
    end

    if indent.zero?
      if Rails.env.development?
        puts "Session:\t #{data.class.name} of Size #{data_size}, Elements #{data.size}\n================================="
      end
      return if data_size < SESSION_LOG_THRESHOLD
      msg = "Session object size of #{number_to_human_size(data_size)} exceeds threshold of #{number_to_human_size(SESSION_LOG_THRESHOLD)}"
      if Rails.env.development?
        puts "***** MIQ(#{controller_name}_controller-#{action_name}): #{msg}"
      end
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): " + msg)
    end

    if data.kind_of?(Hash) && data_size > SESSION_ELEMENT_THRESHOLD
      data.keys.sort_by(&:to_s).each do |k|
        value = data[k]
        log_data_size(k, value, indent)
        get_data_size(value, indent + 1)  if value.kind_of?(Hash) || value.kind_of?(Array)
      end
    elsif data.kind_of?(Array) && data_size > SESSION_ELEMENT_THRESHOLD
      data.each_index do |k|
        value = data[k]
        log_data_size(k, value, indent)
        get_data_size(value, indent + 1)  if value.kind_of?(Hash) || value.kind_of?(Array)
      end
    end
  end

  # Dump the entire session contents to the evm.log
  def dump_session_data(data, indent = 0)
    begin
      # TODO: (FB 9144) Determine how the session store handles singleton object so it does not throw errors.
      data_size = Marshal.dump(data).size
    rescue => err
      data_size = 0
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): dump_session error: <#{err}>\n#{err.backtrace.join("\n")}")
    end

    if indent.zero?
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): ===============BEGIN SESSION DUMP===============")
    end

    if data.kind_of?(Hash)
      data.keys.sort_by(&:to_s).each do |k|
        value = data[k]
        log_data_size(k, value, indent)
        dump_session_data(value, indent + 1) if value.kind_of?(Hash) || value.kind_of?(Array)
      end
    elsif data.kind_of?(Array)
      data.each_index do |k|
        value = data[k]
        log_data_size(k, value, indent)
        dump_session_data(value, indent + 1)  if value.kind_of?(Hash) || value.kind_of?(Array)
      end
    end

    if indent.zero?
      $log.warn("MIQ(#{controller_name}_controller-#{action_name}): ===============END SESSION DUMP===============")
    end
  end

  # Log sizes and values from get_data_size and dump_session_data methods
  def log_data_size(el, value, indent)
    indentation = "  " * indent
    if value.kind_of?(Hash) || value.kind_of?(Array) || value.kind_of?(ActiveRecord::Base) ||
       !value.respond_to?("size")
      val_size = Marshal.dump(value).size
    else
      val_size = value.size
    end
    line = "#{indentation}#{el} <#{value.class.name}> Size #{val_size}"
    line << " Elements #{value.size}"  if value.kind_of?(Hash) || value.kind_of?(Array)
    line << " ActiveRecord Object!!" if value.kind_of?(ActiveRecord::Base)
    $log.warn("MIQ(#{controller_name}_controller-#{action_name}): " + line)

    return if value.kind_of?(Hash) || value.kind_of?(Array) || value.kind_of?(ActiveRecord::Base)

    $log.debug { "Value #{value.inspect[0...2000]}" }
  end
end

