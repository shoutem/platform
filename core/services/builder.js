import React, { PureComponent } from 'react';
import _ from 'lodash';

export function assertNotEmpty(target, errorMessage) {
  if (!target) {
    throw new Error(errorMessage);
  }

  if (Object.keys(target).length <= 0) {
    throw new Error(errorMessage);
  }
}

export function assertExtensionsExist(extensions) {
  assertNotEmpty(extensions, `The app without any extensions cannot be created.
    You must supply at least one extensions using the setExtensions method`);
}

export function renderMainContent(app, extensions) {
  const renderedContent = [];

  for (const extensionName of Object.keys(extensions)) {
    const extension = extensions[extensionName];
    const renderFunction = extension.render;

    if (typeof renderFunction === 'function') {
      const content = renderFunction(app);
      if (content) {
        renderedContent.push(content);
      }
    }
  }

  return renderedContent;
}

export function renderProviders(extensions, mainContent) {
  let renderedContent = mainContent;

  for (const extensionName of Object.keys(extensions)) {
    const extension = extensions[extensionName];
    const renderFunction = extension.renderProvider;

    if (typeof renderFunction === 'function') {
      const providerContent = renderFunction(renderedContent);
      if (providerContent) {
        renderedContent = providerContent;
      }
    }
  }

  return renderedContent;
}

export function createAppContextConsumer(extensions) {
  return class Consumer extends PureComponent {
    render() {
      const { children } = this.props;

      const contexts = _.reduce(extensions, (res, extension) => {
        if (extension.context) {
          res.push(extension.context);
        }
        return res;
      }, []);

      const renderer = _.reduce(contexts, (res, Context) => {
        return value => (
          <Context.Consumer>
            {contextValue => res({
              ...value,
              ...contextValue,
            })
            }
          </Context.Consumer>
        );
      }, value => children(value));

      return renderer({});
    }
  };
}

/**
 * Extracts all of the canonical objects from provided extension. This function will
 * return an object that has exported canonical type object assigned to it name
 * prefixed with extension name e.g.
 * {
 *  extension1.canonicalName: canonicalValue,
 *  ...
 * }
 * @param extension The extension installed in app,
 * @param extensionName The name of installed extension
 * @returns {*} The screens object.
 */
export function extractCanonicalObjectsFromExtensions(segment, extension, extensionName) {
  const segmentData = {};

  if (extension[segment]) {
    for (const segmentName of Object.keys(extension[segment])) {
      segmentData[`${extensionName}.${segmentName}`] = extension[segment][segmentName];
    }
  }

  return segmentData;
}

/**
 * Extracts all of the canonical objects from provided extensions. This function will
 * return an object that has exported canonical type object assigned to it name
 * prefixed with extension name e.g.
 * {
 *  extension1.canonicalName: canonicalValue,
 *  ...
 * }
 * @param appContext The context configured through the builder API
 * @returns {*} The screens object.
 */

export function getApplicationCanonicalObject(segment, appContext) {
  return Object.keys(appContext.extensions).reduce((prevResult, extensionName) => {
    const extension = appContext.extensions[extensionName];
    const segments = extractCanonicalObjectsFromExtensions(segment, extension, extensionName);
    return Object.assign(prevResult, segments);
  }, {});
}
