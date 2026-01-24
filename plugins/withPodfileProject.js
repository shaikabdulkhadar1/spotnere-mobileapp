const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withPodfileProject(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let contents = fs.readFileSync(podfilePath, "utf8");

      // Add project line only if missing
      const projectLine = "project 'spotneremobileapp.xcodeproj'\n";
      if (!contents.includes("project 'spotneremobileapp.xcodeproj'")) {
        // Insert after platform line
        contents = contents.replace(
          /(platform :ios[^\n]*\n)/,
          `$1${projectLine}`
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
};
