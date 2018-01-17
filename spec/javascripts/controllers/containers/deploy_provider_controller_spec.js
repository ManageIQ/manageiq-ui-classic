describe('containers.deployProviderController', function() {
    var $scope, vm, $controller, $httpBackend, miqService;

    beforeEach(module('miq.containers.providersModule'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, _$controller_, _miqService_) {
        miqService = _miqService_;
        spyOn(miqService, 'showButtons');
        spyOn(miqService, 'hideButtons');
        spyOn(miqService, 'miqAjaxButton');
        spyOn(miqService, 'sparkleOn');
        spyOn(miqService, 'sparkleOff');
        $scope = $rootScope.$new();
        spyOn($scope, '$broadcast');
        $httpBackend = _$httpBackend_;
        $controller = _$controller_('containers.deployProviderController as vm', {
            $scope: $scope,
            keyPairFormId: 'new',
            url: '/ems_container/show_list',
            categories: [],
            miqService: miqService
        });
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('create authentication object', function() {
        it('should create authentication object with default options', function() {
            $controller.deploymentData = { 'providers' : ['bla'], 'provision' : 'prov', 'deployment_types' : 'origin' };
            $controller.initializeDeploymentWizard();
            auth = $controller.create_auth_object();
            expect(auth.type).toBe('AuthenticationAllowAll');

        });

        it('should create authentication object with custom options', function() {
            $controller.deploymentData = { 'providers' : ['bla'], 'provision' : 'prov', 'deployment_types' : 'origin' };
            $controller.initializeDeploymentWizard();
            [{ 'input' : { 'mode': 'htPassword', 'htPassword' : {'users' : ['user']} }, 'expectedResult' : {'type' : 'AuthenticationHtpasswd', 'htpassd_users' : ['user']}},
             { 'input' : { 'mode': 'ldap', 'ldap' : {'bindDN' : 'dn', 'bindPassword' : 'bp', 'ca' : 'ca', 'others' : 'something'} },
               'expectedResult' : {'type' : 'AuthenticationLdap', 'bind_dn' : 'dn', 'password' : 'bp', 'certificate_authority' : 'ca', 'others' : 'something' }},
             { 'input' : { 'mode': 'requestHeader', 'requestHeader' : {'challengeUrl' : 'url1', 'loginUrl' : 'url2', 'clientCA' : 'ca', 'headers' : ['h']} },
                'expectedResult' : {'type' : 'AuthenticationRequestHeader', 'request_header_challenge_url' : 'url1', 'request_header_login_url' : 'url2', 'certificate_authority' : 'ca',
                                    'request_header_headers' : ['h']}},
             { 'input' : { 'mode': 'openId', 'openId' : {'clientId' : 'ci', 'clientSecret' : 'cs', 'subClaim' : 'sc', 'authEndpoint' : 'ae', 'tokenEndpoint' : 'te'} },
                'expectedResult' : {'type' : 'AuthenticationOpenId', 'userid' : 'ci', 'password' : 'cs', 'open_id_sub_claim' : 'sc',
                                    'open_id_authorization_endpoint' : 'ae', 'open_id_token_endpoint' : 'te'} },
             { 'input' : { 'mode': 'google', 'google' : {'clientId' : 'ci', 'clientSecret' : 'cs', 'hostedDomain' : 'hd'} },
                'expectedResult' : {'type' : 'AuthenticationGoogle', 'userid' : 'ci', 'password' : 'cs', 'google_hosted_domain' : 'hd'} },
             { 'input' : { 'mode': 'github', 'github' : {'clientId' : 'ci', 'clientSecret' : 'cs'} },
                'expectedResult' : {'type' : 'AuthenticationGithub', 'userid' : 'ci', 'password' : 'cs'} }
            ].forEach(function(e) {
                $controller.data.authentication = e.input;
                auth = $controller.create_auth_object();
                expect(auth).toEqual(e.expectedResult);
            });

        });
    });

    describe('create nodes object', function() {
        it('should create empty nodes object', function() {
            nodes = $controller.create_nodes_object();
            expect(nodes).toEqual([]);
        });

        it('should create nodes object with no Provider', function() {
            $controller.data.provisionOn = 'noProvider';
            $controller.nodeData.allNodes = [{ 'master' : 'm', 'node' : 'n', 'storage' : 's', 'loadBalancer' : 'lb', 'vmName' : 'Knedlik',
                                               'dns' : 'dns', 'etcd' :'etcd', 'infrastructure' : 'in',  'publicName' : 'publicKnedlik' }];
            nodes = $controller.create_nodes_object();
            expect(nodes).toEqual([{ 'name' : 'Knedlik', 'id' : undefined, 'public_name' : 'publicKnedlik', 'roles' : {'master' : 'm', 'node' : 'n', 'storage' : 's', 'master_lb' : 'lb',
                                               'dns' : 'dns', 'etcd' :'etcd', 'infrastructure' : 'in' }}]);
        });

        it('should create nodes object with existing VMs', function() {
            $controller.data.provisionOn = 'existingVms';
            $controller.nodeData.allNodes = [{ 'master' : 'm', 'id' : 1, 'node' : 'n', 'storage' : 's', 'loadBalancer' : 'lb', 'vmName' : 'Knedlik',
                                               'dns' : 'dns', 'etcd' :'etcd', 'infrastructure' : 'in' }];
            nodes = $controller.create_nodes_object();
            expect(nodes).toEqual([{ 'name' : 'Knedlik', 'id' : 1, 'roles' : {'master' : 'm', 'node' : 'n', 'storage' : 's', 'master_lb' : 'lb',
                                               'dns' : 'dns', 'etcd' :'etcd', 'infrastructure' : 'in' }}]);
        });

        it('should filter nodes without master/node/storage', function() {
            $controller.data.provisionOn = 'existingVms';
            $controller.nodeData.allNodes = [{ 'id' : 1, 'loadBalancer' : 'lb', 'vmName' : 'Knedlik',
                                               'dns' : 'dns', 'etcd' :'etcd', 'infrastructure' : 'in' }];
            nodes = $controller.create_nodes_object();
            expect(nodes).toEqual([]);
        });
    });

    describe('starts deploy', function() {
        it('should deploy', function() {
            $controller.deploymentData = { 'providers' : ['bla'], 'provision' : 'prov', 'deployment_types' : 'origin' };
            $controller.initializeDeploymentWizard();
            $controller.startDeploy();
            expect($controller.deployFailed).toBe(false);
        });

    });

});
