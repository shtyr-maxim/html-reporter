'use strict';

const {EventEmitter} = require('events');
const Promise = require('bluebird');
const _ = require('lodash');
const {subscribeOnToolEvents} = require('lib/gui/tool-runner/report-subscriber');
const {GuiReportBuilder} = require('lib/report-builder/gui');
const {ClientEvents} = require('lib/gui/constants');
const {stubTool, stubConfig} = require('test/unit/utils');
const {TestplaneTestAdapter} = require('lib/test-adapter/testplane');
const {UNKNOWN_ATTEMPT} = require('lib/constants');

describe('lib/gui/tool-runner/testplane/report-subscriber', () => {
    const sandbox = sinon.createSandbox();
    let reportBuilder;
    let client;

    const events = {
        RUNNER_END: 'runnerEnd',
        TEST_BEGIN: 'testBegin',
        TEST_PENDING: 'pendingTest',
        TEST_FAIL: 'failTest',
        AFTER_TESTS_READ: 'afterTestsRead'
    };

    const mkTestplane_ = () => stubTool(stubConfig(), events);

    const mkTestplaneTestResult = (opts = {}) => _.defaults(opts, {
        fullTitle: () => 'some-title',
        browserId: 'some-browser',
        assertViewResults: [],
        metaInfo: {}
    });

    beforeEach(() => {
        reportBuilder = sinon.createStubInstance(GuiReportBuilder);
        reportBuilder.addTestResult.callsFake(_.identity);

        sandbox.stub(GuiReportBuilder, 'create').returns(reportBuilder);
        sandbox.stub(TestplaneTestAdapter.prototype, 'id').value('some-id');

        client = new EventEmitter();
        sandbox.spy(client, 'emit');
    });

    afterEach(() => sandbox.restore());

    describe('RUNNER_END', () => {
        it('should emit "END" event for client', () => {
            const testplane = mkTestplane_();

            subscribeOnToolEvents(testplane, reportBuilder, client);

            return testplane.emitAsync(testplane.events.RUNNER_END)
                .then(() => assert.calledOnceWith(client.emit, ClientEvents.END));
        });

        it('should emit "END" event after all promises are resolved', async () => {
            const testplane = mkTestplane_();
            const testResult = mkTestplaneTestResult();
            const mediator = sinon.spy().named('mediator');

            reportBuilder.addTestResult.callsFake(() => Promise.delay(100).then(mediator).then(() => ({id: 'some-id'})));

            subscribeOnToolEvents(testplane, reportBuilder, client);
            testplane.emit(testplane.events.TEST_FAIL, testResult);
            await testplane.emitAsync(testplane.events.RUNNER_END);

            assert.callOrder(mediator, client.emit.withArgs(ClientEvents.END));
        });
    });

    describe('TEST_BEGIN', () => {
        it('should emit "BEGIN_STATE" event for client with correct data', async () => {
            const testplane = mkTestplane_();
            const testResult = mkTestplaneTestResult();

            reportBuilder.addTestResult.resolves({id: 'some-id'});
            reportBuilder.getTestBranch.withArgs('some-id').returns('test-tree-branch');

            subscribeOnToolEvents(testplane, reportBuilder, client);
            testplane.emit(testplane.events.TEST_BEGIN, testResult);
            await testplane.emitAsync(testplane.events.RUNNER_END);

            assert.calledWith(client.emit, ClientEvents.BEGIN_STATE, 'test-tree-branch');
        });
    });

    describe('TEST_PENDING', () => {
        it('should add skipped test result to report', async () => {
            const testplane = mkTestplane_();
            const testResult = mkTestplaneTestResult();

            subscribeOnToolEvents(testplane, reportBuilder, client);
            await testplane.emitAsync(testplane.events.TEST_PENDING, testResult);
            await testplane.emitAsync(testplane.events.RUNNER_END);

            assert.calledOnceWith(reportBuilder.addTestResult, sinon.match({
                fullName: 'some-title',
                browserId: 'some-browser',
                attempt: UNKNOWN_ATTEMPT
            }));
        });

        it('should emit "TEST_RESULT" event for client with test data', async () => {
            const testplane = mkTestplane_();
            const testResult = mkTestplaneTestResult();

            reportBuilder.getTestBranch.withArgs('some-id').returns('test-tree-branch');

            subscribeOnToolEvents(testplane, reportBuilder, client);
            await testplane.emitAsync(testplane.events.TEST_PENDING, testResult);
            await testplane.emitAsync(testplane.events.RUNNER_END);

            assert.calledWith(client.emit, ClientEvents.TEST_RESULT, 'test-tree-branch');
        });
    });

    describe('TEST_FAIL', () => {
        it('should emit "TEST_RESULT" event for client with test data', async () => {
            const testplane = mkTestplane_();
            const testResult = mkTestplaneTestResult();

            reportBuilder.getTestBranch.withArgs('some-id').returns('test-tree-branch');

            subscribeOnToolEvents(testplane, reportBuilder, client);
            testplane.emit(testplane.events.TEST_FAIL, testResult);
            await testplane.emitAsync(testplane.events.RUNNER_END);

            assert.calledWith(client.emit, ClientEvents.TEST_RESULT, 'test-tree-branch');
        });
    });
});
