import {
  toBytes, toHumanSize, toRubyMethod, emptyChildren, buildPatch, generateBasicOptions, generateRefreshOptions, injectOption, generateRange,
} from '../../components/workers-form/helpers';

describe('Workers form helpers', () => {
  const firstHalf = [{ label: '200 MB', value: 209715200 },
    { label: '250 MB', value: 262144000 },
    { label: '300 MB', value: 314572800 },
    { label: '350 MB', value: 367001600 },
    { label: '400 MB', value: 419430400 },
    { label: '450 MB', value: 471859200 },
    { label: '500 MB', value: 524288000 },
    { label: '550 MB', value: 576716800 },
    { label: '600 MB', value: 629145600 },
    { label: '700 MB', value: 734003200 },
    { label: '800 MB', value: 838860800 },
    { label: '900 MB', value: 943718400 },
    { label: '1 GB', value: 1073741824 },
    { label: '1.1 GB', value: 1181116006.4 },
    { label: '1.2 GB', value: 1288490188.8 },
    { label: '1.3 GB', value: 1395864371.2 },
    { label: '1.4 GB', value: 1503238553.6 },
    { label: '1.5 GB', value: 1610612736 }];

  const middlePart = [{ label: '1.6 GB', value: 1717986918.4 },
    { label: '1.7 GB', value: 1825361100.8 },
    { label: '1.8 GB', value: 1932735283.2 },
    { label: '1.9 GB', value: 2040109465.6 },
    { label: '2 GB', value: 2147483648 },
    { label: '2.1 GB', value: 2254857830.4 },
    { label: '2.2 GB', value: 2362232012.8 },
    { label: '2.3 GB', value: 2469606195.2 },
    { label: '2.4 GB', value: 2576980377.6 },
    { label: '2.5 GB', value: 2684354560 },
    { label: '2.6 GB', value: 2791728742.4 },
    { label: '2.7 GB', value: 2899102924.8 },
    { label: '2.8 GB', value: 3006477107.2 },
    { label: '2.9 GB', value: 3113851289.6 }];

  const lastPart = [{ label: '3 GB', value: 3221225472 },
    { label: '3.5 GB', value: 3758096384 },
    { label: '4 GB', value: 4294967296 },
    { label: '4.5 GB', value: 4831838208 },
    { label: '5 GB', value: 5368709120 },
    { label: '5.5 GB', value: 5905580032 },
    { label: '6 GB', value: 6442450944 },
    { label: '6.5 GB', value: 6979321856 },
    { label: '7 GB', value: 7516192768 },
    { label: '7.5 GB', value: 8053063680 },
    { label: '8 GB', value: 8589934592 },
    { label: '8.5 GB', value: 9126805504 },
    { label: '9 GB', value: 9663676416 },
    { label: '9.5 GB', value: 10200547328 },
    { label: '10 GB', value: 10737418240 }];

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

  describe('emptyChildren', () => {
    it('when is empty', () => {
      expect(emptyChildren({ x: { y: { z: undefined } } })).toEqual(true);
    });

    it('when is nested and not empty', () => {
      expect(emptyChildren({ x: { y: { z: undefined, zz: { ll: 'hello' } } } })).toEqual(false);
    });

    it('when is not empty', () => {
      expect(emptyChildren({ x: { y: { z: 'defined' } } })).toEqual(false);
    });
  });

  describe('buildPatch', () => {
    it('when is empty', () => {
      expect(buildPatch({ x: { y: { z: undefined } } })).toEqual({});
    });

    it('when is nested and not empty', () => {
      expect(buildPatch({ x: { y: { z: undefined, zz: { ll: 'hello' } } } })).toEqual({
        x: { y: { zz: { ll: 'hello' } } },
      });
    });

    it('when is not empty', () => {
      expect(buildPatch({ x: { y: { z: 'defined' } } })).toEqual({ x: { y: { z: 'defined' } } });
    });
  });

  describe('generateBasicOptions', () => {
    it('returns basic options', () => {
      expect(generateBasicOptions()).toEqual(firstHalf);
    });
  });

  describe('generateRefreshOptions', () => {
    it('returns options for ems refresh', () => {
      expect(generateRefreshOptions()).toEqual([
        ...firstHalf,
        ...middlePart,
        ...lastPart]);
    });

    it('returns options for VM analysis collectors', () => {
      expect(generateRefreshOptions(true)).toEqual([
        ...firstHalf,
        ...middlePart,
      ]);
    });

    it('returns options for Connection Broker', () => {
      expect(generateRefreshOptions(false, 100, 500)).toEqual([
        { label: '500 MB', value: 524288000 },
        { label: '600 MB', value: 629145600 },
        { label: '700 MB', value: 734003200 },
        { label: '800 MB', value: 838860800 },
        { label: '900 MB', value: 943718400 },
        { label: '1 GB', value: 1073741824 },
        { label: '1.1 GB', value: 1181116006.4 },
        { label: '1.2 GB', value: 1288490188.8 },
        { label: '1.3 GB', value: 1395864371.2 },
        { label: '1.4 GB', value: 1503238553.6 },
        { label: '1.5 GB', value: 1610612736 },
        ...middlePart,
        ...lastPart]);
    });
  });

  describe('injectOption', () => {
    it('not inject options', () => {
      expect(injectOption(generateRange(2), 1)).toEqual(
        [{ label: '0', value: 0 }, { label: '1', value: 1 }],
      );
    });

    it('injects options', () => {
      const options = [
        { label: '200 B', value: 200 },
        { label: '300 B', value: 300 },
      ];

      expect(injectOption(options, 400)).toEqual(
        [{ label: '200 B', value: 200 }, { label: '300 B', value: 300 }, { label: '400 B (Custom)', value: 400 }],
      );
    });

    it('injects count options', () => {
      expect(injectOption(generateRange(2), 2, true)).toEqual(
        [{ label: '0', value: 0 }, { label: '1', value: 1 }, { label: '2 (Custom)', value: 2 }],
      );
    });
  });

  describe('generateRange', () => {
    it('0-4 range', () => {
      expect(generateRange(5)).toEqual(
        [{ label: '0', value: 0 }, { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }],
      );
    });

    it('0-5 range', () => {
      expect(generateRange(6)).toEqual([
        { label: '0', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 }]);
    });

    it('0-6 range', () => {
      expect(generateRange(10)).toEqual([
        { label: '0', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
        { label: '8', value: 8 },
        { label: '9', value: 9 }]);
    });
  });
});
