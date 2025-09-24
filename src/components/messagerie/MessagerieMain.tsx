"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  MoreVertical,
  ChevronLeft,
  Package,
  Clock,
  Star,
  Check,
  CheckCheck,
  ArrowLeft,
  Phone,
  Video,
  Info,
  Smile,
  Menu,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import Alert from "@/components/Alert";

interface Conversation {
  id: number;
  vendeur: string;
  image: string;
  nonLu: number;
  status: "en_ligne" | "hors_ligne";
  dernierMessage: string;
  timestamp: string;
}

interface Message {
  _id: string;
  message: string;
  clefUser: string;
  provenance: boolean;
  date: string;
  use: boolean;
  lusUser?: boolean;
}

interface MessageStatusProps {
  status: "sent" | "delivered" | "read";
}

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ihambackend.onrender.com";

const MessagerieMain: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("recent");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [alert, setAlert] = useState({
    visible: false,
    type: "info" as "success" | "error" | "warning" | "info",
    message: "",
  });

  // Simuler des données initiales
  const initialConversations: Conversation[] = [
    {
      id: 1,
      vendeur: "IHAM BAOBAB's Store",
      image: "/logo.png",
      nonLu: 0,
      status: "en_ligne",
      dernierMessage: "Bienvenue dans notre boutique !",
      timestamp: "10:30",
    },
  ];

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

  // Gestion des alertes
  const showAlert = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "info", message: "" });
    }, 5000);
  }, []);

  // Initialisation socket
  useEffect(() => {
    const newSocket = io(BackendUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connecté');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket déconnecté');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Chargement initial des messages
  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user?.id]);

  // Écoute des nouveaux messages
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNewMessage = (message: any) => {
      if (message.data.clefUser === user.id) {
        loadMessages();
      }
    };

    const handleDeleteMessage = (data: any) => {
      if (data) {
        loadMessages();
      }
    };

    socket.on("new_message_user", handleNewMessage);
    socket.on("delete_message", handleDeleteMessage);

    return () => {
      socket.off("new_message_user", handleNewMessage);
      socket.off("delete_message", handleDeleteMessage);
    };
  }, [socket, user?.id]);

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`${BackendUrl}/getUserMessagesByClefUser/${user.id}`, {
        timeout: 10000,
      });
      
      setMessages(response.data);

      // Mettre à jour le nombre de messages non lus
      const unreadCount = response.data.filter(
        (item: Message) => item.lusUser === false && item.provenance === false
      )?.length;

      setConversations((prevConv) =>
        prevConv.map((conv) => ({
          ...conv,
          nonLu: unreadCount,
          dernierMessage:
            response.data[response.data.length - 1]?.message || conv.dernierMessage,
          timestamp: response.data[response.data.length - 1]
            ? formatDate(response.data[response.data.length - 1].date)
            : conv.timestamp,
        }))
      );
    } catch (error: any) {
      console.error("Erreur lors du chargement des messages:", error);
      showAlert("Erreur lors du chargement des messages", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, showAlert]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage === "" || !user?.id) return;

    setIsSending(true);
    try {
      const messageData = {
        message: trimmedMessage,
        clefUser: user.id,
        provenance: true,
      };

      await axios.post(`${BackendUrl}/createUserMessage`, messageData, {
        timeout: 10000,
      });

      if (socket && isConnected) {
        socket.emit("new_message_u", { data: messageData });
      }

      setInputMessage("");
      if (inputRef.current) {
        inputRef.current.style.height = "44px";
      }
      await loadMessages();
    } catch (error: any) {
      console.error("Erreur envoi message:", error);
      showAlert("Erreur lors de l'envoi du message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await axios.put(`${BackendUrl}/updateUserMessageAttributeById/${messageId}`, {
        use: false,
      }, { timeout: 10000 });

      await loadMessages();
      showAlert("Message supprimé", "success");
    } catch (error: any) {
      console.error("Erreur suppression message:", error);
      showAlert("Erreur lors de la suppression", "error");
    }
  };

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conv) =>
      conv.vendeur.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (activeFilter === "unread") {
        return b.nonLu - a.nonLu;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const handleChatSelect = async (chat: Conversation) => {
    setSelectedChat(chat);
    setShowMobileList(false);

    try {
      await axios.put(`${BackendUrl}/lecturUserMessage`, { userKey: user?.id }, {
        timeout: 5000,
      });

      // Reset unread count for selected chat
      const updatedConversations = conversations.map((conv) =>
        conv.id === chat.id ? { ...conv, nonLu: 0 } : conv
      );
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  };

  const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-[#30A08B]" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return messageDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays <= 7) {
      return messageDate.toLocaleDateString("fr-FR", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // Adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "44px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 120) + "px";
    }
  };

  // État de connexion en header mobile
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-xs text-gray-500">
        {isConnected ? 'En ligne' : 'Hors ligne'}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white md:flex-row">
      {/* Liste des conversations - Mobile First */}
      <div
        className={`${
          showMobileList ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-96 bg-white border-r border-gray-200`}
      >
        {/* Header Mobile */}
        <div className="bg-[#30A08B] text-white">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold">Messages</h1>
              <ConnectionStatus />
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-4 pr-10 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B2905F] text-sm"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex px-2 pb-2 space-x-1">
            <button
              onClick={() => setActiveFilter("recent")}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                activeFilter === "recent"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/80"
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              Récents
            </button>
            <button
              onClick={() => setActiveFilter("unread")}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                activeFilter === "unread"
                  ? "bg-[#B2905F] text-white"
                  : "bg-white/10 text-white/80"
              }`}
            >
              <Star className="w-3 h-3 mr-1" />
              Non lus
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#30A08B]"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleChatSelect(conv)}
                className={`flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
                  selectedChat?.id === conv.id ? "bg-[#30A08B]/5 border-l-4 border-l-[#30A08B]" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                    <Image
                      src={conv.image}
                      alt={conv.vendeur}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      conv.status === "en_ligne" ? "bg-[#30A08B]" : "bg-gray-300"
                    }`}
                  ></span>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {conv.vendeur}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {conv.dernierMessage}
                  </p>
                </div>
                
                {conv.nonLu > 0 && (
                  <div className="ml-2 bg-[#30A08B] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {conv.nonLu > 99 ? '99+' : conv.nonLu}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      {!selectedChat ? (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-[#30A08B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-[#30A08B]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bienvenue dans votre messagerie
            </h2>
            <p className="text-gray-500 max-w-sm">
              Sélectionnez une conversation pour commencer à échanger avec nos vendeurs
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`${
            showMobileList ? 'hidden' : 'flex'
          } md:flex flex-1 flex-col h-full`}
        >
          {/* Header de conversation */}
          <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
            <button
              onClick={() => setShowMobileList(true)}
              className="mr-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors md:hidden"
              aria-label="Retour à la liste"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#30A08B]/20">
              <Image
                src={selectedChat.image}
                alt={selectedChat.vendeur}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                {selectedChat.vendeur}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedChat.status === "en_ligne" ? "En ligne" : "Vu récemment"}
              </p>
            </div>

            {/* Actions header - cachées sur mobile pour plus d'espace */}
            <div className="hidden md:flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Info className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <button className="md:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-2">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-none space-y-4">
              {messages.filter(message => message.use).map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${
                    message.provenance ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] ${
                      message.provenance
                        ? "bg-[#30A08B] text-white rounded-2xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm"
                    } px-4 py-2.5`}
                  >
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: message?.message }}
                    />
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <span className={`text-xs ${
                        message.provenance ? "text-white/70" : "text-gray-500"
                      }`}>
                        {formatDate(message.date)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {message.provenance && (
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="text-xs text-white/70 hover:text-white/90 transition-colors"
                          >
                            Suppr.
                          </button>
                        )}
                        {message.provenance && (
                          <MessageStatus status="delivered" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="w-full py-3 px-4 rounded-2xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#30A08B] resize-none text-sm leading-relaxed"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                  disabled={isSending}
                />
              </div>
              
              {/* Bouton emoji - caché sur très petits écrans */}
              <button className="hidden sm:flex p-3 text-gray-500 hover:text-[#30A08B] transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className={`p-3 rounded-2xl transition-all ${
                  inputMessage.trim() && !isSending
                    ? "bg-[#30A08B] hover:bg-[#30A08B]/90 text-white transform active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ visible: false, type: "info", message: "" })}
        />
      )}
    </div>
  );
};

export default MessagerieMain;