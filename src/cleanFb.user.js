// ==UserScript==
// @name         Clean Fb
// @namespace    https://github.com/houcheng/clean-fb-space
// @version      0.12
// @description  Clean facebook AD blocks
// @author       Kevin Yang, Houcheng Lin
// @grant        GM_addStyle
// @include      /https:\/\/www.facebook.com
// @downloadURL  https://github.com/houcheng/clean-fb-space/raw/master/src/cleanFb.user.js
// ==/UserScript==


var deletedTitles = [];
var userKeywords = [];

function displayDeletedTitles() {
    // Create a modal or div to display the titles
    const modal = document.createElement('div');
    modal.style = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 2000; max-height: 300px; overflow-y: scroll;';
    modal.innerHTML = '<h2>Deleted Titles</h2><ul>' + deletedTitles.map(title => `<li>${title}</li>`).join('') + '</ul>';
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };
    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    // Click outside the modal to close
    modal.onclick = function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
}


function createBannerNode() {
    const node = document.createElement ('div');
    node.innerHTML = '';
    node.setAttribute ('id', 'myContainer');
    document.body.appendChild (node);
    // Add style for the container
    GM_addStyle(`
        #myContainer {
            position: fixed;
            bottom: 0;
            right: 64px;
            font-size: 12px;
            background: orange;
            border: 3px outset black;
            margin: 5px;
            opacity: 0.9;
            z-index: 1100;
            width: 300px;
            padding: 5px;
            display: flex;
            flex-direction: column; /* Organize child elements in a column */
        }
        #myContainer > * {
            margin-bottom: 3px; /* Spacing between rows */
            cursor: pointer;
        }
        .buttonRow {
            display: flex; /* Flex layout for buttons */
            gap: 5px; /* Gap between buttons */
        }
        #myButton {
            cursor: pointer;
        }
        #myContainer p {
            color: red;
            background: white;
        }
        .inputRow {
            display: flex; /* Flex layout for buttons */
            gap: 5px; /* Gap between buttons */
        }
    `);

    const titleNode = document.createElement('div');
    node.appendChild(titleNode);

    // Create a div for buttons
    const buttonRow = document.createElement('div');
    buttonRow.classList.add('buttonRow');

    // Button to show deleted titles
    const showTitlesBtn = document.createElement('button');
    showTitlesBtn.innerHTML = 'Deleted Titles';
    showTitlesBtn.onclick = () => {
        displayDeletedTitles();
    };
    buttonRow.appendChild(showTitlesBtn);

    // Button to show deleted titles
    const debugBtn = document.createElement('button');
    debugBtn.innerHTML = 'Debug';
    debugBtn.onclick = () => {
        debugNode = true;
    };
    buttonRow.appendChild(debugBtn);

    // Button to hide
    const hideBtn = document.createElement('button');
    hideBtn.innerHTML = 'Hide';
    hideBtn.onclick = () => {
        node.style.display = 'none'; // Hide the entire banner
        const dot = document.createElement('div');
        dot.setAttribute('id', 'restoreDot');
        dot.style = 'position: fixed; bottom: 10px; right: 10px; width: 10px; height: 10px; background: red; border-radius: 50%; cursor: pointer; z-index: 2001;';
        dot.onclick = () => {
            node.style.display = 'block'; // Restore the banner
            document.body.removeChild(dot); // Remove the dot
        };
        document.body.appendChild(dot);
    };
    buttonRow.appendChild(hideBtn);

    // Input row for keyword filtering
    const inputRow = document.createElement('div');
    inputRow.classList.add('inputRow');

    // Input field for keywords
    const keywordInput = document.createElement('input');
    keywordInput.setAttribute('type', 'text');
    keywordInput.setAttribute('placeholder', 'user keywords');
    inputRow.appendChild(keywordInput);

    // Button to apply keyword filtering
    const applyButton = document.createElement('button');
    applyButton.innerHTML = 'Apply';
    applyButton.onclick = () => {
        userKeywords = keywordInput.value.split(';').map(k => k.trim());
    };
    inputRow.appendChild(applyButton);

    // node.append(buttonRow);
    // node.appendChild(inputRow);
    node.onclick = () => {
        node.appendChild(buttonRow);
        node.appendChild(inputRow);
    }

    return node;
}

const bannerNode = createBannerNode();
const CheckInterval = 3000;
const NeedToRemoveKeywords = ['為你推薦', 'Suggested for you', '贊助', 'Sponsored', 'Reels and short videos', 'Follow', 'Join'];

var lastRunTick = (new Date()).getTime();
var removedCount = 0;
var debugNode = false;

function findPostsParentBySize(rootNode) {
    let largestNode = null;
    let largestSize = 0;

    function traverse(node) {
        if (node.offsetWidth > 0 && node.offsetHeight > 0) {
            const size = node.offsetWidth * node.offsetHeight;
            if (size > largestSize || (size === largestSize && node.children.length > 1)) {
                largestSize = size;
                largestNode = node;
            }
        }
        Array.from(node.children).forEach(traverse);
    }

    traverse(rootNode);
    return largestNode;
}

function detectKeywords(node) {
    if (debugNode) console.log("inner html", node.innerHTML);
    if (!node.innerHTML) return false;
    const keywords = userKeywords.length > 0 ? NeedToRemoveKeywords.concat(userKeywords) : NeedToRemoveKeywords;
    const spans = node.querySelectorAll('span');
    return Array.from(spans).some(span => keywords.some(keyword => span.innerText.includes(keyword)));
}

