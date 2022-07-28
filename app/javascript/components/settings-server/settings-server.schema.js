import { basicInformatinoSchema } from './basic-information.schema';
import { serverControlsSchema } from './server-controls-list.schema';
import { outgoingSmtpSchema } from './outgoing-smtp-server.schema';

const createSchema = (initialValues) => ({
  fields: [
    basicInformatinoSchema(initialValues),
    serverControlsSchema(initialValues),
    outgoingSmtpSchema(initialValues),
  ],
});

export default createSchema;
