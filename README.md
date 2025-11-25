# Tweet to Cursor

A Chrome extension that adds "Apply in Cursor" links to tweets on X/Twitter, allowing you to quickly send tweet content to Cursor IDE.

## Installation

1. Clone this repo or download the files
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `twitter-cursor-extension` folder

## Usage

When browsing x.com or twitter.com, you'll see an "Apply in Cursor" link next to the date/views on each tweet:

```
12:04 PM · Nov 25, 2025 · 6 Views · Apply in Cursor
```

Clicking the link opens Cursor with the tweet text pre-filled as a prompt.

## How it Works

The extension uses [Cursor deep links](https://docs.cursor.com/context/deep-links) to pass tweet content directly to Cursor:

```
cursor://anysphere.cursor-deeplink/prompt?text=<encoded_tweet_text>
```

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Injects links into tweets, handles infinite scroll
- `styles.css` - Styling to match Twitter's UI
