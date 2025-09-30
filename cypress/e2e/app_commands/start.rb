if defined?(DatabaseCleaner)
  DatabaseCleaner.start
else
  msg = "XXX DatabaseCleaner not defined, can't start!!!"
  logger.warn(msg)
  raise msg
end
puts "DatabaseCleaner started"
