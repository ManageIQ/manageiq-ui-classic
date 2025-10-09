logger.debug "[Cypress] Running db_state #{command_options}"
option = command_options.to_s.downcase
case option
when "capture"
  DatabaseCleaner.start
  logger.info "[Cypress] DatabaseCleaner started"
when "restore"
  DatabaseCleaner.clean
  CypressOnRails::SmartFactoryWrapper.reload

  if defined?(VCR)
    VCR.eject_cassette # make sure we no cassette inserted before the next test starts
    VCR.turn_off!
    WebMock.disable! if defined?(WebMock)
  end
else
  message = "Unknown db_state #{option}!"
  logger.error "[Cypress] #{message}"
  raise message
end
