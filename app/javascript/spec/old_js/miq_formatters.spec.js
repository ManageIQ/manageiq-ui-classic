require('../helpers/miq_formatters_helper.js');

describe('ManageIQ.charts.formatters', () => {
  describe('curried/uncurried', () => {
    var options = {
      description: 'Number (1,234)',
      name: 'number_with_delimiter',
      delimiter: ",",
      precision: 0,
    };

    it('foo(val, opt)', () => {
      var fn = ManageIQ.charts.formatters[options.name];
      expect(fn(1234, options)).toEqual('1,234');
    });

    it('foo.c3(opt)(val)', () => {
      var fn = ManageIQ.charts.formatters[options.name].c3(options);
      expect(fn(1234)).toEqual('1,234');
    });
  });

  describe('.number_with_delimiter', () => {
    it('Number (1,234)', () => {
      var options = {
        description: 'Number (1,234)',
        name: 'number_with_delimiter',
        delimiter: ",",
        precision: 0,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1234, options)).toEqual('1,234');
    });

    it('Number (1,234.0)', () => {
      var options = {
        description: 'Number (1,234.0)',
        name: 'number_with_delimiter',
        delimiter: ",",
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1234, options)).toEqual('1,234.0');
    });

    it('Number, 2 Decimals (1,234.00)', () => {
      var options = {
        description: 'Number, 2 Decimals (1,234.00)',
        name: 'number_with_delimiter',
        delimiter: ",",
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1234, options)).toEqual('1,234.00');
    });

    it('Kilobytes per Second (10 KBps)', () => {
      var options = {
        description: 'Kilobytes per Second (10 KBps)',
        name: 'number_with_delimiter',
        delimiter: ",",
        suffix: " KBps",
        precision: 0,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(10, options)).toEqual('10 KBps');
    });

    it('Percentage (99%)', () => {
      var options = {
        description: 'Percentage (99%)',
        name: 'number_with_delimiter',
        delimiter: ",",
        suffix: '%',
        precision: 0,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(99, options)).toEqual('99%');
    });

    it('Percent, 1 Decimal (99.0%)', () => {
      var options = {
        description: 'Percent, 1 Decimal (99.0%)',
        name: 'number_with_delimiter',
        delimiter: ",",
        suffix: '%',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(99, options)).toEqual('99.0%');
    });

    it('Percent, 2 Decimals (99.00%)', () => {
      var options = {
        description: 'Percent, 2 Decimals (99.00%)',
        name: 'number_with_delimiter',
        delimiter: ",",
        suffix: '%',
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(99, options)).toEqual('99.00%');
    });
  });

  describe('.currency_with_delimiter', () => {
    it('Currency, 2 Decimals ($1,234.00)', () => {
      var options = {
        description: 'Currency, 2 Decimals ($1,234.00)',
        name: 'currency_with_delimiter',
        delimiter: ",",
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1234, options)).toEqual('$1,234.00');
    });
  });

  describe('.bytes_to_human_size', () => {
    it('Suffixed Bytes (B, KB, MB, GB)', () => {
      var options = {
        description: 'Suffixed Bytes (B, KB, MB, GB)',
        name: 'bytes_to_human_size',
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(123, options)).toEqual('123 B');
    });
  });

  describe('.bytes_to_human_size', () => {
    it('Suffixed Bytes (B, KB, MB, GB)', () => {
      var options = {
        description: 'Suffixed Bytes (B, KB, MB, GB)',
        name: 'bytes_to_human_size',
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1234, options)).toEqual('1.21 KiB');
    });
  });

  describe('.kbytes_to_human_size', () => {
    it('Suffixed Kilobytes (KB, MB, GB)', () => {
      var options = {
        description: 'Suffixed Kilobytes (KB, MB, GB)',
        name: 'kbytes_to_human_size',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(234, options)).toEqual('234 KiB');
    });
  });

  describe('.kbytes_to_human_size', () => {
    it('Suffixed Kilobytes (KB, MB, GB)', () => {
      var options = {
        description: 'Suffixed Kilobytes (KB, MB, GB)',
        name: 'kbytes_to_human_size',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(234.09, options)).toEqual('234.1 KiB');
    });
  });

  describe('.mbytes_to_human_size', () => {
    it('Suffixed Megabytes (MB, GB)', () => {
      var options = {
        description: 'Suffixed Megabytes (MB, GB)',
        name: 'mbytes_to_human_size',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(2, options)).toEqual('2 MiB');
    });
  });

  describe('.mbytes_to_human_size', () => {
    it('Suffixed Megabytes (MB, GB)', () => {
      var options = {
        description: 'Suffixed Megabytes (MB, GB)',
        name: 'mbytes_to_human_size',
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(2, options)).toEqual('2 MiB');
    });
  });

  describe('.mbytes_to_human_size', () => {
    it('Suffixed Megabytes (MB, GB)', () => {
      var options = {
        description: 'Suffixed Megabytes (MB, GB)',
        name: 'mbytes_to_human_size',
        precision: 2,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(2.12, options)).toEqual('2.12 MiB');
    });
  });

  describe('.gbytes_to_human_size', () => {
    it('Suffixed Gigabytes (GB)', () => {
      var options = {
        description: 'Suffixed Gigabytes (GB)',
        name: 'gbytes_to_human_size',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(0.1, options)).toEqual('102.4 MiB');
    });
  });

  describe('.gbytes_to_human_size', () => {
    it('Suffixed Gigabytes (GB)', () => {
      var options = {
        description: 'Suffixed Gigabytes (GB)',
        name: 'gbytes_to_human_size',
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1.19, options)).toEqual('1.2 GiB');
    });
  });

  describe('.mhz_to_human_size', () => {
    it('Megahertz (12 Mhz)', () => {
      var options = {
        description: 'Megahertz (12 Mhz)',
        name: 'mhz_to_human_size',
        delimiter: ",",
        precision: 0,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(12.1, options)).toEqual('12 MHz');
    });

    it('Megahertz Avg (12.1 Mhz)', () => {
      var options = {
        description: 'Megahertz Avg (12.1 Mhz)',
        name: 'mhz_to_human_size',
        delimiter: ",",
        precision: 1,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(12.1, options)).toEqual('12.1 MHz');
    });
  });

  describe('.boolean', () => {
    it('Boolean (True/False)', () => {
      var options = {
        description: 'Boolean (True/False)',
        name: 'boolean',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(true, options)).toEqual('True');
      expect(fn(false, options)).toEqual('False');
    });

    it('Boolean (T/F)', () => {
      var options = {
        description: 'Boolean (T/F)',
        name: 'boolean',
        format: 't_f',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(true, options)).toEqual('T');
      expect(fn(false, options)).toEqual('F');
    });

    it('Boolean (Yes/No)', () => {
      var options = {
        description: 'Boolean (Yes/No)',
        name: 'boolean',
        format: 'yes_no',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(true, options)).toEqual('Yes');
      expect(fn(false, options)).toEqual('No');
    });

    it('Boolean (Y/N)', () => {
      var options = {
        description: 'Boolean (Y/N)',
        name: 'boolean',
        format: 'y_n',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(true, options)).toEqual('Y');
      expect(fn(false, options)).toEqual('N');
    });

    it('Boolean (Pass/Fail)', () => {
      var options = {
        description: 'Boolean (Pass/Fail)',
        name: 'boolean',
        format: 'pass_fail',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(true, options)).toEqual('Pass');
      expect(fn(false, options)).toEqual('Fail');
    });
  });

  describe('.datetime', () => {
    it('Date (M/D/YYYY)', () => {
      var options = {
        description: 'Date (M/D/YYYY)',
        name: 'datetime',
        format: "%m/%d/%Y",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('03/14/2015');
    });

    it('Date (M/D/YY)', () => {
      var options = {
        description: 'Date (M/D/YY)',
        name: 'datetime',
        format: "%m/%d/%y",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('03/14/15');
    });

    it('Date (M/D)', () => {
      var options = {
        description: 'Date (M/D)',
        name: 'datetime',
        format: "%m/%d",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('03/14');
    });

    it('Time (HM:S Z)', () => {
      var options = {
        description: 'Time (H:M:S Z) ',
        name: 'datetime',
        format: "%H:%M %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('11:22 UTC');
    });

    it('Date/Time (M/D/Y HM:S Z)', () => {
      var options = {
        description: 'Date/Time (M/D/Y H:M:S Z)',
        name: 'datetime',
        format: "%m/%d/%y %H:%M:%S %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('03/14/15 11:22:05 UTC');
    });

    it('Date/Hour (M/D/Y H:00 Z)', () => {
      var options = {
        description: 'Date/Hour (M/D/Y H:00 Z)',
        name: 'datetime',
        format: "%m/%d/%y %H:00 %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('03/14/15 11:00 UTC');
    });

    it('Date/Hour (M/D/Y H AM|PM Z)', () => {
      var options = {
        description: 'Date/Hour (M/D/Y H AM|PM Z)',
        name: 'datetime',
        format: "%m/%d/%y %I %p %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('03/14/15 11 AM UTC');
    });

    it('Hour (H:00 Z)', () => {
      var options = {
        description: 'Hour (H:00 Z)',
        name: 'datetime',
        format: "%H:00 %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('11:00 UTC');
    });

    it('Hour (H AM|PM Z)', () => {
      var options = {
        description: 'Hour (H AM|PM Z)',
        name: 'datetime',
        format: "%l %p %Z",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(moment.utc('2015-03-14T11:22:05Z'), options)).toEqual('11 AM UTC');
    });

    it('Hour of Day (24)', () => {
      var options = {
        description: 'Hour of Day (24)',
        name: 'datetime',
        format: "%k",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('11');
    });

    it('Day Full (Monday)', () => {
      var options = {
        description: 'Day Full (Monday)',
        name: 'datetime',
        format: "%A",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('Saturday');
    });

    it('Day Short (Mon)', () => {
      var options = {
        description: 'Day Short (Mon)',
        name: 'datetime',
        format: "%a",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('Sat');
    });

    it('Day of Week (1)', () => {
      var options = {
        description: 'Day of Week (1)',
        name: 'datetime',
        format: "%u",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('6');
    });

    it('Day of Month (27)', () => {
      var options = {
        description: 'Day of Month (27)',
        name: 'datetime',
        format: "%e",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('14');
    });

    it('Month and Year (January 2011)', () => {
      var options = {
        description: 'Month and Year (January 2011)',
        name: 'datetime',
        format: "%B %Y",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('March 2015');
    });

    it('Month and Year Short (Jan 11)', () => {
      var options = {
        description: 'Month and Year Short (Jan 11)',
        name: 'datetime',
        format: "%b %y",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('Mar 15');
    });

    it('Month Full (January)', () => {
      var options = {
        description: 'Month Full (January)',
        name: 'datetime',
        format: "%B",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('March');
    });

    it('Month Short (Jan)', () => {
      var options = {
        description: 'Month Short (Jan)',
        name: 'datetime',
        format: "%b",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('Mar');
    });

    it('Month of Year (12)', () => {
      var options = {
        description: 'Month of Year (12)',
        name: 'datetime',
        format: "%m",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('03');
    });

    it('Week of Year (52)', () => {
      var options = {
        description: 'Week of Year (52)',
        name: 'datetime',
        format: "%W",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('11');
    });

    it('Year (YYYY)', () => {
      var options = {
        description: 'Year (YYYY)',
        name: 'datetime',
        format: "%Y",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('2015');
    });
  });
  describe('.datetime_range', () => {
    it('Date Range (M/D/Y - M/D/Y)', () => {
      var options = {
        description: 'Date Range (M/D/Y - M/D/Y)',
        name: 'datetime_range',
        format: "%m/%d/%y",
        column: 'foo__month',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('(03/01/15 - 03/31/15)');
    });

    it('Day Range (M/D - M/D)', () => {
      var options = {
        description: 'Day Range (M/D - M/D)',
        name: 'datetime_range',
        format: "%m/%d",
        column: 'foo__week',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('(03/08 - 03/14)');
    });

    it('Day Range Start (M/D)', () => {
      var options = {
        description: 'Day Range Start (M/D)',
        name: 'datetime_range',
        format: "%m/%d",
        column: 'foo__year',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 3 - 1, 14, 11, 22, 5), options)).toEqual('01/01');
    });
  });

  describe('.set', () => {
    it('Comma seperated list', () => {
      var options = {
        description: 'Comma seperated list',
        name: 'set',
        delimiter: ", ",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(['foo', 'bar', 'quux'], options)).toEqual('foo, bar, quux');
    });
  });

  describe('.datetime_ordinal', () => {
    it('Day of Month (27th)', () => {
      var options = {
        description: 'Day of Month (27th)',
        name: 'datetime_ordinal',
        format: "%e",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 7 - 1, 27, 0, 0, 0), options)).toEqual('27th');
    });

    it('Week of Year (52nd)', () => {
      var options = {
        description: 'Week of Year (52nd)',
        name: 'datetime_ordinal',
        format: "%W",
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(new Date(2015, 12 - 1, 21, 0, 0, 0), options)).toEqual('52nd');
    });
  });

  describe('.elapsed_time_human', () => {
    it('"Elapsed Time (10 Days, 0 Hours, 1 Minute, 44 Seconds)"', () => {
      var options = {
        description: '"Elapsed Time (10 Days, 0 Hours, 1 Minute, 44 Seconds)"',
        name: 'elapsed_time_human',
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(864104, options)).toEqual('10 Days, 0 Hours');
    });
  });

  describe('.string_truncate', () => {
    it('String Truncated to 50 Characters with Elipses (...)', () => {
      var options = {
        description: 'String Truncated to 50 Characters with Elipses (...)',
        name: 'string_truncate',
        length: 50,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed.', options)).toEqual('Lorem ipsum dolor sit amet, consectetur adipiscing...');
    });
  });

  describe('.large_number_to_exponential_form', () => {
    it('Convert Numbers Larger than 1.0e+15 to Exponential Form', () => {
      var options = {
        description: 'Convert Numbers Larger than 1.0e+15 to Exponential Form',
        name: 'large_number_to_exponential_form',
        length: 50,
      };
      var fn = ManageIQ.charts.formatters[options.name];

      expect(fn(1000000000000123, options)).toEqual('1.0e+15');
    });
  });
});
