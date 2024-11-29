const origin_url = 'https://mock-api-server-one.vercel.app/';
document.getElementById('mockApiForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const exampleResponse = document.getElementById('exampleResponse').value;
    if (!exampleResponse.trim()) {
        alert('Please provide a valid Example Response.');
        return;
    }
    try {
        const response = await fetch(`${origin_url}create-mock-api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exampleResponse })
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.text();
        const output = `
            <div class="output-success">
                <h2>Mock API Successfully Created! 🎉</h2>
                <p>Here is your API URL:</p>
                <div class="mock-url">
                    <a href="${result}" target="_blank">${result}</a>
                </div>
                <button id="copyUrlButton" class="copy-btn">Copy URL</button>
                <p>Share this URL with your team or use it in your projects. 🚀</p>
            </div>`;
        document.getElementById('output').innerHTML = output;
        document.getElementById('output').style.display = 'block';
        document.getElementById('mockApiForm').style.display = 'none';
        document.getElementById('copyUrlButton').addEventListener('click', function () {
            navigator.clipboard.writeText(result).then(() => {
                showPopupMessage('API URL copied to clipboard!', 'success');
            }).catch((error) => {
                console.error('Clipboard Error:', error);
                showPopupMessage('Failed to copy URL. Please try manually.', 'error');
            });
        });
    } catch (error) {
        showPopupMessage('Error creating mock API. Please try again.', 'error');
        console.error('Error:', error);
    }
});

function showPopupMessage(message, type) {
    const popup = document.createElement('div');
    popup.className = `popup-message ${type}`;
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);
}
