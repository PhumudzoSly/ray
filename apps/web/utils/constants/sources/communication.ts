export interface CommunicationProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: 'free' | 'freemium' | 'paid';
  communicationTypes: string[];
  platforms: ('web' | 'mobile' | 'both')[];
}

export const COMMUNICATION_PROVIDERS: CommunicationProvider[] = [
  {
    name: "Twilio",
    description: "Customer engagement platform for communications",
    features: [
      "SMS/MMS messaging",
      "Voice calls",
      "Video calls",
      "WhatsApp Business API",
      "Email API",
      "Programmable chat"
    ],
    link: "https://www.twilio.com/",
    pricing: 'paid',
    communicationTypes: ['SMS', 'Voice', 'Video', 'WhatsApp', 'Email', 'Chat'],
    platforms: ['both']
  },
  {
    name: "SendBird",
    description: "Chat, voice, and video APIs for mobile and web applications",
    features: [
      "In-app messaging",
      "Voice calls",
      "Video calls",
      "Live streaming",
      "Moderation tools",
      "Analytics"
    ],
    link: "https://sendbird.com/",
    pricing: 'freemium',
    communicationTypes: ['Chat', 'Voice', 'Video', 'Live Streaming'],
    platforms: ['both']
  },
  {
    name: "Stream",
    description: "APIs for chat messaging and activity feeds",
    features: [
      "Chat messaging",
      "Activity feeds",
      "Video calling",
      "Moderation",
      "Real-time updates",
      "Scalable infrastructure"
    ],
    link: "https://getstream.io/",
    pricing: 'freemium',
    communicationTypes: ['Chat', 'Activity Feeds', 'Video'],
    platforms: ['both']
  },
  {
    name: "Agora",
    description: "Real-time engagement platform",
    features: [
      "Voice calling",
      "Video calling",
      "Live streaming",
      "Real-time messaging",

      "Cloud recording"
    ],
    link: "https://www.agora.io/",
    pricing: 'freemium',
    communicationTypes: ['Voice', 'Video', 'Live Streaming', 'Messaging'],
    platforms: ['both']
  },
  {
    name: "Socket.IO",
    description: "Real-time bidirectional event-based communication",
    features: [
      "Real-time communication",
      "Automatic reconnection",
      "Binary support",
      "Multiplexing",
      "Room support",
      "Namespace support"
    ],
    link: "https://socket.io/",
    pricing: 'free',
    communicationTypes: ['Real-time Messaging'],
    platforms: ['both']
  },
  {
    name: "Pusher Channels",
    description: "Real-time messaging for web and mobile apps",
    features: [
      "Real-time messaging",
      "Presence channels",
      "Client events",
      "Webhooks",
      "Debug console",
      "Cluster support"
    ],
    link: "https://pusher.com/channels",
    pricing: 'freemium',
    communicationTypes: ['Real-time Messaging'],
    platforms: ['both']
  }
];

// Helper functions
export const getCommunicationByType = (type: string) => {
  return COMMUNICATION_PROVIDERS.filter(provider => 
    provider.communicationTypes.includes(type)
  );
};

export const getFreeCommunicationProviders = () => {
  return COMMUNICATION_PROVIDERS.filter(provider => provider.pricing === 'free');
};

export const getFreemiumCommunicationProviders = () => {
  return COMMUNICATION_PROVIDERS.filter(provider => provider.pricing === 'freemium');
};

export const getPaidCommunicationProviders = () => {
  return COMMUNICATION_PROVIDERS.filter(provider => provider.pricing === 'paid');
};

export const COMMUNICATION_TYPES = [
  'SMS', 'Voice', 'Video', 'Chat', 'Email', 'WhatsApp', 'Real-time Messaging', 
  'Live Streaming', 'Activity Feeds', 'Push Notifications'
]; 