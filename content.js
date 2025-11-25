(function() {
  'use strict';

  const PROCESSED_ATTR = 'data-cursor-link-added';

  function getTweetText(tweetElement) {
    const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (!textElement) return null;
    return textElement.textContent.trim();
  }

  function createCursorLink(tweetText) {
    const encodedText = encodeURIComponent(tweetText);
    const deepLink = `cursor://anysphere.cursor-deeplink/prompt?text=${encodedText}`;

    const separator = document.createElement('span');
    separator.className = 'cursor-link-separator';
    separator.textContent = ' · ';

    const link = document.createElement('a');
    link.href = deepLink;
    link.className = 'cursor-link';
    link.textContent = 'Apply in Cursor';
    link.title = 'Open this tweet in Cursor';

    const container = document.createElement('span');
    container.className = 'cursor-link-container';
    container.appendChild(separator);
    container.appendChild(link);

    return container;
  }

  function findDateViewsRow(tweetElement) {
    // Find the time element and get its parent container
    const timeElement = tweetElement.querySelector('time[datetime]');
    if (!timeElement) return null;

    // Navigate up to find the row containing date and views
    // The structure is: div > a (containing time) > ... > div (row with views)
    let parent = timeElement.closest('a');
    if (!parent) return null;

    // Get the container div that holds the date link and views
    const rowContainer = parent.closest('div[class*="r-1d09ksm"]');
    if (rowContainer) return rowContainer;

    // Fallback: find parent with the views text
    parent = timeElement.parentElement;
    while (parent && parent !== tweetElement) {
      if (parent.textContent.includes('Views') || parent.textContent.includes('View')) {
        return parent;
      }
      parent = parent.parentElement;
    }

    return null;
  }

  function processTweet(tweetElement) {
    if (tweetElement.hasAttribute(PROCESSED_ATTR)) return;

    const tweetText = getTweetText(tweetElement);
    if (!tweetText) {
      tweetElement.setAttribute(PROCESSED_ATTR, 'no-text');
      return;
    }

    const dateViewsRow = findDateViewsRow(tweetElement);
    if (!dateViewsRow) {
      // Fallback: try to inject after the views count
      const viewsSpan = tweetElement.querySelector('span[class*="r-1cwl3u0"]');
      if (viewsSpan && viewsSpan.textContent.includes('View')) {
        const cursorLink = createCursorLink(tweetText);
        viewsSpan.parentElement.appendChild(cursorLink);
        tweetElement.setAttribute(PROCESSED_ATTR, 'true');
      }
      return;
    }

    const cursorLink = createCursorLink(tweetText);
    dateViewsRow.appendChild(cursorLink);
    tweetElement.setAttribute(PROCESSED_ATTR, 'true');
  }

  function processAllTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(processTweet);
  }

  // Initial processing
  processAllTweets();

  // Watch for dynamically loaded tweets (infinite scroll)
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      processAllTweets();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
