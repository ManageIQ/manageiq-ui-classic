logger.debug "running db_state #{command_options}"
option = command_options.to_s.downcase
case option
when "capture"
  DatabaseCleaner.start
  puts "DatabaseCleaner started"
when "restore"
  DatabaseCleaner.clean
  CypressOnRails::SmartFactoryWrapper.reload

  if defined?(VCR)
    VCR.eject_cassette # make sure we no cassette inserted before the next test starts
    VCR.turn_off!
    WebMock.disable! if defined?(WebMock)
  end
else
  logger.warn "unknown db_state #{db_state}!!!"
  raise
end
