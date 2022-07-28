import { basicInformatinoSchema } from './basic-information.schema';
import { serverControlsSchema } from './server-controls-list.schema';
import { outgoingSmtpSchema } from './outgoing-smtp-server.schema';
import { webserviceSchema } from './webservices.schema';
import { loggingSchema } from './logging.schema';

const createSchema = (initialValues) => ({
  fields: [
    basicInformatinoSchema(initialValues),
    serverControlsSchema(initialValues),
    outgoingSmtpSchema(initialValues),
    webserviceSchema(initialValues),
    loggingSchema(initialValues),
  ],
});

export default createSchema;
