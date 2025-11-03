import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your pharmacy assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Knowledge base for your pharmacy website
  const knowledgeBase = {
    // Greetings
    greetings: {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      responses: [
        "Hello! Welcome to MedCoupax. How can I assist you today?",
        "Hi there! I'm here to help with any questions about our pharmacy services.",
        "Hey! What can I help you find today?"
      ]
    },

    // About website/services
    about: {
      keywords: ['what is', 'about', 'medcoupax', 'services', 'what do you do'],
      responses: [
        "MedCoupax is your trusted online pharmacy platform where you can browse medicines, compare prices from different pharmacies, and order with cash on delivery.",
        "We connect you with verified pharmacies in your area and offer a wide range of medicines with convenient home delivery."
      ]
    },

    // Products/Medicines
    products: {
      keywords: ['medicine', 'drugs', 'products', 'paracetamol', 'ibuprofen', 'vitamins', 'antibiotics'],
      responses: [
        "We offer a wide range of medicines including pain relief, vitamins, antibiotics, cold & flu medicines, and more. You can browse all products by clicking 'Products' in the menu.",
        "Our top-selling medicines include Paracetamol, Vitamin C, Ibuprofen, and many others. All are available from verified pharmacies."
      ]
    },

    // Ordering process
    ordering: {
      keywords: ['how to order', 'buy', 'purchase', 'cart', 'checkout', 'order'],
      responses: [
        "Ordering is simple! 1) Browse products 2) Add to cart 3) Go to checkout 4) Fill your details 5) We'll deliver with cash on delivery!",
        "Just add medicines to your cart, proceed to checkout, fill in your delivery details, and choose cash on delivery. It's that easy!"
      ]
    },

    // Payment
    payment: {
      keywords: ['payment', 'pay', 'cash on delivery', 'cod', 'money', 'price'],
      responses: [
        "We currently offer Cash on Delivery (COD) - you pay when your medicines arrive at your doorstep. No advance payment needed!",
        "All orders are Cash on Delivery. You don't need to pay anything upfront - just pay when you receive your medicines."
      ]
    },

    // Delivery
    delivery: {
      keywords: ['delivery', 'shipping', 'when will i get', 'how long', 'fast', 'time'],
      responses: [
        "We offer free home delivery! Delivery time depends on your location and the pharmacy, but typically takes 1-3 business days.",
        "Your medicines will be delivered directly to your address. Delivery is completely free on all orders."
      ]
    },

    // Pharmacies
    pharmacies: {
      keywords: ['pharmacy', 'pharmacies', 'store', 'which pharmacy', 'verified'],
      responses: [
        "We work with verified pharmacies like City Central Pharmacy, HealthCare Plus, and MediCure Store. All our partner pharmacies are licensed and trusted.",
        "You can view all available pharmacies by clicking 'Pharmacies' in the menu. We only partner with verified, licensed pharmacies."
      ]
    },

    // Search
    search: {
      keywords: ['search', 'find', 'look for', 'where is', 'how to find'],
      responses: [
        "You can search for any medicine using the search bar on the homepage. Just type the medicine name or pharmacy name.",
        "Use our search feature to quickly find specific medicines. You can search by medicine name, pharmacy, or category."
      ]
    },

    // Contact/Support
    contact: {
      keywords: ['contact', 'support', 'help', 'phone', 'email', 'customer service'],
      responses: [
        "For additional support, you can contact our customer service. We're here to help with any questions or issues!",
        "Need more help? Our support team is available to assist you with any questions about orders or medicines."
      ]
    },

    // Common issues
    issues: {
      keywords: ['problem', 'issue', 'error', 'not working', 'bug', 'cant', 'unable'],
      responses: [
        "I'm sorry you're experiencing issues. Can you tell me more about the specific problem? I'll do my best to help!",
        "Let me help you with that. Could you describe what exactly isn't working? I'm here to assist!"
      ]
    }
  };

  // Function to find the best response
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check each category in knowledge base
    for (const [category, data] of Object.entries(knowledgeBase)) {
      const matchedKeyword = data.keywords.find(keyword => 
        message.includes(keyword.toLowerCase())
      );
      
      if (matchedKeyword) {
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Default response if no match found
    const defaultResponses = [
      "I'm not sure about that specific question. Could you try asking about our medicines, ordering process, delivery, or pharmacies?",
      "I'd love to help! You can ask me about our products, how to order, payment methods, delivery, or our pharmacy partners.",
      "That's an interesting question! I can help you with information about medicines, ordering, delivery, or finding pharmacies. What would you like to know?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const quickQuestions = [
    "How to order medicines?",
    "What payment methods do you accept?",
    "How long does delivery take?",
    "Which pharmacies do you work with?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send the quick question
    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(question),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <div className="chat-notification">Chat with us!</div>}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h4>Pharmacy Assistant</h4>
                <span className="bot-status">Online</span>
              </div>
            </div>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="quick-questions">
              <p>Quick questions:</p>
              {quickQuestions.map((question, index) => (
                <button 
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !inputMessage.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;