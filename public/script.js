const origin_url = 'https://mock-api-server-one.vercel.app/';

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // JSON Validation and Formatting
    const jsonInput = document.getElementById('exampleResponse');
    const validateButton = document.getElementById('validateJson');
    const formatButton = document.getElementById('formatJson');
    const validationResult = document.getElementById('jsonValidationResult');
    
    validateButton.addEventListener('click', () => {
        const jsonString = jsonInput.value.trim();
        if (!jsonString) {
            validationResult.innerHTML = '<span class="validation-error">JSON is empty</span>';
            return;
        }
        
        try {
            JSON.parse(jsonString);
            validationResult.innerHTML = '<span class="validation-success">JSON is valid</span>';
            setTimeout(() => {
                validationResult.innerHTML = '';
            }, 3000);
        } catch (error) {
            validationResult.innerHTML = `<span class="validation-error">Invalid JSON: ${error.message}</span>`;
        }
    });
    
    formatButton.addEventListener('click', () => {
        const jsonString = jsonInput.value.trim();
        if (!jsonString) return;
        
        try {
            const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);
            jsonInput.value = formatted;
            jsonInput.style.height = 'auto';
            jsonInput.style.height = jsonInput.scrollHeight + 'px';
            
            validationResult.innerHTML = '<span class="validation-success">JSON formatted</span>';
            setTimeout(() => {
                validationResult.innerHTML = '';
            }, 3000);
        } catch (error) {
            validationResult.innerHTML = `<span class="validation-error">Invalid JSON: ${error.message}</span>`;
        }
    });
    
    // Validation Rules Management
    const addRuleButton = document.getElementById('addValidationRule');
    const rulesContainer = document.getElementById('validationRules');
    let ruleIndex = 0;
    
    addRuleButton.addEventListener('click', () => {
        addValidationRule();
    });
    
    function addValidationRule() {
        const template = document.getElementById('validationRuleTemplate').innerHTML;
        const ruleElement = document.createElement('div');
        ruleElement.innerHTML = template.replace(/{{index}}/g, ruleIndex);
        rulesContainer.appendChild(ruleElement);
        
        // Add event listener for rule type change
        const ruleType = ruleElement.querySelector('.rule-type');
        const valueContainer = ruleElement.querySelector('.rule-value-container');
        
        ruleType.addEventListener('change', () => {
            if (ruleType.value === 'type') {
                valueContainer.style.display = 'block';
            } else {
                valueContainer.style.display = 'none';
            }
        });
        
        // Add event listener for delete button
        const deleteButton = ruleElement.querySelector('.delete-rule');
        deleteButton.addEventListener('click', () => {
            rulesContainer.removeChild(ruleElement);
        });
        
        ruleIndex++;
    }
    
    // Load Example Templates
    const exampleCards = document.querySelectorAll('.example-card');
    
    exampleCards.forEach(card => {
        card.addEventListener('click', () => {
            const exampleId = card.getAttribute('data-example');
            const template = document.getElementById(`example${exampleId.charAt(0).toUpperCase() + exampleId.slice(1)}`);
            if (template) {
                jsonInput.value = template.innerHTML.trim();
                
                // Switch to basic tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                document.querySelector('[data-tab="basic"]').classList.add('active');
                document.getElementById('basic-tab').classList.add('active');
                
                // Format the loaded JSON
                formatButton.click();
            }
        });
    });
    
    // Form Submission
    const mockApiForm = document.getElementById('mockApiForm');
    const outputContainer = document.getElementById('output');
    
    mockApiForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        // Validate JSON before submitting
        const exampleResponse = jsonInput.value;
        try {
            JSON.parse(exampleResponse);
        } catch (error) {
            validationResult.innerHTML = `<span class="validation-error">Invalid JSON: ${error.message}</span>`;
            return;
        }
        
        // Gather form data
        const statusCode = document.getElementById('statusCode').value;
        const expiresIn = document.getElementById('expiresIn').value;
        const latency = document.getElementById('latency').value;
        const requireAuth = document.getElementById('requireAuth').checked;
        
        // Collect validation rules
        const validationRules = [];
        document.querySelectorAll('.validation-rule').forEach(ruleElement => {
            const ruleType = ruleElement.querySelector('.rule-type').value;
            const ruleField = ruleElement.querySelector('.rule-field').value;
            
            if (ruleField) {
                const rule = {
                    type: ruleType,
                    field: ruleField
                };
                
                if (ruleType === 'type') {
                    rule.value = ruleElement.querySelector('.rule-value').value;
                }
                
                validationRules.push(rule);
            }
        });
        
        // Show loading state
        outputContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Creating your mock API...</p>
            </div>
        `;
        outputContainer.style.display = 'block';
        
        try {
            const response = await fetch(`${origin_url}create-mock-api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exampleResponse,
                    statusCode,
                    expiresIn: expiresIn ? parseInt(expiresIn) : null,
                    latency: parseInt(latency),
                    requireAuth,
                    validationRules
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            
            // Format expiration time if exists
            let expirationInfo = '';
            if (result.expiresAt) {
                const expiresDate = new Date(result.expiresAt);
                expirationInfo = `
                    <div class="expiration-info">
                        <p>Your API will expire on:</p>
                        <div class="expiration-time">${expiresDate.toLocaleString()}</div>
                    </div>
                `;
            }
            
            // Generate the output with copy buttons for various use cases
            outputContainer.innerHTML = `
                <div class="output-success">
                    <h2>Mock API Successfully Created! 🎉</h2>
                    ${expirationInfo}
                    
                    <div class="output-tabs">
                        <button class="output-tab active" data-output="endpoint">Endpoint</button>
                        <button class="output-tab" data-output="fetch">Fetch</button>
                        <button class="output-tab" data-output="axios">Axios</button>
                        <button class="output-tab" data-output="curl">cURL</button>
                    </div>
                    
                    <div class="output-content active" id="endpoint-output">
                        <div class="copy-container">
                            <input type="text" value="${result.url}" readonly class="copy-input">
                            <button class="copy-btn" data-copy="${result.url}">Copy</button>
                        </div>
                    </div>
                    
                    <div class="output-content" id="fetch-output">
                        <pre><code class="language-javascript">fetch('${result.url}')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="fetch">Copy Code</button>
                    </div>
                    
                    <div class="output-content" id="axios-output">
                        <pre><code class="language-javascript">axios.get('${result.url}')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="axios">Copy Code</button>
                    </div>
                    
                    <div class="output-content" id="curl-output">
                        <pre><code class="language-bash">curl -X GET ${result.url} -H "Content-Type: application/json"</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="curl">Copy Code</button>
                    </div>
                    
                    <div class="dashboard-link">
                        <p>View dashboard and manage your API:</p>
                        <a href="${result.dashboardUrl}" target="_blank" class="dashboard-btn">Open Dashboard</a>
                    </div>
                    
                    <div class="api-buttons">
                        <button type="button" id="createNewApi" class="secondary-btn">Create Another API</button>
                    </div>
                </div>
            `;
            
            // Initialize syntax highlighting
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
            // Output tab functionality
            const outputTabs = document.querySelectorAll('.output-tab');
            const outputContents = document.querySelectorAll('.output-content');
            
            outputTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    outputTabs.forEach(t => t.classList.remove('active'));
                    outputContents.forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const outputId = tab.getAttribute('data-output');
                    document.getElementById(`${outputId}-output`).classList.add('active');
                });
            });
            
            // Copy URL functionality
            document.querySelector('.copy-btn').addEventListener('click', function() {
                const url = this.getAttribute('data-copy');
                navigator.clipboard.writeText(url).then(() => {
                    showPopupMessage('API URL copied to clipboard!', 'success');
                }).catch((error) => {
                    console.error('Clipboard Error:', error);
                    showPopupMessage('Failed to copy URL. Please try manually.', 'error');
                });
            });
            
            // Copy code functionality
            document.querySelectorAll('.copy-code-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const codeType = this.getAttribute('data-copy');
                    const codeElement = document.querySelector(`#${codeType}-output code`);
                    
                    navigator.clipboard.writeText(codeElement.textContent).then(() => {
                        showPopupMessage('Code copied to clipboard!', 'success');
                    }).catch((error) => {
                        console.error('Clipboard Error:', error);
                        showPopupMessage('Failed to copy code. Please try manually.', 'error');
                    });
                });
            });
            
            // Create new API button
            document.getElementById('createNewApi').addEventListener('click', () => {
                mockApiForm.reset();
                outputContainer.style.display = 'none';
                mockApiForm.style.display = 'flex';
                jsonInput.value = '';
                
                // Reset validation rules
                rulesContainer.innerHTML = '';
            });
            
        } catch (error) {
            showPopupMessage('Error creating mock API: ' + error.message, 'error');
            console.error('Error:', error);
            
            outputContainer.innerHTML = `
                <div class="output-error">
                    <h2>Error Creating API</h2>
                    <p>${error.message}</p>
                    <button type="button" id="tryAgainBtn" class="primary-btn">Try Again</button>
                </div>
            `;
            
            document.getElementById('tryAgainBtn').addEventListener('click', () => {
                outputContainer.style.display = 'none';
                mockApiForm.style.display = 'flex';
            });
        }
    });
    
    // Utility function to show popup messages
    function showPopupMessage(message, type) {
        const popup = document.createElement('div');
        popup.className = `popup-message ${type}`;
        popup.innerText = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.classList.add('fadeOut');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, 2700);
    }
});
