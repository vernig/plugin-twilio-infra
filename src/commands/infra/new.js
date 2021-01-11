const { flags } = require("@oclif/command");
const { TwilioClientCommand } = require("@twilio/cli-core").baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const child_process = require("child_process");
const validUrl = require("valid-url");
const debug = require("debug")("infra:new");

const {
  convertYargsOptionsToOclifFlags,
  options,
  getStackName,
} = require("../../utils");

const { getTemplateFile } = require("../../templating/actions.js");
const fs = require("fs");

class InfraNew extends TwilioClientCommand {
  async run() {
    await super.run();

    let { flags } = this.parse(InfraNew);
    debug(`Flags: ${JSON.stringify(flags)}`)

    const PulumiTemplateRepo = validUrl.isUri(flags["pulumi-template"])
      ? flags["pulumi-template"]
      : `https://github.com/pulumi/templates/tree/master/${
          flags["pulumi-template"] ? flags["pulumi-template"] : "javascript"
        }`;

    // Init pulumi project
    let pulumiArgs = ["new", PulumiTemplateRepo];
    const stackName = getStackName(flags, this.twilioClient);
    if (stackName) {
      pulumiArgs.push(`--stack=${stackName}`);
    }
    child_process.execFileSync("pulumi", pulumiArgs, { stdio: "inherit" });

    // Install twilio-pulumi-provider
    child_process.execFileSync(
      "npm",
      ["install", "twilio", "twilio-pulumi-provider"],
      { stdio: "inherit" }
    );

    // Create index.js based on template
    if (flags.template) {
      getTemplateFile(flags.template)
        .then((scriptContent) => {
          fs.writeFileSync("index.js", scriptContent);
        })
        .catch((err) => {
          throw new TwilioCliError(`Error fetching template: ${err}`);
        });
    }
    return;
  }
}

InfraNew.description = "Creates a new project based on a template";

InfraNew.flags = Object.assign(
  {},
  convertYargsOptionsToOclifFlags(options),
  {
    profile: TwilioClientCommand.flags.profile,
  },
  {
    template: flags.string({
      default: "",
      description:
        "Twilio Pulumi provider template, e.g. taskrouter-quick-start",
    }),
    "pulumi-template": flags.string({
      default: "",
      description:
        "Pulumi project template (see https://github.com/pulumi/templates)",
    }),
  }
);

module.exports = InfraNew;
