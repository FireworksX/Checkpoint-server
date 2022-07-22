module.exports = {
  apps: [
    {
      name: 'checkpoint-server',
      script: 'ts-node',
      args: "-r tsconfig-paths/register -r dotenv/config src/index"
    }
  ]
}