function simulateHoverOld(element) {
    console.log("Send event to", element);

    // Create and dispatch mouseenter event
    const mouseenterEvent = new MouseEvent('mouseenter', {
        'bubbles': true,
        'cancelable': true
    });
    element.dispatchEvent(mouseenterEvent);

    // Create and dispatch mouseover event
    const mouseoverEvent = new MouseEvent('mouseover', {
        'bubbles': true,
        'cancelable': true
    });
    element.dispatchEvent(mouseoverEvent);
    
    const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: element.getBoundingClientRect().left,
        clientY: element.getBoundingClientRect().top
    });
    element.dispatchEvent(mousemoveEvent);    
    const mouseexitEvent = new MouseEvent('mouseleave', {
        'bubbles': true,
        'cancelable': true
    });
    element.dispatchEvent(mouseexitEvent);
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Mainly simulate the blur event, as see a lot of blur event handlers are defined in DEVTOOLS.
// TODO: Only simulate on the link.href with __cft__
function simulateHover(element) {
    // Prevents simulating events changes the scrollbar position
    if (!isInViewport(element)) {
        return;
    }

    // Array of events to simulate
    const events = [
        // 'mouseenter',
        // 'mouseover',
        // 'mousemove',
        'focus',      // Added focus event
        'focusin'     // Added focusin event
    ];

    // Dispatch all events
    events.forEach(eventType => {
        const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            clientX: element.getBoundingClientRect().left,
            clientY: element.getBoundingClientRect().top
        });
        element.dispatchEvent(event);
    });

    const focusEvents = [
        'focus',
        'focusin',
        'focusout',
    ];
    focusEvents.forEach(eventType => {
        const event = new FocusEvent(eventType, {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    });
    // For focus events, we need to use FocusEvent instead of MouseEvent
    /* const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(focusEvent); */

    // You might also want to focus the element directly
    /* if (element.focus) {
        element.focus();
    } */
}

stopRemove = false;
function detectAdSpanWithLink(post, callback) {
    const childSpans = post.querySelectorAll('span');
    for (const span of childSpans) {
        if (span.offsetWidth < 100 && span.offsetHeight < 30 && span.offsetHeight > 0 && span.offsetWidth > 0) {
            const links = span.querySelectorAll('a');
            if (links && links.length && links[0].href.includes('/ads/about/')) {
                callback();
            }
            for (const link of links) {
                if (link.href && link.href.includes('/ads/about/')) {
                    // callback();
                // }
                // Too many
                // if (link.href && link.href.startsWith('https://www.facebook.com/?__cft__')) {
                //    console.log("delete link.href", link.href);
                //    return true;
                } else if (link.href && link.href.startsWith('https://www.facebook.com/?__cft__') && !stopRemove) {
                    // If there's a link but it's not our target AD URL,
                    // simulate hover and check again after a small delay
                    // simulateHover(span);
                    simulateHover(link);
                    setTimeout(() => {
                        // Recheck the link after hover simulation
                        const updatedLinks = span.querySelectorAll('a');
                        if (updatedLinks && updatedLinks.length && updatedLinks[0].href.includes('/ads/about/')) {
                            callback();
                        }
            
                        /* for (const updatedLink of updatedLinks) {
                            if (updatedLink.href && updatedLink.href.includes('/ads/about/')) {
                                console.log("remove after simulate hover", span);
                                callback();
                                stopRemove = true;
                            }
                        } */
                    }, 100);
                }
            }
        }
    }
    return false;
}

function removeRecommandPost() {
    var nowTick = (new Date()).getTime();
    if (nowTick - lastRunTick < CheckInterval) return;
    lastRunTick = nowTick;
    console.log('removeRecommandPost');

    const rootNodes = document.querySelectorAll('h3');
    rootNodes.forEach((h3) => {
        if (h3.innerText === "News Feed posts") {
            const rootNode = h3.parentElement; // Get the parent element of the h3
            if (rootNode) {
                const postsParent = findPostsParentBySize(rootNode);
                if (postsParent) {
                    const children = Array.from(postsParent.children);
                    children.forEach((child) => {
                        var removeChild = () => {
                            // console.log('Remove:', child.innerText);
                            removedCount += 1;
                            const lines = child.innerText ? child.innerText.split('\n') : [];
                            const title = lines.filter(line => line !== "Facebook")[0] || "no-name";
                            const msg = title;
                            // console.log(`<div>${removedCount} ${msg}</div>`);
                            deletedTitles.push(`${removedCount} ${msg}`);
                            bannerNode.childNodes[0].innerHTML = `<div>${removedCount} ${msg}</div>`;
                            child.remove();
                        };

                        
                        if (child.innerText && child.innerText.startsWith("連續短片和短片")) {
                            removeChild();
                        } else if (detectKeywords(child)) {
                            removeChild();
                        } else {
                            detectAdSpanWithLink(child, removeChild);
                        }
                    });
                }
            }
        }
    });
    if (debugNode) debugNode = false;
    lastRunTick = nowTick;
}

function printH3Titles() {
    document.querySelectorAll('h3').forEach((h3) => {
        console.log('H3 Title:', h3.innerText);
    });
}

function executeActions() {
    removeRecommandPost();
    // printH3Titles();
    setTimeout(() => executeActions(), 1000);
}


(function () {
    'use strict';
    // Your code here...
    executeActions();
})();
