# This file is called when a cypress spec fails and allows for extra logging to be captured
filename = command_options.fetch('runnable_full_title', 'no title').gsub(/[^[:print:]]/, '')

# grab last lines until "APPCLEANED" (Make sure in clean.rb to log the text "APPCLEANED")
system "tail -n 10000 -r log/#{Rails.env}.log | sed \"/APPCLEANED/ q\" | sed 'x;1!H;$!d;x' > 'log/#{filename}.log'"
# Alternative command if the above does not work
# system "tail -n 10000 log/#{Rails.env}.log | tac | sed \"/APPCLEANED/ q\" | sed 'x;1!H;$!d;x' > 'log/#{filename}.log'"

# create a yaml debug file for server debugging
result = {}
result['error'] = command_options.fetch('error_message', 'no error message')

if defined?(ActiveRecord::Base)
  result['records'] =
    ActiveRecord::Base.descendants.each_with_object({}) do |record_class, records|
      begin
        records[record_class.to_s] = record_class.limit(100).map(&:attributes)
      rescue
      end
    end
end

filename = command_options.fetch('runnable_full_title', 'no title').gsub(/[^[:print:]]/, '')
yml_filename = Rails.root.join("log", "#{filename}.yml"
File.open(yml_filename, "w+") do |file|
  file.write(Psych.dump(result))
end
$sterr.puts ("!!! Wrote #{yml_filename}")
