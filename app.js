
document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const textContainer = document.getElementById("textContainer");
    const translationContainer = document.getElementById("translationContainer");
    let sentences = [];
    let currentSentenceIndex = 0;
    let currentSentence = "";
    let isTypingCorrect = true;

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                sentences = text.split(/(?<=[.!?])/);
                // sentences = text.split(" ");
                displaySentence(sentences[currentSentenceIndex]);
                currentSentence = sentences[currentSentenceIndex];
                fileInput.style.display = "none";
            };
            reader.readAsText(file);
        }
    });

    let charCountElement = document.getElementById("charCount");
    let charCount = 0;

    function displaySentence(sentence) {
        const sentenceElement = document.createElement("div");
        sentenceElement.textContent = sentence;
        textContainer.appendChild(sentenceElement);
    
        // Translate and display the translation
        deeplTranslate(sentence).then(translation => {
            const translationElement = document.createElement("div");
            translationElement.textContent = translation;
            translationContainer.appendChild(translationElement);
        });
    
        isTypingCorrect = true;
    
        // Typing check
        document.addEventListener("keydown", function (e) {
            if (e.key === currentSentence[0]) {
                currentSentence = currentSentence.substring(1);
                charCount++;
                charCountElement.textContent = charCount;
                if (currentSentence.length === 0) {
                    currentSentenceIndex++;
                    if (currentSentenceIndex < sentences.length) {
                        currentSentence = sentences[currentSentenceIndex];
                        displaySentence(currentSentence);
                    } else {
                        const completionElement = document.createElement("div");
                        completionElement.textContent = "You are done";
                        textContainer.appendChild(completionElement);
                    }
                }
                updateDisplayedText(sentence);
            } else {
                isTypingCorrect = false;
                updateDisplayedText(sentence);
            }

        });
        
        readSentence(sentence);
    }
    
    function updateDisplayedText(sentence) {
        const highlightedText = `<span style="color: red;">${sentence.substring(0, sentence.length - currentSentence.length)}</span>`;
        const remainingText = `${sentence.substring(sentence.length - currentSentence.length)}`;
        textContainer.lastChild.innerHTML = highlightedText + remainingText;
    }
    
    function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}

    
    
});


const API_KEY = '8d05bb78-6e18-44a9-a44b-3f37c3326480';
const API_URL = 'https://api-free.deepl.com/v2/translate';

function deeplTranslate(text) {
    const sourceLang = '&source_lang=EN&target_lang=JA'; // Always translate from English to Japanese
    const encodedText = encodeURIComponent(text); // Encode the text
    const content = 'auth_key=' + API_KEY + '&text=' + encodedText + sourceLang;
    const url = API_URL + '?' + content;

    return fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Could not reach the API: " + response.statusText);
            }
        }).then(function (data) {
            return data["translations"][0]["text"];
        }).catch(function (error) {
            alert("翻訳失敗");
            return "";
        });
}


function readSentence(sentence) {
    const url = 'https://api.voicevox.com/v1/audio'; // Replace with actual API URL
    const data = {
        text: sentence,
        speaker: 1 // This is an example; the actual parameter depends on the API
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer Your_API_Key' // If API key is required
        },
        body: JSON.stringify(data)
    })
    .then(response => response.blob())
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        playAudio(audioUrl);
    })
    .catch(error => console.error('Error:', error));
}


function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}
