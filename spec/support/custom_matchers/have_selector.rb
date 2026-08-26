require "nokogiri"

# Nokogiri-based replacements for Capybara's have_selector, have_text,
# have_xpath, and have_link matchers.  These operate on plain HTML strings
# (the value of `rendered` or `response.body` in view/controller specs).

def parse_html(fragment)
  Nokogiri::HTML(fragment.to_s)
end

RSpec::Matchers.define :have_selector do |selector, options = {}|
  match do |html|
    doc = parse_html(html)
    nodes = doc.css(selector)
    if options[:text]
      text_filter = options[:text]
      nodes = nodes.select { |n| n.text.include?(text_filter.to_s) }
    end
    nodes.any?
  end

  failure_message do |html|
    "expected to find CSS selector #{selector.inspect}#{" with text #{options[:text].inspect}" if options[:text]} in:\n#{html}"
  end

  failure_message_when_negated do |html|
    "expected not to find CSS selector #{selector.inspect}#{" with text #{options[:text].inspect}" if options[:text]} in:\n#{html}"
  end
end

RSpec::Matchers.define :have_text do |text|
  match do |html|
    parse_html(html).text.include?(text.to_s)
  end

  failure_message do |html|
    "expected to find text #{text.inspect} in:\n#{html}"
  end

  failure_message_when_negated do |html|
    "expected not to find text #{text.inspect} in:\n#{html}"
  end
end

RSpec::Matchers.define :have_xpath do |xpath, options = {}|
  match do |html|
    doc = parse_html(html)
    nodes = doc.xpath(xpath)
    if options[:text]
      text_filter = options[:text]
      nodes = nodes.select do |n|
        if text_filter.kind_of?(Regexp)
          n.text.match?(text_filter)
        else
          n.text.include?(text_filter.to_s)
        end
      end
    end
    nodes.any?
  end

  failure_message do |html|
    "expected to find XPath #{xpath.inspect}#{" with text #{options[:text].inspect}" if options[:text]} in:\n#{html}"
  end

  failure_message_when_negated do |html|
    "expected not to find XPath #{xpath.inspect}#{" with text #{options[:text].inspect}" if options[:text]} in:\n#{html}"
  end
end

RSpec::Matchers.define :have_link do |text|
  match do |html|
    doc = parse_html(html)
    doc.css("a").any? { |n| n.text.include?(text.to_s) }
  end

  failure_message do |html|
    "expected to find a link with text #{text.inspect} in:\n#{html}"
  end

  failure_message_when_negated do |html|
    "expected not to find a link with text #{text.inspect} in:\n#{html}"
  end
end
