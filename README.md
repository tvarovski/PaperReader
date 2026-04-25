# Paper Reader Chrome Extension

## Description

This Chrome extension helps you read scientific papers by keeping track of abbreviations. When you highlight an abbreviation on a website, the extension will remind you of its full meaning.

This is based on an older version of the Chrome extension APIs and may need updates to work with the latest versions of Chrome.

## How it Works

The extension injects scripts into web pages to find and identify abbreviations. When you highlight a potential abbreviation, it displays the definition.

## Manifest Version

This extension uses Manifest V2, which is deprecated and no longer supported in recent versions of Chrome. To ensure the extension works and can be published to the Chrome Web Store, you should update the `manifest.json` to Manifest V3. You can find the official migration guide [here](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/).

## How to Package the Extension for Chrome

To package this extension, you will create a `.crx` file, which is the distributable format for Chrome extensions. During the initial packaging process, a private key file (`.pem`) will also be generated.

### What is the Private Key (`.pem` file)?

When you pack an extension for the first time, Chrome generates a `.pem` file. This is your private key, and it's crucial for maintaining and updating your extension.

-   **Extension ID**: The key is used to generate a consistent ID for your extension.
-   **Updates**: To publish an update to an existing extension, you **must** use the same private key. If you lose the key, you will not be able to update your extension. You would have to submit it as a new extension, which will have a different ID and will not automatically update for your existing users.
-   **Security**: Keep your `.pem` file in a safe and private place. Do not share it publicly. It's recommended to back it up.

### Packaging Steps

1.  **Open Chrome Extensions Page**: Open Google Chrome and navigate to `chrome://extensions`.

2.  **Enable Developer Mode**: If it's not already enabled, turn on the "Developer mode" toggle, which is usually in the top-right corner of the page.

3.  **Pack Extension**:
    -   Click the "Pack extension" button.
    -   In the "Extension root directory" field, browse and select the folder containing your extension's files (e.g., `manifest.json`, `content.js`, etc.).
    -   **Private key file (for updates)**:
        -   **First time packaging**: Leave the "Private key file" field empty. Chrome will generate a new `.crx` file and a `.pem` private key file. Save the `.pem` file in a secure location outside of the project directory.
        -   **Updating an existing extension**: If you are updating an extension you've packed before, you must provide the path to the original `.pem` file you saved.

4.  **Create the Package**: Click the "Pack extension" button in the dialog.

Chrome will create a `.crx` file. You can then distribute this file or upload it to the Chrome Web Store. You will also see the generated `.pem` file if it was the first time packing.