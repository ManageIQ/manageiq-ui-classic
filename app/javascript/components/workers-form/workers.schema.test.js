import addSchema from './workers.schema.js';
import { parseSettings } from './helpers.js';

it('schema generates correctly', () => {
  const response = {
    workers: {
      worker_base: {
        event_catcher: {
          defaults: {
            memory_threshold: "2.gigabytes",
          },
        },
        queue_worker_base: {
          defaults: {
            memory_threshold: "500.megabytes",
          },
        },
        defaults: {
          count: 1,
          memory_threshold: "400.megabytes",
        },
      },
    },
  };

  const parsed = parseSettings(response);
  const schema = addSchema(parsed)

  expect(schema).toMatchSnapshot();
});
