require('../helpers/set_fixtures_helper.js');

describe('miq_tree', function() {
  describe('miqInitTree', function () {
    describe('post_check', function () {
      it('checks child nodes', function () {
        $('body').append($('<miq-tree-view name="test"><div id="testbox" class="treeview"/></miq-tree-view>'));

        miqInitTree({tree_name: "test", tree_id: "testbox", post_check: true, hierarchical_check: true}, [
          {
            key: "1",
            text: "Parent unset, children partial",
            nodes: [
              {
                key: "1-1",
                text: "Child 1",
                state: {
                  checked: true
                }
              },
              {
                key: "1-2",
                text: "Child 2",
                state: {
                  checked: false
                }
              }
            ]
          },
          {
            key: "2",
            text: "Parent set, children unset",
            state: {
              checked: true
            },
            nodes: [
              {
                key: "2-1",
                text: "Child 1"
              },
              {
                key: "2-2",
                text: "Child 2"
              }
            ]
          },
          {
            key: "3",
            text: "Parent set, children partial",
            state: {
              checked: true
            },
            nodes: [
              {
                key: "3-1",
                text: "Child 1",
                state: {
                  checked: false
                }
              },
              {
                key: "3-2",
                text: "Child 2",
                state: {
                  checked: true
                }
              }
            ]
          }
        ]);
        expect(miqTreeFindNodeByKey('test', '1').state.checked).toBe(undefined);
        expect(miqTreeFindNodeByKey('test', '2').state.checked).toBe(true);
        expect(miqTreeFindNodeByKey('test', '2-1').state.checked).toBe(true);
        expect(miqTreeFindNodeByKey('test', '2-2').state.checked).toBe(true);
        expect(miqTreeFindNodeByKey('test', '3').state.checked).toBe(true);
        expect(miqTreeFindNodeByKey('test', '3-1').state.checked).toBe(true);
      });
    });
  });
});
