describe ApplicationHelper::FormTags do
  it "#datepicker_input_tag sets correct date / time, data-provide, autoclose, date-format, date-language" do
    input = helper.datepicker_input_tag('id01', Time.at(117_036_184_5).utc)

    expect(input).to include('value="2007-02-01 20:30:45 UTC"')
    expect(input).to include('data-provide="datepicker"')
    expect(input).to include('data-date-autoclose="true"')
    expect(input).to include('data-date-format=')
    expect(input).to include('data-date-language=')
  end

  it "#datetimepicker_input_tag sets correct date / time, datetime-format" do
    input = helper.datetimepicker_input_tag('id01', Time.at(1_170_361_845).utc)

    expect(input).to include('datetimepicker="true"')
    expect(input).to include('datetime-format=')
    expect(input).to include('value="2007-02-01 20:30:45 UTC"')
  end
end
