import * as moduleAlias from 'module-alias';
const sourcePath = process.env.NODE_ENV === 'development' ? 'src' : 'build';
moduleAlias.addAliases({
  '@server': sourcePath,
  '@config': `${sourcePath}/config`,
  '@domain': `${sourcePath}/domain`,
});

import { createServer } from '@config/express';
import { logger } from '@config/logger';
import { createMongooseConnection } from '@config/mongoose';

const port = process.env.PORT || '5000';


async function startServer() {
  await createMongooseConnection();

  const app = createServer()

  // if (process.env.NODE_ENV === 'development') {
  //   const server = http.createServer(app).listen({ host, port }, () => {
  //     const addressInfo = server.address() as AddressInfo;
  //     logger.info(`Server ready at http://${addressInfo.address}:${addressInfo.port}`);
  //   });
  // } else {
    app.listen(port, () => {
      logger.info(`Server ready at http://localhost:${port}`);
    });
  // }


  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      logger.info(`process.once ${type}`);

      // server.close(() => {
      //   logger.debug('HTTP server closed');
      // });
    });
  });
}

startServer();
