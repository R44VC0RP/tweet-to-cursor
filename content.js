(function() {
  'use strict';

  const PROCESSED_ATTR = 'data-cursor-link-added';

  function getTweetText(tweetElement) {
    const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (!textElement) return null;
    return textElement.textContent.trim();
  }

  function getThreadContext(tweetElement) {
    // Collect all tweets in the thread above this one
    const threadTweets = [];

    // Get the cell/container that holds this tweet
    const cellInnerDiv = tweetElement.closest('[data-testid="cellInnerDiv"]');
    if (!cellInnerDiv) return [];

    // Look for previous sibling cells that are part of the thread
    let prevCell = cellInnerDiv.previousElementSibling;
    while (prevCell) {
      const prevTweet = prevCell.querySelector('article[data-testid="tweet"]');
      if (prevTweet) {
        const text = getTweetText(prevTweet);
        if (text) {
          threadTweets.unshift(text); // Add to beginning to maintain order
        }
      }
      prevCell = prevCell.previousElementSibling;
    }

    return threadTweets;
  }

  function formatThreadContent(threadContext, currentTweetText) {
    if (threadContext.length === 0) {
      return currentTweetText;
    }

    // Format as a thread with clear separation
    let content = '--- Thread Context ---\n\n';
    threadContext.forEach((text, index) => {
      content += `[${index + 1}] ${text}\n\n`;
    });
    content += '--- Current Tweet ---\n\n';
    content += currentTweetText;

    return content;
  }

  function createCursorLink(tweetText, threadContext = []) {
    const fullContent = formatThreadContent(threadContext, tweetText);
    const encodedText = encodeURIComponent(fullContent);
    const deepLink = `cursor://anysphere.cursor-deeplink/prompt?text=${encodedText}`;

    const separator = document.createElement('span');
    separator.className = 'cursor-link-separator';
    separator.textContent = ' · ';

    const link = document.createElement('a');
    link.href = deepLink;
    link.className = 'cursor-link';
    link.textContent = 'Cursor';
    link.title = threadContext.length > 0
      ? `Open with ${threadContext.length} parent tweet(s) in Cursor`
      : 'Open in Cursor';

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

    // Get thread context (parent tweets)
    const threadContext = getThreadContext(tweetElement);

    const dateViewsRow = findDateViewsRow(tweetElement);
    if (!dateViewsRow) {
      // Fallback: try to inject after the views count
      const viewsSpan = tweetElement.querySelector('span[class*="r-1cwl3u0"]');
      if (viewsSpan && viewsSpan.textContent.includes('View')) {
        const cursorLink = createCursorLink(tweetText, threadContext);
        viewsSpan.parentElement.appendChild(cursorLink);
        tweetElement.setAttribute(PROCESSED_ATTR, 'true');
      }
      return;
    }

    const cursorLink = createCursorLink(tweetText, threadContext);
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
