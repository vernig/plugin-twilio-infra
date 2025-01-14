const { TwilioClientCommand } = require("@twilio/cli-core").baseCommands;

const {
  cliInfo
} = require('create-twilio-function/src/command');

const {
  
  convertYargsOptionsToOclifFlags,
  normalizeFlags,
  getEnvironmentVariables

} = require('../../../utils');


const shell = require("shelljs");

class FunctionsStackNew extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags, args } = this.parse(FunctionsStackNew);
    flags = normalizeFlags(flags);

    const vars = getEnvironmentVariables(flags, this.twilioClient);

    shell.exec(`pulumi stack init ${args.name.replace("--name=", "")}`).stdout;

    return;
  }
}

FunctionsStackNew.description = "previews your local infra project";

FunctionsStackNew.args = [
  {
    name: 'name',
    required: true,
    description: 'Name of the stack'
  },
];

FunctionsStackNew.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(cliInfo.options),
  { profile: TwilioClientCommand.flags.profile }
);

module.exports = FunctionsStackNew;
