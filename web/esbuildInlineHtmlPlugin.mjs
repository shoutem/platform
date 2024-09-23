import fs from 'fs';
import mustache from 'mustache';
import path from 'path';

// Plugin to inline JS and CSS into HTML
const inlineAssetsPlugin = options => {
  const { htmlTemplate, outputDir, production = true } = options;

  return {
    name: 'inline-assets',
    setup(build) {
      build.onEnd(async () => {
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

          let outputHtmlContent;

          if (production) {
            // In production, inline JS and CSS
            const data = {
              injectedCSS: cssContent,
              injectedJS: jsContent,
            };
            outputHtmlContent = mustache.render(template, data);
          } else {
            // In development, use script and link tags
            outputHtmlContent = template
              .replace(
                /<script>\s*{{{injectedJS}}}\s*<\/script>/,
                `<script src="index.web.js"></script>`,
              )
              .replace(
                /<style>\s*{{{injectedCSS}}}\s*<\/style>/,
                `<link rel="stylesheet" href="index.web.css">`,
              );
          }

          const outputHtmlPath = path.join(outputDir, 'index.html');
          fs.writeFileSync(outputHtmlPath, outputHtmlContent, 'utf8');

          if (production) {
            await Promise.all([
              fs.promises.unlink(jsFilePath).catch(() => {}),
              fs.promises.unlink(cssFilePath).catch(() => {}),
            ]);
          }

          console.log('Inlining complete!');
        } catch (error) {
          console.error('Error during inlining:', error);
        }
      });
    },
  };
};

export default inlineAssetsPlugin;
