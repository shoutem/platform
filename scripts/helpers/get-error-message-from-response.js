'use strict';
const _ = require('lodash');

function getErrorMessageFromResponse(response) {
  let body = '';

  try {
    body = JSON.parse(_.get(response, 'body'));
  } catch (e) {
    body = {
      errors: [
        {
          title: 'Invalid JSON file',
          detail: '',
        },
      ],
    };
  }

  if (_.isEmpty(body) || _.isEmpty(body.errors)) {
    return '';
  }

  return _.reduce(
    body.errors,
    (message, error) => `${message}${error.title} ${error.detail}`,
    '',
  );
}

module.exports = getErrorMessageFromResponse;
