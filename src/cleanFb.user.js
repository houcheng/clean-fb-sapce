// ==UserScript==
// @name         Clean Fb
// @namespace    https://github.com/houcheng/CleanFBSapce
// @version      0.12
// @description  清除FB
// @author       Kevin Yang, Houcheng Lin
// @grant        GM_addStyle
// @include      /https:\/\/www.facebook.com
// @downloadURL  https://github.com/houcheng/CleanFBSapce/raw/master/src/cleanFb.user.js
// ==/UserScript==


var deletedTitles = [];
var userKeywords = [];

function displayDeletedTitles() {
    // Create a modal or div to display the titles
    const modal = document.createElement('div');
    modal.style = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 2000; max-height: 300px; overflow-y: scroll;';
    modal.innerHTML = '<h2>Deleted Titles</h2><ul>' + deletedTitles.map(title => `<li>${title}</li>`).join('') + '</ul>';
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
    showTitlesBtn.innerHTML = 'Show';
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
const NeedToRemoveKeywords = ['為你推薦', 'Suggested for you', '贊助', 'Sponsored', 'Reels and short videos', 'Follow'];

var lastRunTick = (new Date()).getTime();
var removedCount = 0;
var debugNode = false;

function checkKeywordsExist(node) {
    if (debugNode) console.log("inner html", node.innerHTML);
    if (!node.innerHTML) return false;
    const keywords = userKeywords.length > 0 ? NeedToRemoveKeywords.concat(userKeywords) : NeedToRemoveKeywords;
    return keywords.some((lang) => node.innerHTML.contains('dir="auto">' + lang + '</span>')) || keywords.some((lang) => node.innerHTML.contains('">' + lang + '<')) ;
}

function checkKeywordExistBySpan(node){
    const id = node.querySelector('div[role=article]')?.getAttribute('aria-describedby')?.split(' ')[0];
    if(id == null) return false;
    const span = node.querySelector(`span[id='${id}']`);
    const keywords = userKeywords.length > 0 ? NeedToRemoveKeywords.concat(userKeywords) : NeedToRemoveKeywords;
    return span && span.innerHTML && keywords.some((lang) => span.innerHTML.contains(lang));
}

function removeRecommandPost() {
    var nowTick = (new Date()).getTime();
    if (nowTick - lastRunTick < CheckInterval) return;
    lastRunTick = nowTick;
    console.log('removeRecommandPost')

    document.querySelectorAll("div[data-pagelet*='FeedUnit_']").forEach((node) => {
        var shouldRemove = false;
        console.log(node.innerText)
        if (node.innerText && node.innerText.startsWith("連續短片和短片")) {
            shouldRemove = true;
        } else if (checkKeywordsExist(node)) {
            shouldRemove = true;
        } else if (checkKeywordExistBySpan(node)){
            shouldRemove = true;
        }

        if (shouldRemove) {
            removedCount += 1;
            const msg = node.innerText ? node.innerText.split('\n')[0] : "no-name";
            // bannerNode.innerHTML = `<div>${removedCount} ${msg}</div>`;
            console.log(`<div>${removedCount} ${msg}</div>`)
            deletedTitles.push(`${removedCount} ${msg}`);
            bannerNode.childNodes[0].innerHTML = `<div>${removedCount} ${msg}</div>`;
            node.remove();
        }
    });
    if (debugNode) debugNode = false;
    lastRunTick = nowTick;
}

function executeActions() {
    removeRecommandPost();
    setTimeout(()=> executeActions(), 1000);
}


(function () {
    'use strict';
    // Your code here...
    executeActions();
})();