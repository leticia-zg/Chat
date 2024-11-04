import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import axios from 'axios';
import './Chatbot.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isComplexResponse, setIsComplexResponse] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat'); // Controla a aba ativa
  const [selectedHistory, setSelectedHistory] = useState<Message[]>([]); // Guarda a conversa selecionada

  const isUserLoggedIn = true; // Simula usuário logado

  // Carrega os históricos salvos do localStorage ao iniciar
  useEffect(() => {
    if (isUserLoggedIn) {
      const savedHistories = Object.keys(localStorage).filter((key) =>
        key.startsWith('chat_history_')
      );
      setHistory(savedHistories);
    }
  }, [isUserLoggedIn]);

  // Salva a conversa atual no localStorage
  const saveChatHistory = () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`chat_history_${timestamp}`, JSON.stringify(messages));
    setHistory((prevHistory) => [...prevHistory, `chat_history_${timestamp}`]);
    setMessages([]); // Reseta o chat para começar uma nova conversa
  };

  // Carrega um histórico selecionado para exibir
  const loadChatHistory = (key: string) => {
    const savedMessages = localStorage.getItem(key);
    if (savedMessages) {
      setSelectedHistory(JSON.parse(savedMessages));
      setActiveTab('history'); // Muda para a aba de históricos
    }
  };

  const getBotResponse = async (userInput: string): Promise<string> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'ft:gpt-4o-mini-2024-07-18:personal::A9LZQgYu',
          messages: [{ role: 'user', content: userInput }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Erro ao obter resposta do bot:', error);
      return 'Desculpe, não consegui entender a sua pergunta.';
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    const prompt = isComplexResponse
      ? `Forneça uma explicação detalhada sobre: ${input}`
      : `Responda de forma simples: ${input}`;

    const botResponse = await getBotResponse(prompt);
    const botMessage: Message = { sender: 'bot', text: botResponse };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const toggleResponseType = () => {
    setIsComplexResponse((prev) => !prev);
  };

  return (
    <div className={`chatbot ${isDarkMode ? 'dark' : 'light'}`}>

      {/* Renderiza a Aba de Chat ou a de Históricos */}
      {activeTab === 'chat' ? (
        <>
          <div className="header">
            <div className="logo-container">
              <img
                src="/img/PortoHolding-RGB-H_2.png"
                alt="Logo"
                className={`logo ${isDarkMode ? 'dark-logo' : 'light-logo'}`}
              />
          </div>
            <div className="navigation">
              
              <div className="icon-group">
                <div>
                <button className="icon-button" onClick={saveChatHistory}><img src="\img\salvar.png" alt="Salvar" /></button>
                </div>
                <button onClick={() => setActiveTab('history')} className="icon-button">
                  <img src="/img/tempo-passado (4).png" alt="Histórico" />
                </button>
                <button
                  onClick={() => window.open('https://oficina-virtual-porto.netlify.app/', '_blank')}
                  className="icon-button"
                >
                  <img src="/img/chamine-de-casa (1).png" alt="Oficina Virtual" />
                </button>
                <div className="toggle-buttons">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="icon-button">
                <img src={isDarkMode ? '/img/escuro.png' : '/img/claro.png'} alt={isDarkMode ? 'Modo Claro' : 'Modo Escuro'} />
              </button>
              </div>
              </div>
              </div>  
            <div className="response-toggle">
              <span>
                {isComplexResponse ? 'Respostas Detalhadas' : 'Respostas Simples'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isComplexResponse}
                  onChange={toggleResponseType}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="welcome-message">
            Olá, sou o Assistente Virtual da Porto e vou te ajudar a entender e resolver situações inusitadas com seu veículo.
          </div>

          <div className="suggestions">
            <button className="suggestion-button" onClick={() => handleSuggestionClick('O carro não está parando quando freio. O que fazer?')}>
              Freios
            </button>
            <button className="suggestion-button" onClick={() => handleSuggestionClick('O carro não está respondendo ao acelerador. O que fazer?')}>
              Acelerador
            </button>
          </div>

          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
            />
            <button className="enviar" onClick={handleSend}>Enviar</button>
          </div>
        </>
      ) : (
        <div className="history-container">
          <button onClick={() => setActiveTab('chat')} className="icon-button">
                <img src="/img/mensagens (2).png" alt="Chat Atual" />
              </button>
          <h2>Históricos de Conversa</h2>
          {history.map((key) => (
            <button key={key} onClick={() => loadChatHistory(key)}>
              {key.replace('chat_history_', 'Histórico de ')}
            </button>
          ))}
          <div className="messages">
            {selectedHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
