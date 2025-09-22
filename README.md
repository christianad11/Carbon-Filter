# Carbon Filter

A Chrome extension that protects your privacy by masking sensitive information on web pages.

## Features

- **Toggle Protection** - Enable/disable privacy protection with a simple switch
- **Selective Masking** - Choose which types of data to mask:
  - 📧 Email addresses
  - 📱 Phone numbers
  - 💳 Credit card numbers
  - 🔐 Social Security Numbers (SSN)
- **Custom Text** - Add your own text to hide
- **Real-time Updates** - Changes apply immediately without page refresh
- **Hover to Reveal** - Hover over masked text to see the original content

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Carbon Filter icon (🌿) will appear in your toolbar

## Usage

### Basic Usage

1. **Click the extension icon** in your toolbar
2. **Toggle "Privacy Protection"** to enable/disable
3. **Check/uncheck field types** to choose what to mask
4. **Add custom text** in the "Custom Text to Hide" section

### Field Types

- **Email** - Masks email addresses (e.g., `john@example.com`)
- **Phone** - Masks phone numbers (e.g., `(555) 123-4567`)
- **Credit Card** - Masks credit card numbers (e.g., `4532 1234 5678 9012`)
- **SSN** - Masks Social Security Numbers (e.g., `123-45-6789`)

### Custom Text

- **Add custom text** - Enter any text you want to hide
- **Remove custom text** - Click the × button next to any custom text
- **Case sensitive** - Custom text matching is case-sensitive

## Visual Indicators

Different data types are masked with different colored bars:

- **Email** - Red bars
- **Phone** - Teal bars
- **Credit Card** - Blue bars
- **SSN** - Green bars
- **Custom Text** - Gray bars

## Testing

Open `test.html` in your browser to test the extension with sample data.

## File Structure

```
carbon-chrome-sanitizer/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script (main functionality)
├── popup.html            # Extension popup interface
├── popup.js              # Popup controller
├── styles.css            # Styling for masks and popup
├── test.html             # Test page with sample data
└── icons/                # Extension icons
    ├── icon16.svg
    ├── icon48.svg
    └── icon128.svg
```

## How It Works

1. **Content Script** - Injected into web pages to scan for sensitive data
2. **Pattern Matching** - Uses regular expressions to identify data types
3. **DOM Manipulation** - Replaces text nodes with masked spans
4. **Storage** - Saves your preferences using Chrome's local storage
5. **Real-time Updates** - Listens for setting changes and updates immediately

## Privacy

- **No data collection** - All processing happens locally in your browser
- **No external requests** - No data is sent to external servers
- **Local storage only** - Settings are stored locally on your device

## Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## Development

### Building from Source

1. Clone the repository
2. No build process required - the extension runs directly from source
3. Load as unpacked extension in Chrome

### Key Files

- **`content.js`** - Main masking logic and pattern matching
- **`popup.js`** - User interface and settings management
- **`background.js`** - Extension lifecycle and badge updates
- **`manifest.json`** - Extension permissions and configuration

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the browser console for any error messages or create an issue in the repository.