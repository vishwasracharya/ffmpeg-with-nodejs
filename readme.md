## STEPS TO RUN THIS FILE

1. git clone https://github.com/vishwasracharya/ffmpeg-with-nodejs.git
2. npm install
3. Add the appropriate Keys to the .env file, or add a keys.js file for environment variables.
3. npm run dev
4. See Live in Browser at http://localhost:3002

🎉

## Environment Variables
- site_url - The URL of the site.
- main_url - The URL of the main site. (If this code is used for backend API only, then this can be the url of the frontend site).

## Gulp
- Gulp is a task runner for Node.js. It is a tool for building, bundling, and packaging your client-side JavaScript and CSS files. It is a tool for managing your projects.
- In this project I used to minify JS, CSS and Obfuscate the JS, so that no one can see the code. when they are in production.
- Also used gulp-purgecss plugin to remove unused CSS. So that It can be fast to load in the browser. It is a tool for removing unused CSS from your project