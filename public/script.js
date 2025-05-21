const origin_url = 'https://mock-api-server-one.vercel.app/';

// Initialize highlight.js
hljs.highlightAll();

document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Tab functionality with smooth transitions
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.opacity = '0';
            });
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const activeContent = document.getElementById(`${tabId}-tab`);
            activeContent.classList.add('active');
            
            // Fade in animation
            setTimeout(() => {
                activeContent.style.opacity = '1';
            }, 50);
        });
    });
    
    // JSON Validation and Formatting with improved feedback
    const jsonInput = document.getElementById('exampleResponse');
    const validateButton = document.getElementById('validateJson');
    const formatButton = document.getElementById('formatJson');
    const validationResult = document.getElementById('jsonValidationResult');
    
    // Auto-resize textarea
    jsonInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    
    validateButton.addEventListener('click', () => {
        const jsonString = jsonInput.value.trim();
        if (!jsonString) {
            showPopupMessage('JSON is empty', 'error');
            return;
        }
        
        try {
            JSON.parse(jsonString);
            showPopupMessage('JSON is valid!', 'success');
        } catch (error) {
            showPopupMessage(`Invalid JSON: ${error.message}`, 'error');
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
            
            showPopupMessage('JSON formatted successfully!', 'success');
        } catch (error) {
            showPopupMessage(`Invalid JSON: ${error.message}`, 'error');
        }
    });
    
    // Validation Rules Management with animations
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
        ruleElement.style.opacity = '0';
        ruleElement.style.transform = 'translateY(20px)';
        rulesContainer.appendChild(ruleElement);
        
        // Trigger animation
        setTimeout(() => {
            ruleElement.style.transition = 'all 0.3s ease';
            ruleElement.style.opacity = '1';
            ruleElement.style.transform = 'translateY(0)';
        }, 50);
        
        // Add event listener for rule type change
        const ruleType = ruleElement.querySelector('.rule-type');
        const valueContainer = ruleElement.querySelector('.rule-value-container');
        
        ruleType.addEventListener('change', () => {
            if (ruleType.value === 'type') {
                valueContainer.style.display = 'block';
                valueContainer.style.opacity = '0';
                setTimeout(() => {
                    valueContainer.style.transition = 'opacity 0.3s ease';
                    valueContainer.style.opacity = '1';
                }, 50);
            } else {
                valueContainer.style.opacity = '0';
                setTimeout(() => {
                    valueContainer.style.display = 'none';
                }, 300);
            }
        });
        
        // Add event listener for delete button with animation
        const deleteButton = ruleElement.querySelector('.delete-rule');
        deleteButton.addEventListener('click', () => {
            ruleElement.style.opacity = '0';
            ruleElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                rulesContainer.removeChild(ruleElement);
            }, 300);
        });
        
        ruleIndex++;
    }
    
    // Load Example Templates with animation
    const exampleCards = document.querySelectorAll('.example-card');
    
    exampleCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add click animation
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
            
            const exampleId = card.getAttribute('data-example');
            const template = document.getElementById(`example${exampleId.charAt(0).toUpperCase() + exampleId.slice(1)}`);
            if (template) {
                jsonInput.value = template.innerHTML.trim();
                
                // Switch to basic tab with animation
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.opacity = '0';
                });
                
                const basicTab = document.querySelector('[data-tab="basic"]');
                const basicContent = document.getElementById('basic-tab');
                basicTab.classList.add('active');
                basicContent.classList.add('active');
                
                setTimeout(() => {
                    basicContent.style.opacity = '1';
                }, 50);
                
                // Format the loaded JSON
                formatButton.click();
            }
        });
        
        // Add hover animation
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Form Submission with loading animation
    const mockApiForm = document.getElementById('mockApiForm');
    const outputContainer = document.getElementById('output');
    
    mockApiForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        
        // Validate JSON before submitting
        const exampleResponse = jsonInput.value;
        try {
            JSON.parse(exampleResponse);
        } catch (error) {
            showPopupMessage(`Invalid JSON: ${error.message}`, 'error');
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
        
        // Show loading state with animation
        outputContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading"></div>
                <p>Creating your mock API...</p>
            </div>
        `;
        outputContainer.style.display = 'block';
        outputContainer.style.opacity = '0';
        setTimeout(() => {
            outputContainer.style.opacity = '1';
        }, 50);
        
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
            
            // Generate the output with copy buttons and animations
            outputContainer.innerHTML = `
                <div class="output-success">
                    <h2><i class="fas fa-check-circle"></i> Mock API Successfully Created! 🎉</h2>
                    ${expirationInfo}
                    
                    <div class="output-tabs">
                        <button class="output-tab active" data-output="endpoint">
                            <i class="fas fa-link"></i> Endpoint
                        </button>
                        <button class="output-tab" data-output="fetch">
                            <i class="fas fa-code"></i> Fetch
                        </button>
                        <button class="output-tab" data-output="axios">
                            <i class="fas fa-download"></i> Axios
                        </button>
                        <button class="output-tab" data-output="curl">
                            <i class="fas fa-terminal"></i> cURL
                        </button>
                    </div>
                    
                    <div class="output-content active" id="endpoint-output">
                        <div class="copy-container">
                            <input type="text" value="${result.url}" readonly class="copy-input">
                            <button class="copy-btn" data-copy="${result.url}">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                    
                    <div class="output-content" id="fetch-output">
                        <pre><code class="language-javascript">fetch('${result.url}')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="fetch">
                            <i class="fas fa-copy"></i> Copy Code
                        </button>
                    </div>
                    
                    <div class="output-content" id="axios-output">
                        <pre><code class="language-javascript">axios.get('${result.url}')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="axios">
                            <i class="fas fa-copy"></i> Copy Code
                        </button>
                    </div>
                    
                    <div class="output-content" id="curl-output">
                        <pre><code class="language-bash">curl -X GET ${result.url} -H "Content-Type: application/json"</code></pre>
                        <button class="copy-btn copy-code-btn" data-copy="curl">
                            <i class="fas fa-copy"></i> Copy Code
                        </button>
                    </div>
                </div>
            `;
            
            // Initialize output tabs
            initializeOutputTabs();
            
            // Initialize copy buttons
            initializeCopyButtons();
            
            // Highlight code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
            
            // Scroll to output
            outputContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showPopupMessage(error.message, 'error');
            outputContainer.style.display = 'none';
        }
    });
    
    // Initialize output tabs
    function initializeOutputTabs() {
        const outputTabs = document.querySelectorAll('.output-tab');
        const outputContents = document.querySelectorAll('.output-content');
        
        outputTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                outputTabs.forEach(t => t.classList.remove('active'));
                outputContents.forEach(c => {
                    c.classList.remove('active');
                    c.style.opacity = '0';
                });
                
                tab.classList.add('active');
                const outputId = tab.getAttribute('data-output');
                const activeContent = document.getElementById(`${outputId}-output`);
                activeContent.classList.add('active');
                
                setTimeout(() => {
                    activeContent.style.opacity = '1';
                }, 50);
            });
        });
    }
    
    // Initialize copy buttons
    function initializeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const textToCopy = button.getAttribute('data-copy');
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    showPopupMessage('Failed to copy text', 'error');
                }
            });
        });
    }
    
    // Show popup message
    function showPopupMessage(message, type) {
        const popup = document.createElement('div');
        popup.className = `popup-message ${type}`;
        popup.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(popup);
        
        // Trigger animation
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 50);
        
        // Remove popup after delay
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 3000);
    }
});
