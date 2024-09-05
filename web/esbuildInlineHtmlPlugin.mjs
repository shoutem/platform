import fs from 'fs';
import mustache from 'mustache';
import path from 'path';

// Plugin to inline JS and CSS into HTML
const inlineAssetsPlugin = options => {
  const { htmlTemplate, outputDir } = options;

  return {
    name: 'inline-assets',
    setup(build) {
      build.onEnd(() => {
        try {
          const jsFilePath = path.join(outputDir, 'index.web.js');
          const cssFilePath = path.join(outputDir, 'index.web.css');

          const jsContent = fs.existsSync(jsFilePath)
            ? fs.readFileSync(jsFilePath, 'utf8')
            : '';
          const cssContent = fs.existsSync(cssFilePath)
            ? fs.readFileSync(cssFilePath, 'utf8')
            : '';

          const template = fs.readFileSync(htmlTemplate, 'utf8');

          const data = {
            injectedCSS: cssContent,
            injectedJS: jsContent,
          };

          const outputHtmlContent = mustache.render(template, data);

          const outputHtmlPath = path.join(outputDir, 'index.html');
          fs.writeFileSync(outputHtmlPath, outputHtmlContent, 'utf8');

          console.log('Inlining complete!');
        } catch (error) {
          console.error('Error during inlining:', error);
        }
      });
    },
  };
};

export default inlineAssetsPlugin;
