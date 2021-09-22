import { convertMultParamsToRailsMultParams } from './util';

const TESTCASES = [
  [ // Example Case
    "selectedUser=all&approvalStateCheckboxes=pending_approval&approvalStateCheckboxes=approved&approvalStateCheckboxes=denied&types=all&selectedPeriod=7&reasonText=",
    "selectedUser=all&approvalStateCheckboxes[]=pending_approval&approvalStateCheckboxes[]=approved&approvalStateCheckboxes[]=denied&types=all&selectedPeriod=7&reasonText="
  ], [
    "foo=bar",
    "foo=bar"
  ], [
    "foobar",
    "foobar="
  ], [
    "foo=1&bar=2",
    "foo=1&bar=2"
  ],[
    "foo=bar&tree&color=red",
    "foo=bar&tree=&color=red"
  ], [ // key named: brok&en
    "var1=8&var2=5&brok&en=value",
    "var1=8&var2=5&brok=&en=value"
  ], [ // value named: brok&en
    "var1=8&var2=5&var1=brok&en",
    "var1[]=8&var1[]=brok&var2=5&en="
  ], [ // key named: brok=en
    "var1=8&var2=5&brok=en=value",
    "var1=8&var2=5&brok=en%3Dvalue"
  ], [ // value named: brok=en
    "var1=8&var2=5&var1=brok=en",
    "var1[]=8&var1[]=brok%3Den&var2=5"
  ], [
    encodeURIComponent("foo=bar"),
    "foo%3Dbar="
  ], [
    encodeURIComponent("foo=bar&test=one&test=two"),
    "foo%3Dbar%26test%3Done%26test%3Dtwo="
  ], [
    "foo=&bar=",
    "foo=&bar="
  ], [
    "foo=bar&foo=",
    "foo[]=bar&foo[]="
  ]
]

describe('Helpers', () => {
  it('convertMultParamsToRailsMultParams', () => {
    for (let test of TESTCASES) {
      expect(convertMultParamsToRailsMultParams(test[0])).toEqual(test[1]);
    }
  });
});
