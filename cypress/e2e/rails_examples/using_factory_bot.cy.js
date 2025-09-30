describe('Rails using factory bot examples', function() {
  beforeEach(() => {
    cy.app('start');
  });

  afterEach(() => {
    cy.app('clean');
  });

  it('using single factory bot', function() {
    cy.appFactories([
      ['create', 'vm_vmware', {name: 'test_vm'} ]
    ])
    cy.login();
    cy.menu('Compute', 'Infrastructure', 'Virtual Machines');
    let main_div = cy.get('div#main_div')
    // clean should of removed these from other tests
    main_div.should('not.contain', 'test_host');
    main_div.contains('test_vm');
  })
})
