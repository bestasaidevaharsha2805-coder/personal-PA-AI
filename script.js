/* =========================================================
   PERSONAL AI ASSISTANT
   FRONTEND APPLICATION
========================================================= */

"use strict";


/* =========================================================
   APPLICATION STATE
========================================================= */

const DEFAULT_STATE = {
    assistantName: "Your Assistant",

    assistantPersonality:
        "Friendly, calm, professional and concise.",

    userName: "You",

    speakResponses: true,

    selectedVoice: "",

    memories: [],

    tasks: [],

    conversation: []
};


let state = loadState();

let recognition = null;

let isListening = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;


/* =========================================================
   WAKE WORD STATE
========================================================= */

let wakeWordMode = false;

let waitingForCommand = false;

let recognitionRestartTimer = null;

let wakeWordStatus = null;


const WAKE_WORDS = [
    "hey pa",
    "hey p a",
    "hey personal assistant",
    "hello pa"
];


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const appLoader = $("#appLoader");

const app = $("#app");

const sidebar = $("#sidebar");

const mobileMenuBtn =
    $("#mobileMenuBtn");

const pageTitle =
    $("#pageTitle");

const chatMessages =
    $("#chatMessages");

const chatForm =
    $("#chatForm");

const messageInput =
    $("#messageInput");

const typingIndicator =
    $("#typingIndicator");

const assistantStatus =
    $("#assistantStatus");

const assistantGreeting =
    $("#assistantGreeting");

const assistantSubtitle =
    $("#assistantSubtitle");

const messageAssistantName =
    $("#messageAssistantName");

const profileName =
    $("#profileName");

const profileAvatar =
    $("#profileAvatar");

const menuProfileName =
    $("#menuProfileName");

const menuProfileAvatar =
    $("#menuProfileAvatar");

const settingsModal =
    $("#settingsModal");

const confirmationModal =
    $("#confirmationModal");

const profileMenu =
    $("#profileMenu");

const notificationPanel =
    $("#notificationPanel");

const toastContainer =
    $("#toastContainer");

const memoryList =
    $("#memoryList");

const taskList =
    $("#taskList");

const voiceSelect =
    $("#voiceSelect");

const speechToggle =
    $("#speechToggle");

const settingsSpeechToggle =
    $("#settingsSpeechToggle");

const voiceStatus =
    $("#voiceStatus");

const recordingStatus =
    $("#recordingStatus");

const assistantNameInput =
    $("#assistantNameInput");

const assistantPersonalityInput =
    $("#assistantPersonalityInput");

const userNameInput =
    $("#userNameInput");

const connectionText =
    $("#connectionText");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {

    try {

        const saved =
            localStorage.getItem(
                "personalAIState"
            );

        if (!saved) {
            return structuredClone(
                DEFAULT_STATE
            );
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...structuredClone(
                DEFAULT_STATE
            ),
            ...parsed
        };

    } catch (error) {

        console.error(
            "Could not load saved state:",
            error
        );

        return structuredClone(
            DEFAULT_STATE
        );
    }
}


function saveState() {

    try {

        localStorage.setItem(
            "personalAIState",
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "Could not save state:",
            error
        );
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    applyProfile();

    initializeNavigation();

    initializeChat();

    initializeSettings();

    initializeProfileMenu();

    initializeNotifications();

    initializeMemory();

    initializeTasks();

    initializeVoice();

    initializeMobileMenu();

    initializeNewChat();

    initializeQuickActions();

    initializeConfirmation();

    setTimeout(() => {

        appLoader.classList.add(
            "fade-out"
        );

        app.classList.remove(
            "hidden"
        );

    }, 650);

    checkBackend();

    renderMemories();

    renderTasks();

    restoreConversation();
}


/* =========================================================
   PROFILE
========================================================= */

function applyProfile() {

    const name =
        state.assistantName ||
        DEFAULT_STATE.assistantName;

    const user =
        state.userName ||
        DEFAULT_STATE.userName;

    if (profileName) {
        profileName.textContent = user;
    }

    if (menuProfileName) {
        menuProfileName.textContent =
            user;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            getInitial(user);
    }

    if (menuProfileAvatar) {
        menuProfileAvatar.textContent =
            getInitial(user);
    }

    if (assistantGreeting) {

        assistantGreeting.textContent =
            `How can I help you, ${user}?`;
    }

    if (assistantSubtitle) {

        assistantSubtitle.textContent =
            "Ask me something, give me a task, or just start talking.";
    }

    if (messageAssistantName) {
        messageAssistantName.textContent =
            name;
    }

    updateAssistantNameInMessages();

    if (speechToggle) {
        speechToggle.checked =
            Boolean(
                state.speakResponses
            );
    }

    if (settingsSpeechToggle) {
        settingsSpeechToggle.checked =
            Boolean(
                state.speakResponses
            );
    }
}


function getInitial(name) {

    if (!name) {
        return "Y";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


function updateAssistantNameInMessages() {

    $$(".assistant-message .message-meta strong")
        .forEach((element) => {

            element.textContent =
                state.assistantName;
        });
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    $$(".nav-item").forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                switchView(view);

                closeMobileSidebar();
            }
        );
    });
}


