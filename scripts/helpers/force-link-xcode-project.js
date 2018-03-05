/**
 * force-link an xcodeproject file
 * 
 * Reason: if a podspec file exists in a project's root directory,
 * `react-native link` will read the podspec file and add the project to the
 * main pod file, which means that the dependency .xcodeproject will not get
 * linked in the main project.pbxproj file.
 * 
 * Usage example:
 *
 * forceLinkXCodeProject({
 *   xcodeprojFileName: 'RNFIRMessaging.xcodeproj',
 *   folderName: 'react-native-fcm',
 *   podspec: 'react-native-fcm',
 * });
 *
 */

const path = require('path');

const getXcodeProjectPath = require('./get-xcode-project-path');
const getXcodeProjectName = require('./get-xcode-project-name');
const rootProjectDir = require('./get-project-path');

const registerNativeModulePath = path.resolve(
  rootProjectDir,
  'node_modules/react-native',
  'local-cli/link/ios/registerNativeModule.js'
);
const registerNativeModuleIOS = require(registerNativeModulePath);

const rootIosDir = path.join(rootProjectDir, 'ios');
const rootProjectName = getXcodeProjectName({ cwd: rootIosDir });
const rootProjectPath = getXcodeProjectPath({ cwd: rootIosDir });

const rootProjectConfig = createProjectConfig({
  folder: rootProjectDir,
  projectName: rootProjectName,
  podfile: true,
  podspec: null,
});

function createProjectConfig(project) {
  const { folder, projectName, podfile, podspec, pbxprojPath } = project;

  const sourceDir = path.join(folder, 'ios');
  const projectPath = path.join(sourceDir, projectName);

  return {
    folder,
    sourceDir,
    projectName,
    projectPath,

    pbxprojPath: pbxprojPath ? pbxprojPath : rootProjectPath,
    podfile: podfile ? path.join(sourceDir, 'Podfile') : null,
    podspec: podspec ? podspec : null,

    libraryFolder: 'Libraries',
    sharedLibraries: [],
    plist: [],
  };
}

module.exports = function forceLinkXCodeProject(dependencyData) {
  const { folderName, podspec, xcodeprojFileName } = dependencyData;

  const dependencyDir = path.join(rootProjectDir, 'node_modules', folderName);
  const sourceDir = path.join(dependencyDir, 'ios');
  const projectPath = path.join(sourceDir, xcodeprojFileName);
  const pbxprojPath = path.join(projectPath, 'project.pbxproj');

  const dependencyConfig = createProjectConfig({
    folder: dependencyDir,
    projectName: xcodeprojFileName,
    podfile: null,
    pbxprojPath,
    podspec,
  });

  console.log(`Force linking ${folderName} using registerNativeModuleIOS()`);

  // this is a no-op if it's already registered
  registerNativeModuleIOS(dependencyConfig, rootProjectConfig);
};
