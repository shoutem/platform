// we disable autolinking for certain packages due to them either not supporting
// it or having to avoid it as per instructions of package maintainers

module.exports = {
  dependencies: {
    'react-native-fbsdk-next': {
      platforms: {
        android: null,
      },
    },
    'react-native-maps': {
      platforms: {
        android: null,
      },
    },
  },
};
