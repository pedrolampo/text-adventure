const textElement = document.getElementById('text');
const optionButtonsElement = document.getElementById('option-buttons');
const healthPointsElement = document.getElementById('hp');
const coinAmountElement = document.getElementById('coinAmount');
const inventoryElement = document.getElementById('inventory-list');

var typingl = 0;
var speed = 40;

async function typeWriter() {
    return await new Promise((resolve) => {
        if (typingl < baseText.length) {
            textElement.innerHTML += baseText.charAt(typingl);
            typingl++;
            setTimeout(typeWriter, speed);
        } else {
            optionButtonsElement.style.opacity = 1;
            optionButtonsElement.style.pointerEvents = 'all';
            optionButtonsElement.style.userSelect = 'default';
            resolve(true);
        }
    });
}

let state = localStorage.getItem('inventory')
    ? JSON.parse(localStorage.getItem('inventory'))
    : {};
let healthPoints = localStorage.getItem('HP')
    ? localStorage.getItem('HP')
    : 100;
let coins = localStorage.getItem('coins') ? localStorage.getItem('coins') : 25;

function startGame() {
    updateHP();
    updateCoins();
    showInventory();
    localStorage.getItem('instance')
        ? showTextNode(Number(localStorage.getItem('instance')))
        : showTextNode(1);
}

function restartGame() {
    localStorage.clear();
    healthPoints = 100;
    coins = 25;
    state = {};
    startGame();
}

function updateHP() {
    healthPointsElement.innerHTML = `${healthPoints} HP`;
}

function updateCoins() {
    coinAmountElement.innerText = `${coins} G`;
}

function showTextNode(textNodeIndex) {
    const textNode = textNodes.find(
        (textNode) => textNode.id === textNodeIndex
    );
    textElement.innerText = '';
    baseText = textNode.text;
    typingl = 0;
    optionButtonsElement.style.opacity = 0;
    optionButtonsElement.style.pointerEvents = 'none';
    optionButtonsElement.style.userSelect = 'none';
    while (optionButtonsElement.firstChild) {
        optionButtonsElement.removeChild(optionButtonsElement.firstChild);
    }
    typeWriter();
    showButtons(textNode);
}

function showButtons(btnx) {
    btnx.options.forEach((option) => {
        if (showOption(option)) {
            const button = document.createElement('button');
            button.innerText = option.text;
            button.classList.add('btn');
            button.addEventListener('click', () => selectOption(option));
            optionButtonsElement.appendChild(button);
        }
    });
}

function showInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory'));

    if (inventory) {
        for (const item in inventory) {
            if (inventory[item] === true) {
                const itemListed = document.createElement('li');
                itemListed.innerText = `- ${item.toUpperCase()}`;
                inventoryElement.appendChild(itemListed);
            }
            inventoryElement.childNodes.forEach((el) => {
                if (inventory[item] === false) {
                    el.remove();
                }
            });
        }
    }
}

function saveGame(instance) {
    localStorage.setItem('HP', healthPoints);
    localStorage.setItem('coins', coins);
    localStorage.setItem('inventory', JSON.stringify(state));
    localStorage.setItem('instance', instance);
}

function showOption(option) {
    return option.requiredState == null || option.requiredState(state);
}

function selectOption(option) {
    const nextTextNodeId = option.nextText;
    if (nextTextNodeId <= 0) {
        return restartGame();
    }
    state = Object.assign(state, option.setState);
    if (option.setHealth) {
        if (option.setHealth > 0) healthPoints += option.setHealth;
        else healthPoints -= option.setHealth.toString().substring(1);
    }
    if (option.setCoins) {
        if (option.setCoins > 0) coins += option.setCoins;
        else coins -= option.setCoins.toString().substring(1);
    }
    updateHP();
    updateCoins();
    saveGame(nextTextNodeId);
    showInventory();
    showTextNode(nextTextNodeId);
}

const textNodes = [
    {
        id: 1,
        text: "Here I'm going to tell you an awesome story some day! But first, take something for free.",
        options: [
            {
                text: 'Take a free sword!',
                setState: { sword: true },
                nextText: 2,
            },
            {
                text: 'Have extra coins!',
                nextText: 2,
                setCoins: 20,
            },
            {
                text: 'Want more Health?',
                nextText: 2,
                setHealth: 5,
            },
        ],
    },
    {
        id: 2,
        text: "Those were some nice options you had. But now it's time to make some real ones, you see a caravan ahead.",
        options: [
            {
                text: 'Train with your brand new sword',
                requiredState: (currentState) => currentState.sword,
                nextText: 3,
                setCoins: -5,
            },
            {
                text: 'Trade your sword for an old shield with the Merchant at the tent',
                requiredState: (currentState) => currentState.sword,
                setState: { sword: false, shield: true },
                nextText: 4,
                setCoins: 10,
            },
            {
                text: 'Walk past the caravan and ignore everyone like you are some sort of God',
                nextText: 5,
            },
        ],
    },
    {
        id: 3,
        text: "After a hard session of training, you now feel like you could take anyone, like that one big guy over there. Yes the one that's 6.5 ft. tall.",
        options: [
            {
                text: 'Face him in battle!',
                nextText: 6,
                setHealth: -100,
            },
        ],
    },
    {
        id: 4,
        text: "This old shield looks rather solid. It might come in handy later on. But this is all I've got for you right now. Thank you!",
        options: [
            {
                text: 'Restart',
                nextText: -1,
            },
        ],
    },
    {
        id: 5,
        text: "This is probably the smarter option. But who knows! Thank you for playing, I'm making the story as you play this beta version.",
        options: [
            {
                text: 'Restart',
                nextText: -1,
            },
        ],
    },
    {
        id: 6,
        text: "Okay. This was not a good idea. He didn't even draw his sword, just beat you with one bare hand. I think you gotta train a little more.",
        options: [
            {
                text: 'Restart',
                nextText: -1,
            },
        ],
    },
];

startGame();
