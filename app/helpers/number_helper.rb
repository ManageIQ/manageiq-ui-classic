module NumberHelper
  def number_to_human_size(number, *args)
    options = args.extract_options!.reverse_merge(:significant => false, :precision => 1)
    NumberHelper.handling_negatives(number) do |num|
      super(num, options)
    end
  end

  # Converts "1 MB" to "1.megabytes"
  def human_size_to_rails_method(size)
    s = size.dup
    if size.ends_with?(" Byte")
      s[-5..-1] = ""
    elsif size.ends_with?(" Bytes")
      s[-6..-1] = ""
    elsif size.ends_with?(" KB")
      s[-3..-1] = ".kilobytes"
    elsif size.ends_with?(" MB")
      s[-3..-1] = ".megabytes"
    elsif size.ends_with?(" GB")
      s[-3..-1] = ".gigabytes"
    elsif size.ends_with?(" TB")
      s[-3..-1] = ".terabytes"
    elsif size.ends_with?(" PB")
      s[-3..-1] = ".petabytes"
    end
    s
  rescue
    nil
  end

  # Converts in a similar manner as number_to_human_size, but in units of MHz
  def mhz_to_human_size(size, *args)
    precision = args.first
    precision = precision[:precision] if precision.kind_of?(Hash)
    precision ||= 1

    NumberHelper.handling_negatives(size) do |s|
      s = s.abs * (1000**2)
      if s < 1000**3
        "%.#{precision}f MHz" % (s / (1000**2))
      elsif s < 1000**4
        "%.#{precision}f GHz" % (s / (1000**3))
      else
        "%.#{precision}f THz" % (s / (1000**4))
      end.sub(".%0#{precision}d" % 0, '')
    end
  rescue
    nil
  end

  def self.handling_negatives(number)
    return nil if number.nil?

    number = Float(number)
    is_negative = number.negative?
    ret = yield number.abs
    ret.insert(0, "-") if is_negative
    ret
  end
end
