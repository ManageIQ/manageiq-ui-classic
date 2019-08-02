describe('assign-buttons', function() {
  var vm;
  var after = {};

  // buttons
  var b1 = { name: 'button1', id: 1 };
  var b2 = { name: 'button2', id: 2 };
  var b3 = { name: 'button3', id: 3 };
  var b4 = { name: 'button4', id: 4 };
  var b5 = { name: 'button5', id: 5 };
  var b6 = { name: 'button6', id: 6 };
  var b7 = { name: 'button7', id: 7 };
  var b8 = { name: 'button8', id: 8 };
  var b9 = { name: 'button9', id: 9 };
  var b10 = { name: 'button10', id: 10 };
  var b11 = { name: 'button11', id: 11 };
  var b12 = { name: 'button12', id: 12 };

  beforeEach(module('ManageIQ'));
  beforeEach(inject(function($componentController) {
    var bindings = {
      assignedButtons: [b1, b2, b3, b4, b5, b6],
      unassignedButtons: [b7, b8, b9, b10, b11, b12],
      updateButtons: function(assigned, unassigned) {
        after.assigned = assigned;
        after.unassigned = unassigned || bindings.unassignedButtons;
      },
    };

    bindings.updateButtons([], []);

    vm = $componentController('assignButtons', null, bindings);
  }));

  describe('#leftButtonClicked', function() {
    it('one button from assignedButtons is moved to the end of unassignedButtons', function() {
      vm.model.selectedAssignedButtons = [1];
      vm.leftButtonClicked();
      expect(after.assigned).toEqual([b2, b3, b4, b5, b6]);
      expect(after.unassigned[after.unassigned.length - 1]).toEqual(b1);
    });

    it('multiple buttons from assignedButtons are moved to the end of unassignedButtons', function() {
      vm.model.selectedAssignedButtons = [2, 4, 6];
      var expectedResult = vm.unassignedButtons.concat([b2, b4, b6]);
      vm.leftButtonClicked();
      expect(after.assigned).toEqual([b1, b3, b5]);
      expect(after.unassigned).toEqual(expectedResult);
    });
  });

  describe('#rightButtonClicked', function() {
    it('one button from unassignedButtons is moved to the end of assignedButtons', function() {
      vm.model.selectedUnassignedButtons = [7];
      vm.rightButtonClicked();
      expect(after.unassigned).toEqual([b8, b9, b10, b11, b12]);
      expect(after.assigned[after.assigned.length - 1]).toEqual(b7);
    });

    it('multiple buttons from unassignedButtons are moved to the end of assignedButtons', function() {
      vm.model.selectedUnassignedButtons = [8, 10, 12];
      var expectedResult = vm.assignedButtons.concat([b8, b10, b12]);
      vm.rightButtonClicked();
      expect(after.unassigned).toEqual([b7, b9, b11]);
      expect(after.assigned).toEqual(expectedResult);
    });
  });

  describe('#upButtonClicked', function() {
    it('one button is moved one place up', function() {
      vm.model.selectedAssignedButtons = [2];
      vm.upButtonClicked();
      expect(after.assigned[0]).toEqual(b2);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [1, 2, 3];
      var original = [].concat(vm.assignedButtons);
      vm.upButtonClicked();
      expect(after.assigned).toEqual(original);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [1, 3, 5];
      var original = [b1, b3, b2, b5, b4, b6];
      vm.upButtonClicked();
      expect(after.assigned).toEqual(original);
    });
  });

  describe('#downButtonClicked', function() {
    it('one button is moved one place down', function() {
      vm.model.selectedAssignedButtons = [5];
      vm.downButtonClicked();
      expect(after.assigned[5]).toEqual(b5);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [4, 5, 6];
      var original = [].concat(vm.assignedButtons);
      vm.downButtonClicked();
      expect(after.assigned).toEqual(original);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [1, 3, 5];
      var original = [b2, b1, b4, b3, b6, b5];
      vm.downButtonClicked();
      expect(after.assigned).toEqual(original);
    });
  });

  describe('#bottomButtonClicked', function() {
    it('one button is moved one place down', function() {
      vm.model.selectedAssignedButtons = [1];
      vm.bottomButtonClicked();
      expect(after.assigned[5]).toEqual(b1);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [4, 5, 6];
      var original = [].concat(vm.assignedButtons);
      vm.bottomButtonClicked();
      expect(after.assigned).toEqual(original);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [2, 4, 6];
      var original = [b1, b3, b5, b2, b4, b6];
      vm.bottomButtonClicked();
      expect(after.assigned).toEqual(original);
    });
  });

  describe('#topButtonClicked', function() {
    it('one button is moved to the beginning', function() {
      vm.model.selectedAssignedButtons = [5];
      vm.topButtonClicked();
      expect(after.assigned[0]).toEqual(b5);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [1, 2, 3];
      var original = [].concat(vm.assignedButtons);
      vm.topButtonClicked();
      expect(after.assigned).toEqual(original);
    });

    it('buttons preserve their relative order', function() {
      vm.model.selectedAssignedButtons = [1, 3, 5];
      var original = [b1, b3, b5, b2, b4, b6];
      vm.topButtonClicked();
      expect(after.assigned).toEqual(original);
    });
  });
});