function switchView(viewName) {

    $$(".nav-item").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.view ===
                viewName
        );
    });


    $$(".view").forEach((view) => {

        view.classList.toggle(
            "active-view",
            view.dataset.viewPanel ===
                viewName
        );
    });


    const titles = {

        chat: "Your Assistant",

        memory: "Memory",

        tasks: "Tasks & Reminders",

        voice: "Voice Studio",

        calls: "Calls"
    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[viewName] ||
            "Your Assistant";
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    if (!mobileMenuBtn) {
        return;
    }

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );
}


/* =========================================================
   CHAT
========================================================= */

function initializeChat() {

    if (!chatForm) {
        return;
    }


    chatForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const message =
                messageInput.value.trim();

            if (!message) {
                return;
            }

            messageInput.value = "";

            resizeTextarea();

            await sendMessage(message);
        }
    );


    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                chatForm.requestSubmit();
            }
        }
    );


    messageInput.addEventListener(
        "input",
        resizeTextarea
    );
}


function resizeTextarea() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(message) {

    addMessage(
        "user",
        message
    );

    state.conversation.push({
        role: "user",
        content: message,
        timestamp: Date.now()
    });

    saveState();

    showTyping(true);

    setAssistantStatus(
        "Thinking..."
    );


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message,

                        userId:
                            getUserId(),

                        assistant: {

                            name:
                                state.assistantName,

                            personality:
                                state.assistantPersonality
                        }
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data =
            await response.json();


        const reply =
            data.reply ||
            "I received your message, but I don't have a response yet.";


        handleAssistantAction(
            data.action
        );


        showTyping(false);


        addMessage(
            "assistant",
            reply
        );


        state.conversation.push({

            role: "assistant",

            content: reply,

            timestamp: Date.now()
        });


        if (
            Array.isArray(
                data.memories
            )
        ) {

            state.memories =
                data.memories;

            renderMemories();
        }


        saveState();


        if (
            state.speakResponses
        ) {

            speakText(reply);

        } else if (
            wakeWordMode
        ) {

            resumeWakeWordMode();
        }


    } catch (error) {

        console.error(
            "Chat request failed:",
            error
        );


        showTyping(false);


        const fallback =
            localAssistantResponse(
                message
            );


        addMessage(
            "assistant",
            fallback
        );


        state.conversation.push({

            role: "assistant",

            content: fallback,

            timestamp: Date.now()
        });


        saveState();


        setAssistantStatus(
            "Local mode"
        );


        if (
            state.speakResponses
        ) {

            speakText(
                fallback
            );

        } else if (
            wakeWordMode
        ) {

            resumeWakeWordMode();
        }


        showToast(
            "Using local assistant mode",
            "The backend is not connected yet. We'll connect it in the next step."
        );
    }
}


/* =========================================================
   LOCAL FALLBACK ASSISTANT
========================================================= */

function localAssistantResponse(
    message
) {

    const text =
        message
            .toLowerCase()
            .trim();


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `Hello ${state.userName}. I'm ${state.assistantName}. I'm ready to help.`;
    }


    if (
        text.includes("what can you do") ||
        text === "help"
    ) {

        return [
            "I can help you with:",
            "",
            "• Conversations",
            "• Remembering information",
            "• Tasks and reminders",
            "• Time and date",
            "• Voice interaction",
            "• Assistant personalization",
            "• Future phone and business automation"
        ].join("\n");
    }


    if (
        text.includes("what time") ||
        text === "time"
    ) {

        return `The current time is ${new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        })}.`;
    }


    if (
        text.includes("what date") ||
        text === "date" ||
        text.includes("today's date")
    ) {

        return `Today is ${new Date().toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        )}.`;
    }


    if (
        text.startsWith("remember ")
    ) {

        const memory =
            message
                .slice(9)
                .trim();

        if (memory) {

            state.memories.push({

                id:
                    Date.now().toString(),

                text:
                    memory,

                createdAt:
                    Date.now()
            });

            saveState();

            renderMemories();

            return `Got it. I'll remember: ${memory}`;
        }
    }


    if (
        text.includes(
            "what do you remember"
        ) ||
        text.includes(
            "show my memories"
        )
    ) {

        if (
            state.memories.length === 0
        ) {

            return "I don't have any saved memories yet.";
        }


        return [
            "Here's what I remember:",
           
