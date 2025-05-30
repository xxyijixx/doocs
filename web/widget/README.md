# Support Chat Widget

This directory contains the source code for the support chat widget. This widget is designed to be embedded in any web page to provide a chat interface for users to interact with a support agent.

## Project Structure

- `src/index.js`: The main entry point for the widget's JavaScript code.
- `webpack.config.js`: Webpack configuration for bundling the widget.
- `dist/`: Output directory for the bundled JavaScript file (`bundle.js`).

## Building the Widget

To build the widget, navigate to this directory (`web/widget`) in your terminal and run the following commands:

1.  Install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

2.  Build the project using Webpack:
    ```bash
    npx webpack
    ```
    This will generate the bundled JavaScript file `bundle.js` in the `dist/` directory.

## Including the Widget in Your Web Page

To include the widget in your web page, add a `<script>` tag pointing to the generated `bundle.js` file. You can place this tag in the `<head>` or `<body>` of your HTML file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Application</title>
</head>
<body>
    <h1>Welcome to My Application</h1>

    <!-- Include the chat widget script -->
    <!-- Make sure the path is correct -->
    <script src="/path/to/your/dist/bundle.js"></script>

    <script>
        // Initialize the chat widget after the script is loaded
        document.addEventListener('DOMContentLoaded', () => {
            if (window.SupportChatWidget) {
                window.SupportChatWidget.init({
                    baseUrl: 'http://your-backend-url', // Replace with your backend API base URL
                    source: 'your-app-name' // Replace with an identifier for your application
                });
            } else {
                console.error('SupportChatWidget not found. Make sure bundle.js is loaded correctly.');
            }
        });
    </script>

    <p>Your page content goes here.</p>
</body>
</html>
```

Replace `/path/to/your/dist/bundle.js` with the actual path to the `bundle.js` file on your server or file system.
Replace `'http://your-backend-url:port'` with the base URL of your backend API.
Replace `'your-app-name'` with a string that identifies the source of the chat session (e.g., 'website', 'dashboard', etc.).

## Configuration Options

The `window.SupportChatWidget.init()` function accepts an options object with the following properties:

- `baseUrl` (string): The base URL of the backend API. **Required**.
- `source` (string): An identifier for the source of the chat session. Defaults to `'widget'`.

## Development

During development, you can use webpack's watch mode to automatically rebuild the `bundle.js` file whenever you make changes to the source code:

```bash
npx webpack --watch
```

This allows for faster iteration while developing the widget."
","rewrite":true}}}