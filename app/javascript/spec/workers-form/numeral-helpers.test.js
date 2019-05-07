import { toBytes, toHumanSize, toRubyMethod } from '../../components/workers-form/helpers';

describe('Numeral helpers', () => {
  describe('toBytes', () => {
    it('Gigabytes with point number converts', () => {
      expect(toBytes('0.1.gigabytes')).toEqual(107374182.4);
    });

    it('Gigabytes number converts', () => {
      expect(toBytes('1.1.gigabytes')).toEqual(1181116006.4);
    });

    it('Megabytes converts', () => {
      expect(toBytes('500.megabytes')).toEqual(524288000);
    });

    it('Kilobytes converts', () => {
      expect(toBytes('1.21.kilobytes')).toEqual(1239.04);
    });

    it('Bytes converts', () => {
      expect(toBytes('101.bytes')).toEqual(101);
    });

    it('Return bytes when is number', () => {
      expect(toBytes(525336576)).toEqual(525336576);
    });
  });

  describe('toRuby', () => {
    it('Gigabytes with point number converts to megabytes', () => {
      expect(toRubyMethod(107374182.4)).toEqual('102.4.megabytes');
    });

    it('Gigabytes number converts', () => {
      expect(toRubyMethod(1073741824)).toEqual('1.gigabytes');
    });

    it('Megabytes converts', () => {
      expect(toRubyMethod(524288000)).toEqual('500.megabytes');
    });

    it('Kilobytes converts', () => {
      expect(toRubyMethod(1239.04)).toEqual('1.21.kilobytes');
    });

    it('Bytes converts', () => {
      expect(toRubyMethod(101)).toEqual('101.bytes');
    });

    it('Return method when is method', () => {
      expect(toRubyMethod('101.bytes')).toEqual('101.bytes');
    });
  });

  describe('toHumanSize', () => {
    it('Gigabytes with point number converts to megabytes', () => {
      expect(toHumanSize(107374182.4)).toEqual('102.4 MB');
    });

    it('Gigabytes number converts', () => {
      expect(toHumanSize(1073741824)).toEqual('1 GB');
    });

    it('Megabytes converts', () => {
      expect(toHumanSize(524288000)).toEqual('500 MB');
    });

    it('Kilobytes converts', () => {
      expect(toHumanSize(1239.04)).toEqual('1.21 KB');
    });

    it('Bytes converts', () => {
      expect(toHumanSize(101)).toEqual('101 B');
    });

    it('when is bytes method', () => {
      expect(toHumanSize('101.bytes')).toEqual('101 B');
    });

    it('when is megabytes method', () => {
      expect(toHumanSize('15.megabytes')).toEqual('15 MB');
    });

    it('when is kilobytes method', () => {
      expect(toHumanSize('1.kilobytes')).toEqual('1 KB');
    });

    it('when is gigabytes method', () => {
      expect(toHumanSize('7.7.gigabytes')).toEqual('7.7 GB');
    });
  });
});
