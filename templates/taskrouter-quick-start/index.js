'use strict';
const pulumi = require('@pulumi/pulumi');
const { Resource } = require('twilio-pulumi-provider');

// Taskortuter workspace based on https://www.youtube.com/watch?v=XMg5ytgyn1E

const WorkspaceCustomerCare = new Resource('workspace-customer-care-center', {
  resource: ['taskrouter', 'workspaces'],
  attributes: {
    friendlyName: 'Customer Care Center',
  },
});

const workerAlice = new Resource('worker-alice', {
  resource: [
    'taskrouter',
    { workspaces: WorkspaceCustomerCare.sid },
    'workers',
  ],
  attributes: {
    friendlyName: 'Alice',
    attributes: JSON.stringify({ languages: ['en', 'es'] }),
  },
});

const workerBob = new Resource('worker-bob', {
  resource: [
    'taskrouter',
    { workspaces: WorkspaceCustomerCare.sid },
    'workers',
  ],
  attributes: {
    friendlyName: 'Bob',
    attributes: JSON.stringify({ languages: ['en'] }),
  },
});

const TaskqueueEnglish = new Resource('taskqueue-english', {
  resource: [
    'taskrouter',
    { workspaces: WorkspaceCustomerCare.sid },
    'taskQueues',
  ],
  attributes: {
    targetWorkers: `languages HAS "en"`,
    friendlyName: 'English Queue',
  },
});

const TaskqueueSpanish = new Resource('taskqueue-spanish', {
  resource: [
    'taskrouter',
    { workspaces: WorkspaceCustomerCare.sid },
    'taskQueues',
  ],
  attributes: {
    targetWorkers: `languages HAS "es"`,
    friendlyName: 'Spanish Queue',
  },
});

const WorkflowIncomingRequests = new Resource('workflow-incoming-requests', {
  resource: [
    'taskrouter',
    { workspaces: WorkspaceCustomerCare.sid },
    'workflows',
  ],
  attributes: {
    assignmentCallbackUrl: 'http://example.org',
    friendlyName: 'Incoming Customer Care Requests',
    taskReservationTimeout: 1200,
    configuration: pulumi
      .all([TaskqueueEnglish.sid, TaskqueueSpanish.sid])
      .apply(([englishTaskQueueSid, spanishTaskQueueSid]) =>
        JSON.stringify({
          task_routing: {
            filters: [
              {
                friendlyName: 'Language - Spanish',
                expression: `selected_language=='es'`,
                targets: [
                  {
                    queue: spanishTaskQueueSid,
                  },
                ],
              },
              {
                friendlyName: 'Language - English',
                targets: [
                  {
                    queue: englishTaskQueueSid,
                  },
                ],
                expression: `selected_language=='en'`,
              },
            ],
          },
        })
      ),
  },
});
