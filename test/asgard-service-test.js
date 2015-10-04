const api_client = require('@springworks/api-client');
const asgard_service = require('../lib/asgard-service');
const logger = require('../lib/logger');
const fixture_loader = require('../test-util/fixture-loader');
const internals = {};

describe(__filename, function() {
  let mock_api_client;
  let sinon_sandbox;

  beforeEach(() => {
    sinon_sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sinon_sandbox.restore();
  });

  beforeEach(function createMockApiClient() {
    mock_api_client = api_client.createClient({
      base_url: `http://localhost:3001/eu-west-1`,
      circuit_breaker_config: { source_name: 'test-source', target_name: 'test-target' },
      logger: logger,
      opt_options: {
        opt_auth: {
          user: 'user',
          pass: 'password',
        },
      },
    });
  });

  describe('create', () => {

    describe('with asgard_host, aws_region, basic_auth', () => {

      it('should return object with public functions', () => {
        const asgard_host = 'http://localhost:3001';
        const aws_region = 'eu-west-1';
        const basic_auth = { username: 'user', password: 'secret' };
        const service = asgard_service.create(asgard_host, aws_region, basic_auth);
        service.should.have.keys([
          'prepareDeployment',
          'startDeployment',
          'getDeployment',
        ]);
      });

    });

  });

  describe('internals.prepareDeployment', () => {
    let send_request_stub;
    let mocked_asgard_response;

    beforeEach(() => {
      mocked_asgard_response = fixture_loader.loadFixture('./test-util/fixtures/asgard/prepare-deployment.json');
    });

    beforeEach(function stubSendRequest() {
      send_request_stub = sinon_sandbox.stub(mock_api_client, 'sendRequest').returns(Promise.resolve(mocked_asgard_response));
    });

    describe('with a valid cluster_name', () => {
      const cluster_name = 'asteroids';

      it('should make a GET request to Asgard preparing deployment', () => {
        return asgard_service.internals.prepareDeployment(mock_api_client, cluster_name).then(() => {
          send_request_stub.should.have.callCount(1);
          const req_params = send_request_stub.getCall(0).args[0];
          req_params.should.have.property('method', 'get');
          req_params.should.have.property('endpoint_uri', `/deployment/prepare/${cluster_name}`);
          req_params.qs.should.have.property('deploymentTemplateName', 'CreateAndCleanUpPreviousAsg');
          req_params.qs.should.have.property('includeEnvironment', true);
        });
      });

      it('should resolve with response from Asgard API', () => {
        return asgard_service.internals
            .prepareDeployment(mock_api_client, cluster_name)
            .should.be.fulfilledWith(mocked_asgard_response);
      });

      it('should expect status code 200 OK', () => {
        return asgard_service.internals
            .prepareDeployment(mock_api_client, cluster_name)
            .then(() => {
              const expected_status_codes = send_request_stub.getCall(0).args[1];
              expected_status_codes.should.eql([200]);
            });
      });

    });

  });

  describe('internals.startDeployment', () => {
    let send_request_stub;
    let mocked_asgard_response;

    beforeEach(() => {
      mocked_asgard_response = fixture_loader.loadFixture('./test-util/fixtures/asgard/start-deployment.json');
    });

    beforeEach(function stubSendRequest() {
      send_request_stub = sinon_sandbox.stub(mock_api_client, 'sendRequest').returns(Promise.resolve(mocked_asgard_response));
    });

    describe('with a valid params', () => {
      const cluster_name = 'asteroids';
      let launch_config_options;
      let asg_options;

      beforeEach(() => {
        launch_config_options = internals.mockLaunchConfigOptions();
        asg_options = internals.mockAsgOptions();
      });

      it('should make a POST request to Asgard starting deployment', () => {
        return asgard_service.internals.startDeployment(mock_api_client, cluster_name, launch_config_options, asg_options).then(() => {
          send_request_stub.should.have.callCount(1);
          const req_params = send_request_stub.getCall(0).args[0];
          req_params.should.have.property('method', 'post');
          req_params.should.have.property('endpoint_uri', '/deployment/start');
        });
      });

      it('should define deployment options in request body', () => {
        return asgard_service.internals.startDeployment(mock_api_client, cluster_name, launch_config_options, asg_options).then(() => {
          const req_params = send_request_stub.getCall(0).args[0];
          req_params.should.have.property('json');
          req_params.json.should.have.property('deploymentOptions');
        });
      });

      it('should resolve with response from Asgard API', () => {
        return asgard_service.internals
            .startDeployment(mock_api_client, launch_config_options)
            .should.be.fulfilledWith(mocked_asgard_response);
      });

      it('should expect status code 200 OK', () => {
        return asgard_service.internals
            .startDeployment(mock_api_client, launch_config_options)
            .then(() => {
              const expected_status_codes = send_request_stub.getCall(0).args[1];
              expected_status_codes.should.eql([200]);
            });
      });

    });

  });

  describe('internals.provideDeploymentRequestBody', () => {

    describe('with valid params', () => {
      const cluster_name = 'asteroids';
      let launch_config_options;
      let asg_options;

      beforeEach(() => {
        launch_config_options = internals.mockLaunchConfigOptions();
        asg_options = internals.mockAsgOptions();
      });

      it('should define cluster name in deployment options', () => {
        const opts = asgard_service.internals.provideDeploymentRequestBody(cluster_name, launch_config_options, asg_options);
        opts.deploymentOptions.should.have.property('clusterName', cluster_name);
      });

      it('should define deployment options for zero-downtime deployment', () => {
        const opts = asgard_service.internals.provideDeploymentRequestBody(cluster_name, launch_config_options, asg_options);
        const zero_downtime_steps = [
          {
            type: 'CreateAsg',
          },
          {
            type: 'Resize',
            targetAsg: 'Next',
            capacity: 2,
            startUpTimeoutMinutes: 20,
          },
          {
            type: 'Wait',
            durationMinutes: '5',
          },
          {
            type: 'DisableAsg',
            targetAsg: 'Previous',
          },
          {
            type: 'DeleteAsg',
            targetAsg: 'Previous',
          },
        ];
        opts.deploymentOptions.should.have.property('steps', zero_downtime_steps);
      });

      it('should use auto-scaling group and launch config options as-is', () => {
        const opts = asgard_service.internals.provideDeploymentRequestBody(cluster_name, launch_config_options, asg_options);
        opts.should.have.properties({
          asgOptions: asg_options,
          lcOptions: launch_config_options,
        });
      });

    });

  });

  describe('internals.getDeployment', () => {
    let send_request_stub;
    let mocked_asgard_response;

    beforeEach(() => {
      mocked_asgard_response = fixture_loader.loadFixture('./test-util/fixtures/asgard/get-deployment.json');
    });

    beforeEach(function stubSendRequest() {
      send_request_stub = sinon_sandbox.stub(mock_api_client, 'sendRequest').returns(Promise.resolve(mocked_asgard_response));
    });

    describe('with valid deployment id', () => {
      const deployment_id = 1051;

      it('should GET {host}/{region}/deployment/show/{deployment_id}.json', () => {
        return asgard_service.internals
            .getDeployment(mock_api_client, deployment_id)
            .then(() => {
              const req_params = send_request_stub.getCall(0).args[0];
              req_params.should.have.property('json');
              req_params.should.have.property('method', 'get');
              req_params.should.have.property('endpoint_uri', `/deployment/show/${deployment_id}.json`);
            });
      });

      it('should expect status code 200 OK', () => {
        return asgard_service.internals
            .getDeployment(mock_api_client, deployment_id)
            .then(() => {
              const expected_status_codes = send_request_stub.getCall(0).args[1];
              expected_status_codes.should.eql([200]);
            });
      });

      it('should resolve with response from API', () => {
        return asgard_service.internals.getDeployment(mock_api_client, deployment_id).should.be.fulfilledWith(mocked_asgard_response);
      });

    });

  });

});


internals.mockAsgOptions = function() {
  return {
    autoScalingGroupName: null,
    launchConfigurationName: null,
    minSize: 2,
    maxSize: 2,
    desiredCapacity: 2,
    defaultCooldown: 10,
    availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
    loadBalancerNames: [],
    healthCheckType: 'EC2',
    healthCheckGracePeriod: 600,
    placementGroup: null,
    subnetPurpose: 'internal',
    terminationPolicies: ['Default'],
    tags: [],
    suspendedProcesses: []
  };
};


internals.mockLaunchConfigOptions = function() {
  return {
    launchConfigurationName: null,
    imageId: 'ami-d0a416a7',
    keyName: 'm2hkey',
    securityGroups: ['sg-52d65837', 'sg-92c702f7'],
    userData: null,
    instanceType: 'm1.small',
    kernelId: '',
    ramdiskId: '',
    blockDeviceMappings: null,
    instanceMonitoringIsEnabled: false,
    instancePriceType: 'ON_DEMAND',
    iamInstanceProfile: 'messenger',
    ebsOptimized: false,
    associatePublicIpAddress: null
  };
};
