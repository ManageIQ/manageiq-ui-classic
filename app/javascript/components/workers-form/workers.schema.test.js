import addSchema from './workers.schema.js';
import { parseSettings } from './helpers.js';

it('schema generates correctly', () => {
  const response = {
    workers: {
      worker_base: {
        defaults: {
          count: 1,
          memory_threshold: "500.megabytes",
        },
      },
    },
  };

  const parsed = parseSettings(response);
  const schema = addSchema(parsed)

  expect(schema).toMatchSnapshot();
});
