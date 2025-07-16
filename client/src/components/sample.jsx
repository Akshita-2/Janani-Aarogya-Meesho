// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputSection from './InputSection';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from 'framer-motion';
import HeroImage from '../assets/logo.png';
import vaultImg from '../assets/vault.png';
import yogaImg from '../assets/yoga.webp';
import jrnlImg from '../assets/jrnl.jpg';
import ayurvedaImg from '../assets/ayurveda.png';

const FEATURE_IMAGES = {
  journal: jrnlImg,
  memoryvault: vaultImg,
  ayurveda: ayurvedaImg,
  yoga: yogaImg        
};

  const TRANSLATIONS = {
    'hi-IN': {
      title: 'जननी आरोग्य',
      subtitle: 'भारत का पहला माताओं के लिए वॉइस-आधारित एआई साथी।',
     description1: 'भारतीय माताओं के लिए भारत का पहला बहुभाषी, वॉयस-आधारित AI साथी। जननी आरोग्य गर्भधारण से पहले, गर्भावस्था के दौरान और प्रसवोत्तर अवधि में महिलाओं को आयुर्वेद और सांस्कृतिक देखभाल पर आधारित स्थानीय भाषा में AI-समर्थित मार्गदर्शन प्रदान करता है।',
description2: 'ग्रामीण और कम साक्षरता वाले उपयोगकर्ताओं के लिए डिज़ाइन किया गया, यह वॉयस-आधारित स्वास्थ्य सहायता, रिमाइंडर, जर्नलिंग और भावनात्मक ट्रैकिंग जैसी सुविधाएँ प्रदान करता है — जिससे मातृत्व देखभाल सुलभ, व्यक्तिगत और सशक्त बनती है।',

      checklistTitle: '🌸 दैनिक स्वास्थ्य जांच सूची',
      checklistItems: [
        '3 लीटर पानी पिएं',
        'मातृ योग करें',
        'स्वस्थ भोजन करें',
        'प्रसव पूर्व विटामिन लें',
        'श्वास अभ्यास करें'
      ],
      reminderTitle: '🗓 डॉक्टर-दौरा अनुस्मारक',
      reminderLabel: 'दौरा तिथि',
      repeatLabel: 'दोहराएं',
      daysRemaining: 'डॉक्टर के दौरे में {days} दिन शेष',
    nextVisitOn: 'आपका अगला चेकअप {date} को है',
    visitToday: 'आज आपका डॉक्टर का दौरा है!',
    visitPassed: 'आपका डॉक्टर का दौरा {days} दिन पहले था',
    noVisitScheduled: 'कोई डॉक्टर दौरा निर्धारित नहीं है',
      frequencyOptions: [
        { value: 'once', label: 'एक बार' },
        { value: 'weekly', label: 'साप्ताहिक' },
        { value: 'monthly', label: 'मासिक' }
      ],
      saveReminder: 'अनुस्मारक सहेजें',
      streakTitle: '🔥 आप एक स्ट्रीक पर हैं!',
      streakText: 'दिन {streak} की निरंतरता',
      streakSubtext: 'चलते रहो, तुम अद्भुत कर रहे हो 💪',
      features: [
        { 
          key: 'journal',
          title: 'जर्नल', 
          desc: 'AI द्वारा संचालित दैनिक भावनात्मक सारांश, मूड शिफ्ट को ट्रैक करने और छोटी जीत का जश्न मनाने में मदद करता है।',
          link: '/journal',
    
        },
        { 
          key: 'memoryvault',
          title: 'मेमोरी वॉल्ट', 
          desc: 'माइलस्टोन, भावनाओं और तस्वीरों को एक स्थान पर संरक्षित करें जिसे आप कभी भी देख सकते हैं।',
          link: '/memory-vault',
          
        },
        { key:'ayurveda',
          title: 'आयुर्वेद', 
          desc: 'आपके त्रैमासिक या प्रसवोत्तर के लिए भारतीय ज्ञान - आपके लिए व्यक्तिगत भोजन, जड़ी-बूटियाँ और अनुष्ठान।',
          link:'/ayurveda'
        },
        { 
          key:'yoga',
          title: 'मातृ योग', 
          desc: 'आपकी ताकत, शांति और जुड़ाव को पोषित करने के लिए चरण-वार योग दिनचर्या।',
          link:'/yoga'
        }
      ],
      exploreNow: 'अभी एक्सप्लोर करें',
      jananiSays: 'जननी कहती है',
    askJanani: 'जननी से पूछें...',
    aiPlaceholder: 'अपना प्रश्न यहाँ लिखें या माइक दबाएं...',
    downhead: '🌸 आपकी यात्रा, हमारा समर्थन',
     downcontent: 'आपकी मातृत्व यात्रा का हर कदम अनमोल है। हम आपके मार्गदर्शन, समर्थन और उत्सव के लिए यहाँ हैं।',
     journal: 'जर्नल',
memoryVault: 'स्मृति संग्रह',
ayurveda: 'आयुर्वेद',
yoga: 'योग',
dayStreak: 'दिनों की श्रृंखला'


    },
    'en-IN': {
      title: 'Janani Aarogya',
      subtitle: 'India’s First Voice-led AI Companion For Mothers.',
      description1: 'Janani Aarogya supports women across pre-pregnancy, pregnancy, and postpartum with local-language, AI-powered guidance rooted in Ayurveda and cultural care.',
      description2: 'Designed for rural and low-literacy users, it offers voice-based health support, reminders, journaling, and emotional tracking — making maternal care accessible, personal, and empowering.',

      checklistTitle: '🌸 Daily Wellness Checklist',
      checklistItems: [
        'Drink 3L Water',
        'Do Maternal Yoga',
        'Eat a Healthy Meal',
        'Take Prenatal Vitamins',
        'Practice Breathing'
      ],
      reminderTitle: '🗓 Doctor-Visit Reminder',
      reminderLabel: 'Visit Date',
      repeatLabel: 'Repeat',
      daysRemaining: '{days} days left for the doctor visit',
  nextVisitOn: 'Your next check-up is on {date}',
  visitToday: 'Your doctor visit is today!',
  visitPassed: 'Your doctor visit was {days} days ago',
  noVisitScheduled: 'No doctor visit is scheduled'
,
      frequencyOptions: [
        { value: 'once', label: 'Once' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
      ],
      saveReminder: 'Save Reminder',
      streakTitle: '🔥 You\'re on a Streak!',
      streakText: 'Day {streak} of consistency',
      streakSubtext: 'Keep going, you\'re doing amazing 💪',
      features: [
        {  key:'journal',
          title: 'Journal', 
          desc: 'Daily emotional summaries powered by AI, helping you track mood shifts and celebrate small wins.',
          link: '/journal'
        },
        {  key:'memoryvault',
          title: 'Memory Vault', 
          desc: 'Preserve milestones, emotions, and photos in one space you can revisit anytime.',
          link: '/memory-vault'
        },
        {  key:'ayurveda',
          title: 'Ayurveda', 
          desc: 'Indian wisdom for your trimester or postpartum — food, herbs & rituals personalised to you.',
          link: '/ayurveda'
        },
        {  key:'yoga',
          title: 'Maternal Yoga', 
          desc: 'Stage-wise yoga routines to nurture your strength, peace and connection.',
          link: '/yoga'
        }
      ],
      exploreNow: 'Explore Now',
      jananiSays: "Janani says",
askJanani: "Ask Janani...",

aiPlaceholder: "Type your question here or press the mic...",
downhead: "🌸 Your journey, our support",
downcontent: "Every step of your motherhood journey is precious. We are here to guide, support, and celebrate with you."
    },
    // Add other languages following the same pattern
    'ta-IN': {
    title: 'ஜனனி ஆரோக்கியம்',
    subtitle: 'தாய்மாருக்கான இந்தியாவின் முதல் குரல் வழிநடத்தும் ஏஐ துணை.',
    
    checklistTitle: '🌸 தினசரி ஆரோக்கிய சரிபார்ப்பு பட்டியல்',
    checklistItems: [
      '3 லிட்டர் தண்ணீர் குடிக்கவும்',
      'தாய்மை யோகா செய்யவும்',
      'ஆரோக்கியமான உணவு உண்ணவும்',
      'கர்ப்பத்திற்கு முன் வைட்டமின்கள் எடுத்துக் கொள்ளவும்',
      'சுவாசப் பயிற்சி செய்யவும்'
    ],
    reminderTitle: '🗓 மருத்துவர்-பார்வை நினைவூட்டல்',
    reminderLabel: 'பார்வை தேதி',
    repeatLabel: 'மீண்டும்',
    daysRemaining: 'மருத்துவர் சந்திப்பிற்கு இன்னும் {days} நாட்கள் உள்ளன',
nextVisitOn: 'உங்கள் அடுத்த சோதனை தேதி {date}',
visitToday: 'இன்று உங்கள் மருத்துவர் சந்திப்பு!',
visitPassed: 'உங்கள் மருத்துவர் சந்திப்பு {days} நாட்களுக்கு முன் நடைபெற்றது',
noVisitScheduled: 'மருத்துவர் சந்திப்பு ஏதும் திட்டமிடப்படவில்லை'
,
    frequencyOptions: [
      { value: 'once', label: 'ஒரு முறை' },
      { value: 'weekly', label: 'வாராந்திர' },
      { value: 'monthly', label: 'மாதாந்திர' }
    ],
    saveReminder: 'நினைவூட்டலை சேமிக்கவும்',
    streakTitle: '🔥 நீங்கள் ஒரு தொடரில் இருக்கிறீர்கள்!',
    streakText: 'நிலைத்தன்மையின் நாள் {streak}',
    streakSubtext: 'தொடர்ந்து செல்லுங்கள், நீங்கள் அருமையாக செய்கிறீர்கள் 💪',
    features: [
      { key:'journal',
        title: 'பத்திரிகை', 
        desc: 'AI மூலம் இயக்கப்படும் தினசரி உணர்ச்சி சுருக்கங்கள், மனநிலை மாற்றங்களைக் கண்காணிக்கவும் சிறிய வெற்றிகளை கொண்டாடவும் உதவுகிறது.',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'நினைவு களஞ்சியம்', 
        desc: 'மைல்கற்கள், உணர்ச்சிகள் மற்றும் புகைப்படங்களை நீங்கள் எப்போது வேண்டுமானாலும் மீண்டும் பார்க்கக்கூடிய ஒரு இடத்தில் பாதுகாக்கவும்.',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'ஆயுர்வேதம்', 
        desc: 'உங்கள் மூன்று மாத காலம் அல்லது பிரசவத்திற்குப் பிந்தைய காலத்திற்கான இந்திய ஞானம் - உங்களுக்கு தனிப்பயனாக்கப்பட்ட உணவு, மூலிகைகள் மற்றும் சடங்குகள்.',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'தாய்மை யோகா', 
        desc: 'உங்கள் வலிமை, அமைதி மற்றும் இணைப்பை வளர்க்க நிலை வாரியாக யோகா வழிகாட்டுதல்கள்.',
        link: '/yoga'
      }
    ],
    exploreNow: 'இப்போது ஆராயுங்கள்',
    journal: 'பத்திரிகை',
    memoryVault: 'நினைவு களஞ்சியம்',
    ayurveda: 'ஆயுர்வேதம்',
    yoga: 'யோகா',
    dayStreak: 'நாள் தொடர்',
    jananiSays: 'ஜனனி கூறுகிறார்',
    reminderError: 'தயவு செய்து ஒரு தேதியைத் தேர்ந்தெடுக்கவும்.',
    reminderSuccess: 'நினைவூட்டல் சேமிக்கப்பட்டது!',
    description1: "ஜனனி ஆரோக்கியம் கருத்தரிப்புக்கு முன், கர்ப்பகாலம் மற்றும் பிறவிக்கு பிறகு பெண்களுக்கு, உள்ளூர் மொழியில், ஆயுர்வேதம் மற்றும் கலாசார பராமரிப்பு அடிப்படையிலான ஏஐ வழிகாட்டுதலை வழங்குகிறது.",

description2: "சமதள மற்றும் குறைந்த கல்வி உள்ள பயனர்களுக்காக வடிவமைக்கப்பட்டுள்ளது, இது குரல் அடிப்படையிலான சுகாதார உதவி, நினைவூட்டல்கள், பதிவேட்டில் பதிவு மற்றும் உணர்ச்சி கண்காணிப்பு போன்ற அம்சங்களை வழங்குகிறது — இதன்மூலம் தாய்மை பராமரிப்பு எளிதாகவும், தனிப்பயனாக்கப்பட்டதுமாகவும், சக்திவாய்ந்ததுமாக மாறுகிறது.",

jananiSays: "ஜனனி கூறுகிறார்",
askJanani: "ஜனனியிடம் கேளுங்கள்...",

aiPlaceholder: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும் அல்லது மைக் அழுத்தவும்...",
downhead: "🌸 உங்கள் பயணம், எங்கள் ஆதரவு",
downcontent: "உங்கள் தாய்மை பயணத்தின் ஒவ்வொரு படியும் மதிப்புமிக்கது. உங்களுக்கான வழிகாட்டல், ஆதரவு மற்றும் கொண்டாட்டத்திற்கு நாங்கள் இங்கே இருக்கிறோம்."

  },
    'te-IN': {
    title: 'జనని ఆరోగ్యం',
    subtitle: 'తల్లుల కోసం భారత్‌లో తొలి వాయిస్ ఆధారిత ఏఐ సహచరుడు.',
    
    checklistTitle: '🌸 రోజువారీ ఆరోగ్య చెక్‌లిస్ట్',
    checklistItems: [
      '3 లీటర్ల నీరు తాగండి',
      'మాతృ యోగా చేయండి',
      'ఆరోగ్యకరమైన ఆహారం తినండి',
      'ప్రసవ పూర్వ వైటమిన్లు తీసుకోండి',
      'శ్వాస వ్యాయామం చేయండి'
    ],
    reminderTitle: '🗓 డాక్టర్-విజిట్ రిమైండర్',
    reminderLabel: 'విజిట్ తేదీ',
    repeatLabel: 'పునరావృతం',
    daysRemaining: 'డాక్టర్ సందర్శనకు ఇంకా {days} రోజులు మిగిలి ఉన్నాయి',
nextVisitOn: 'మీ తదుపరి చెకప్ {date}న ఉంది',
visitToday: 'ఈ రోజు మీ డాక్టర్ సందర్శన ఉంది!',
visitPassed: 'మీ డాక్టర్ సందర్శనకు {days} రోజులైంది',
noVisitScheduled: 'ఎటువంటి డాక్టర్ సందర్శన షెడ్యూల్ కాలేదు'
,
    frequencyOptions: [
      { value: 'once', label: 'ఒక్కసారి' },
      { value: 'weekly', label: 'వారానికోసారి' },
      { value: 'monthly', label: 'నెలకోసారి' }
    ],
    saveReminder: 'రిమైండర్ సేవ్ చేయండి',
    streakTitle: '🔥 మీరు ఒక స్ట్రీక్‌లో ఉన్నారు!',
    streakText: 'స్థిరత్వం యొక్క రోజు {streak}',
    streakSubtext: 'కొనసాగించండి, మీరు అద్భుతంగా చేస్తున్నారు 💪',
    features: [
      { key:'journal',
        title: 'జర్నల్', 
        desc: 'AI ద్వారా నడపబడే రోజువారీ భావోద్వేగ సారాంశాలు, మూడ్ మార్పులను ట్రాక్ చేయడానికి మరియు చిన్న విజయాలను జరుపుకోవడానికి సహాయపడతాయి.',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'మెమరీ వాల్ట్', 
        desc: 'మైలురాళ్లు, భావాలు మరియు ఫోటోలను ఒకే స్థలంలో సంరక్షించండి, మీరు ఎప్పుడైనా తిరిగి చూడవచ్చు.',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'ఆయుర్వేదం', 
        desc: 'మీ త్రైమాసికం లేదా ప్రసవానంతర కాలానికి భారతీయ జ్ఞానం - మీకు వ్యక్తిగతమైన ఆహారం, మూలికలు మరియు ఆచారాలు.',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'మాతృ యోగా', 
        desc: 'మీ బలం, శాంతి మరియు అనుబంధాన్ని పెంపొందించడానికి దశల వారీ యోగా రొటీన్లు.',
        link: '/yoga'
      }
    ],
    exploreNow: 'ఇప్పుడు అన్వేషించండి',
    journal: 'జర్నల్',
    memoryVault: 'మెమరీ వాల్ట్',
    ayurveda: 'ఆయుర్వేదం',
    yoga: 'యోగా',
    dayStreak: 'రోజుల స్ట్రీక్',
    jananiSays: 'జనని చెప్పింది',
    reminderError: 'దయచేసి ఒక తేదీని ఎంచుకోండి.',
    reminderSuccess: 'రిమైండర్ సేవ్ చేయబడింది!',
    description1: "జనని ఆరోగ్యం గర్భధారణకు ముందు, గర్భకాలంలో, ప్రసవానంతరం స్థానిక భాషలో ఆయుర్వేదం మరియు సాంస్కృతిక సంరక్షణ ఆధారిత ఏఐ మార్గదర్శనాన్ని మహిళలకు అందిస్తుంది.",

description2: "గ్రామీణ మరియు తక్కువ చదువున్న వినియోగదారుల కోసం రూపకల్పన చేయబడింది, ఇది వాయిస్ ఆధారిత ఆరోగ్య సహాయం, రిమైండర్లు, జర్నలింగ్ మరియు భావోద్వేగ ట్రాకింగ్ వంటి ఫీచర్లను అందిస్తుంది — దీని ద్వారా మాతృత్వ సంరక్షణను సులభతరం, వ్యక్తిగతీకృతం మరియు సాధికారతతో మార్చుతుంది.",

jananiSays: "జనని చెబుతోంది",
askJanani: "జననిని అడగండి...",

aiPlaceholder: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మైక్ నొక్కండి...",
downhead: "🌸 మీ ప్రయాణం, మా మద్దతు",
downcontent: "మీ మాతృత్వ ప్రయాణంలోని ప్రతి అడుగు విలువైనది. మేము మీకు మార్గనిర్దేశం, మద్దతు మరియు ఉత్సవానికి ఇక్కడ ఉన్నాము."

  },'kn-IN': {
    title: 'ಜನನಿ ಆರೋಗ್ಯ',
    subtitle: 'ತಾಯಂದಿರಿಗಾಗಿ ಭಾರತದ ಮೊದಲ ಧ್ವನಿ ಆಧಾರಿತ ಎಐ ಸಹಾಯಗಾರ.',
   
    checklistTitle: '🌸 ದೈನಂದಿನ ಆರೋಗ್ಯ ಪಟ್ಟಿ',
    checklistItems: [
      '3 ಲೀಟರ್ ನೀರು ಕುಡಿಯಿರಿ',
      'ಮಾತೃ ಯೋಗ ಮಾಡಿ',
      'ಆರೋಗ್ಯಕರ ಆಹಾರ ತಿನ್ನಿರಿ',
      'ಪ್ರಸವಪೂರ್ವ ಜೀವಸತ್ವಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ',
      'ಶ್ವಾಸೋಚ್ಛ್ವಾಸ ಅಭ್ಯಾಸ ಮಾಡಿ'
    ],
    reminderTitle: '🗓 ವೈದ್ಯರ ಭೇಟಿ ಜ್ಞಾಪನೆ',
    reminderLabel: 'ಭೇಟಿ ದಿನಾಂಕ',
    repeatLabel: 'ಪುನರಾವರ್ತಿಸಿ',
    daysRemaining: 'ಡಾಕ್ಟರ್ ಭೇಟಿ ಮಾಡಲು ಇನ್ನೂ {days} ದಿನಗಳಿವೆ',
nextVisitOn: 'ನಿಮ್ಮ ಮುಂದಿನ ತಪಾಸಣೆ {date}ರಂದು ಇದೆ',
visitToday: 'ಇಂದು ನಿಮ್ಮ ಡಾಕ್ಟರ್ ಭೇಟಿಯಿದೆ!',
visitPassed: 'ನಿಮ್ಮ ಡಾಕ್ಟರ್ ಭೇಟಿ {days} ದಿನಗಳ ಹಿಂದೆ ನಡೆಯಿತು',
noVisitScheduled: 'ಯಾವುದೇ ಡಾಕ್ಟರ್ ಭೇಟಿ ನಿರ್ಧರಿಸಲ್ಪಟ್ಟಿಲ್ಲ'
,
    frequencyOptions: [
      { value: 'once', label: 'ಒಮ್ಮೆ' },
      { value: 'weekly', label: 'ಸಾಪ್ತಾಹಿಕ' },
      { value: 'monthly', label: 'ಮಾಸಿಕ' }
    ],
    saveReminder: 'ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಿ',
    streakTitle: '🔥 ನೀವು ಸ್ಟ್ರೀಕ್‌ನಲ್ಲಿದ್ದೀರಿ!',
    streakText: 'ಸ್ಥಿರತೆಯ {streak}ನೇ ದಿನ',
    streakSubtext: 'ಮುಂದುವರಿಸಿ, ನೀವು ಅದ್ಭುತವಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ 💪',
    features: [
      { 
         key:'journal',
        title: 'ಜರ್ನಲ್', 
        desc: 'AI ಚಾಲಿತ ದೈನಂದಿನ ಭಾವನಾತ್ಮಕ ಸಾರಾಂಶಗಳು, ಮನಸ್ಥಿತಿ ಬದಲಾವಣೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮತ್ತು ಸಣ್ಣ ವಿಜಯಗಳನ್ನು ಆಚರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
        link: '/journal'
      },
      {  key:'memoryvault',
        title: 'ಮೆಮೊರಿ ವಾಲ್ಟ್', 
        desc: 'ಮೈಲಿಗಲ್ಲುಗಳು, ಭಾವನೆಗಳು ಮತ್ತು ಫೋಟೋಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸಂರಕ್ಷಿಸಿ, ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಪುನಃ ನೋಡಬಹುದು.',
        link: '/memory-vault'
      },
      {  key:'ayurveda',
        title: 'ಆಯುರ್ವೇದ', 
        desc: 'ನಿಮ್ಮ ತ್ರೈಮಾಸಿಕ ಅಥವಾ ಪ್ರಸವೋತ್ತರ ಅವಧಿಗೆ ಭಾರತೀಯ ಜ್ಞಾನ - ನಿಮಗಾಗಿ ವೈಯಕ್ತಿಕಗೊಳಿಸಲಾದ ಆಹಾರ, ಔಷಧಿಗಳು ಮತ್ತು ಆಚರಣೆಗಳು.',
        link: '/ayurveda'
      },
      {  key:'yoga',
        title: 'ಮಾತೃ ಯೋಗ', 
        desc: 'ನಿಮ್ಮ ಶಕ್ತಿ, ಶಾಂತಿ ಮತ್ತು ಸಂಪರ್ಕವನ್ನು ಬೆಳೆಸಲು ಹಂತ-ವಾರು ಯೋಗ ವ್ಯವಸ್ಥೆ.',
        link: '/yoga'
      }
    ],
    exploreNow: 'ಈಗ ಅನ್ವೇಷಿಸಿ',
    journal: 'ಜರ್ನಲ್',
    memoryVault: 'ಮೆಮೊರಿ ವಾಲ್ಟ್',
    ayurveda: 'ಆಯುರ್ವೇದ',
    yoga: 'ಯೋಗ',
    dayStreak: 'ದಿನಗಳ ಸ್ಟ್ರೀಕ್',
    jananiSays: 'ಜನನಿ ಹೇಳುತ್ತಾಳೆ',
    reminderError: 'ದಯವಿಟ್ಟು ದಿನಾಂಕವನ್ನು ಆರಿಸಿ.',
    reminderSuccess: 'ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ!',
    description1: "ಜನನಿ ಆರೋಗ್ಯ ಗರ್ಭಧಾರಣೆಗೆ ಮೊದಲು, ಗರ್ಭಾವಸ್ಥೆ ಮತ್ತು ಪ್ರಸವಾನಂತರ ಸ್ಥಳೀಯ ಭಾಷೆಯಲ್ಲಿ ಆಯುರ್ವೇದ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಆರೈಕೆ ಆಧಾರಿತ ಎಐ ಮಾರ್ಗದರ್ಶನವನ್ನು ಮಹಿಳೆಗಳಿಗೆ ನೀಡುತ್ತದೆ.",

description2: "ಗ್ರಾಮೀಣ ಹಾಗೂ ಕಡಿಮೆ ಶಿಕ್ಷಣದ ಬಳಕೆದಾರರಿಗೆ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದ್ದು, ಇದು ಧ್ವನಿ ಆಧಾರಿತ ಆರೋಗ್ಯ ಸಹಾಯ, ಜ್ಞಾಪಕಗಳು, ದಿನಚರಿ ಬರೆಯುವುದು ಮತ್ತು ಭಾವನಾತ್ಮಕ ಟ್ರ್ಯಾಕಿಂಗ್ ಮುಂತಾದ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ — ಇದು ತಾಯಂದಿರಿಗೆ ಆರೈಕೆಯನ್ನು ಸುಲಭ, ವೈಯಕ್ತಿಕ ಮತ್ತು ಶಕ್ತಿದಾಯಕವಾಗಿಸುತ್ತದೆ.",

jananiSays: "ಜನನಿ ಹೇಳುತ್ತಾಳೆ",
askJanani: "ಜನನಿಯನ್ನ ಕೇಳಿ...",

aiPlaceholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ টাইಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿರಿ...",
downhead: "🌸 ನಿಮ್ಮ ಪ್ರಯಾಣ, ನಮ್ಮ ಬೆಂಬಲ",
downcontent: "ನಿಮ್ಮ ತಾಯತ್ವದ ಪ್ರಯಾಣದ ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯೂ ಅಮೂಲ್ಯವಾದದ್ದು. ಮಾರ್ಗದರ್ಶನ, ಬೆಂಬಲ ಮತ್ತು ಹಬ್ಬದ ಸಲುವಾಗಿ ನಾವು ಇಲ್ಲಿ ಇದ್ದೇವೆ."

  },'mr-IN': {
    title: 'जननी आरोग्य',
    subtitle: 'मातांसाठी भारताचा पहिला व्हॉइस-आधारित एआय सहकारी.',
   
    checklistTitle: '🌸 दैनंदिन आरोग्य तपासणी यादी',
    checklistItems: [
      '3 लिटर पाणी प्या',
      'मातृ योगा करा',
      'निरोगी आहार घ्या',
      'प्रसूतिपूर्व जीवनसत्त्वे घ्या',
      'श्वासोच्छ्वासाचा सराव करा'
    ],
    reminderTitle: '🗓 डॉक्टर भेटीची आठवण',
    reminderLabel: 'भेटीची तारीख',
    repeatLabel: 'पुनरावृत्ती',
    daysRemaining: 'डॉक्टरांच्या भेटीसाठी अजून {days} दिवस उरले आहेत',
nextVisitOn: 'तुमची पुढील तपासणी {date} रोजी आहे',
visitToday: 'आज तुमची डॉक्टरांची भेट आहे!',
visitPassed: 'तुमची डॉक्टरांची भेट {days} दिवसांपूर्वी झाली होती',
noVisitScheduled: 'कोणतीही डॉक्टर भेट नियोजित नाही'
,
    frequencyOptions: [
      { value: 'once', label: 'एकदा' },
      { value: 'weekly', label: 'साप्ताहिक' },
      { value: 'monthly', label: 'मासिक' }
    ],
    saveReminder: 'आठवण जतन करा',
    streakTitle: '🔥 तुम्ही एका स्ट्रीकवर आहात!',
    streakText: 'सातत्याचा {streak} वा दिवस',
    streakSubtext: 'सुरू ठेवा, तुम्ही अप्रतिम करत आहात 💪',
    features: [
      {  key:'journal',
        title: 'जर्नल', 
        desc: 'AI-चालित दैनंदिन भावनिक सारांश, मनस्थितीतील बदल ट्रॅक करण्यास आणि लहान विजय साजरे करण्यास मदत करते.',
        link: '/journal'
      },
      {  key:'memoryvault',
        title: 'मेमरी वॉल्ट', 
        desc: 'मैलाचे दगड, भावना आणि फोटो एकाच ठिकाणी जतन करा जे तुम्ही कधीही पुन्हा पाहू शकता.',
        link: '/memory-vault'
      },
      {  key:'ayurveda',
        title: 'आयुर्वेद', 
        desc: 'तुमच्या त्रैमासिक किंवा प्रसूतोत्तर काळासाठी भारतीय ज्ञान - तुमच्यासाठी वैयक्तिक केलेले अन्न, औषधी आणि विधी.',
        link: '/ayurveda'
      },
      {  key:'yoga',
        title: 'मातृ योगा', 
        desc: 'तुमची शक्ती, शांतता आणि जोडणी वाढविण्यासाठी टप्प्यानुसार योगा रूटीन.',
        link: '/yoga'
      }
    ],
    exploreNow: 'आता एक्सप्लोर करा',
    journal: 'जर्नल',
    memoryVault: 'मेमरी वॉल्ट',
    ayurveda: 'आयुर्वेद',
    yoga: 'योगा',
    dayStreak: 'दिवसांचा स्ट्रीक',
    jananiSays: 'जननी म्हणते',
    reminderError: 'कृपया तारीख निवडा.',
    reminderSuccess: 'आठवण जतन केली!',
    description1: "जननी आरोग्य गर्भधारणपूर्व, गर्भावस्था आणि प्रसवानंतर महिलांना स्थानिक भाषेत, आयुर्वेद आणि सांस्कृतिक काळजीवर आधारित एआय मार्गदर्शन देते.",

description2: "ग्रामीण आणि कमी साक्षरता असलेल्या वापरकर्त्यांसाठी डिझाइन केलेले, हे व्हॉइस-आधारित आरोग्य सहाय्य, स्मरणपत्रे, जर्नलिंग आणि भावनिक ट्रॅकिंग यांसारख्या सुविधा प्रदान करते — ज्यामुळे मातृत्वाची निगा सुलभ, वैयक्तिकृत आणि सक्षम बनते.",

jananiSays: "जननी म्हणते",
askJanani: "जननीला विचारा...",

aiPlaceholder: "आपला प्रश्न येथे टाइप करा किंवा मायक्रोफोन दाबा...",
downhead: "🌸 तुमचा प्रवास, आमचा पाठिंबा",
downcontent: "तुमच्या मातृत्व प्रवासातील प्रत्येक पाऊल अमूल्य आहे. मार्गदर्शन, पाठिंबा आणि साजरा करण्यासाठी आम्ही तुमच्यासोबत आहोत."

  },'gu-IN': {
    title: 'જનની આરોગ્ય',
    subtitle: 'માતાઓ માટે ભારતનો પહેલો વોઇસ આધારિત એઆઇ સાથી.',
    
    checklistTitle: '🌸 દૈનિક આરોગ્ય ચેકલિસ્ટ',
    checklistItems: [
      '3 લિટર પાણી પીઓ',
      'માતૃ યોગા કરો',
      'સ્વસ્થ ખોરાક ખાઓ',
      'પ્રસૂતિ પૂર્વ વિટામિન લો',
      'શ્વાસ લેવાની કસરત કરો'
    ],
    reminderTitle: '🗓 ડૉક્ટરની મુલાકાતની યાદ અપાવનાર',
    reminderLabel: 'મુલાકાત તારીખ',
    repeatLabel: 'પુનરાવર્તન',
    daysRemaining: 'ડૉક્ટર મુલાકાત માટે હજુ {days} દિવસ બાકી છે',
nextVisitOn: 'તમારી આગામી ચકાસણી {date}ના રોજ છે',
visitToday: 'આજે તમારી ડૉક્ટર મુલાકાત છે!',
visitPassed: 'તમારી ડૉક્ટર મુલાકાતને {days} દિવસ થઈ ગયા',
noVisitScheduled: 'કોઈ ડૉક્ટર મુલાકાત નક્કી નથી'
,
    frequencyOptions: [
      { value: 'once', label: 'એક વાર' },
      { value: 'weekly', label: 'સાપ્તાહિક' },
      { value: 'monthly', label: 'માસિક' }
    ],
    saveReminder: 'રિમાઇન્ડર સેવ કરો',
    streakTitle: '🔥 તમે સ્ટ્રીક પર છો!',
    streakText: 'સતતતાનો {streak}મો દિવસ',
    streakSubtext: 'ચાલુ રાખો, તમે અદભુત કરી રહ્યાં છો 💪',
    features: [
      { key:'journal',
        title: 'જર્નલ', 
        desc: 'AI-સંચાલિત દૈનિક ભાવનાત્મક સારાંશ, મૂડ શિફ્ટને ટ્રૅક કરવામાં અને નાની જીતો ઉજવવામાં મદદ કરે છે.',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'મેમરી વૉલ્ટ', 
        desc: 'માઇલસ્ટોન, ભાવનાઓ અને ફોટા એક જગ્યાએ સંગ્રહો જેને તમે કોઈપણ સમયે ફરી જોઈ શકો છો.',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'આયુર્વેદ', 
        desc: 'તમારા ત્રિમાસિક અથવા પ્રસૂતિ પછીના સમય માટે ભારતીય જ્ઞાન - તમારા માટે વ્યક્તિગત ખોરાક, જડીબુટ્ટીઓ અને રિવાજો.',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'માતૃ યોગા', 
        desc: 'તમારી શક્તિ, શાંતિ અને જોડાણને પોષવા માટે તબક્કાવાર યોગા રુટીન.',
        link: '/yoga'
      }
    ],
    exploreNow: 'હવે અન્વેષણ કરો',
    journal: 'જર્નલ',
    memoryVault: 'મેમરી વૉલ્ટ',
    ayurveda: 'આયુર્વેદ',
    yoga: 'યોગા',
    dayStreak: 'દિવસોની સ્ટ્રીક',
    jananiSays: 'જનની કહે છે',
    reminderError: 'કૃપા કરીને તારીખ પસંદ કરો.',
    reminderSuccess: 'રિમાઇન્ડર સેવ થયું!',
    description1: "જનની આરોગ્ય ગર્ભધારણ પહેલા, ગર્ભાવસ્થા દરમિયાન અને પ્રસૂતિ પછી મહિલાઓને સ્થાનિક ભાષામાં આયુર્વેદ અને સંસ્કૃતિક દેખભાળ પર આધારિત એઆઇ માર્ગદર્શન આપે છે.",

description2: "ગ્રામિણ અને ઓછી સાક્ષરતા ધરાવતા વપરાશકર્તાઓ માટે ડિઝાઇન કરવામાં આવ્યું છે, જેમાં અવાજ આધારિત આરોગ્ય સહાયતા, યાદ અપાવટો, જર્નલિંગ અને ભાવનાત્મક ટ્રેકિંગ જેવી વિશેષતાઓ સમાવિષ્ટ છે — જેના દ્વારા માતૃત્વ સંભાળને સરળ, વ્યક્તિગત અને સશક્ત બનાવવામાં આવે છે.",

jananiSays: "જનની કહે છે",
askJanani: "જનનીને પૂછો...",

aiPlaceholder: "તમારો પ્રશ્ન અહીં લખો અથવા માઈક્રોફોન દબાવો...",
downhead: "🌸 તમારું યાત્રા, અમારું સહયોગ",
downcontent: "તમારાં માતૃત્વ યાત્રાનું દરેક પગથિયું અમૂલ્ય છે. અમે માર્ગદર્શન, સહારો અને ઉજવણી માટે તમારી સાથે છીએ."

  },'bn-IN': {
    title: 'জননী আরোগ্য',
    subtitle: 'মায়েদের জন্য ভারতের প্রথম ভয়েস-ভিত্তিক এআই সঙ্গী।',
   
    checklistTitle: '🌸 দৈনিক স্বাস্থ্য চেকলিস্ট',
    checklistItems: [
      '৩ লিটার জল পান করুন',
      'মাতৃ যোগা করুন',
      'স্বাস্থ্যকর খাবার খান',
      'প্রসবপূর্ব ভিটামিন নিন',
      'শ্বাস-প্রশ্বাসের অনুশীলন করুন'
    ],
    reminderTitle: '🗓 ডাক্তারের ভিজিট রিমাইন্ডার',
    reminderLabel: 'ভিজিটের তারিখ',
    repeatLabel: 'পুনরাবৃত্তি',
    daysRemaining: 'ডাক্তারের ভিজিটে এখনও {days} দিন বাকি',
nextVisitOn: 'আপনার পরবর্তী চেকআপ {date} তারিখে নির্ধারিত',
visitToday: 'আজ আপনার ডাক্তারের ভিজিট আছে!',
visitPassed: 'আপনার ডাক্তারের ভিজিট {days} দিন আগে হয়েছিল',
noVisitScheduled: 'কোনো ডাক্তারের ভিজিট নির্ধারিত নেই'
,
    frequencyOptions: [
      { value: 'once', label: 'একবার' },
      { value: 'weekly', label: 'সাপ্তাহিক' },
      { value: 'monthly', label: 'মাসিক' }
    ],
    saveReminder: 'রিমাইন্ডার সেভ করুন',
    streakTitle: '🔥 আপনি একটি স্ট্রিকে আছেন!',
    streakText: '{streak} দিন ধারাবাহিকতা',
    streakSubtext: 'চালিয়ে যান, আপনি দুর্দান্ত করছেন 💪',
    features: [
      { key:'journal',
        title: 'জার্নাল', 
        desc: 'AI-চালিত দৈনিক মানসিক সারাংশ, মেজাজ পরিবর্তন ট্র্যাক করতে এবং ছোট জয় উদযাপন করতে সাহায্য করে।',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'মেমোরি ভল্ট', 
        desc: 'মাইলফলক, আবেগ এবং ফটোগুলি এক জায়গায় সংরক্ষণ করুন যা আপনি যেকোনো সময় আবার দেখতে পারেন।',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'আয়ুর্বেদ', 
        desc: 'আপনার ত্রৈমাসিক বা প্রসবোত্তর সময়ের জন্য ভারতীয় জ্ঞান - আপনার জন্য ব্যক্তিগতকৃত খাবার, ভেষজ ও রীতি।',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'মাতৃ যোগা', 
        desc: 'আপনার শক্তি, শান্তি এবং সংযোগ লালন করার জন্য পর্যায়ক্রমিক যোগা রুটিন।',
        link: '/yoga'
      }
    ],
    exploreNow: 'এখনই এক্সপ্লোর করুন',
    journal: 'জার্নাল',
    memoryVault: 'মেমোরি ভল্ট',
    ayurveda: 'আয়ুর্বেদ',
    yoga: 'যোগা',
    dayStreak: 'দিনের স্ট্রিক',
    jananiSays: 'জননী বলেন',
    reminderError: 'অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।',
    reminderSuccess: 'রিমাইন্ডার সেভ করা হয়েছে!',
    description1: "জননী আরোগ্য গর্ভধারণ-পূর্ব, গর্ভাবস্থা ও প্রসব পরবর্তী সময়ে মহিলাদের স্থানীয় ভাষায়, আয়ুর্বেদ ও সাংস্কৃতিক যত্নভিত্তিক এআই নির্দেশনা দেয়।",

description2: "গ্রামাঞ্চল এবং কম শিক্ষিত ব্যবহারকারীদের জন্য ডিজাইন করা হয়েছে, এটি ভয়েস-ভিত্তিক স্বাস্থ্য সহায়তা, অনুস্মারক, জার্নালিং এবং আবেগজনিত ট্র্যাকিং-এর মতো বৈশিষ্ট্য প্রদান করে — যার মাধ্যমে মাতৃত্বকালীন যত্নকে সহজ, ব্যক্তিগত এবং শক্তিশালী করে তোলে।",

jananiSays: "জননী বলছেন",
askJanani: "জননীকে জিজ্ঞাসা করুন...",

aiPlaceholder: "আপনার প্রশ্ন এখানে টাইপ করুন বা মাইক্রোফোন চাপুন...",
downhead: "🌸 আপনার যাত্রা, আমাদের সহায়তা",
downcontent: "মাতৃত্বের পথে আপনার প্রতিটি পদক্ষেপই অমূল্য। আমরা আছি আপনাকে পথ দেখাতে, সহায়তা করতে এবং উদযাপন করতে।"

  },'ml-IN': {
    title: 'ജനനി ആരോഗ്യ',
    subtitle: 'മാതാക്കൾക്കായുള്ള ഇന്ത്യയിലെ ആദ്യ ശബ്ദ അധിഷ്ഠിത എഐ കൂട്ടുകാരൻ.',
    description1: 'ജനനി ആരോഗ്യം ഗർഭധാരണത്തിന് മുൻപും, ഗർഭകാലത്തും, പ്രസവത്തിന് ശേഷവും സ്ത്രീകൾക്ക് തദ്ദേശഭാഷയിൽ ആയുര്‍വേദവും സാംസ്കാരിക പരിചരണവുമുള്ള എഐ മാർഗ്ഗനിർദ്ദേശം നൽകുന്നു.',
    description2: 'വോയ്സ്-ഫസ്റ്റ്, ഭാഷാസൗഹൃദപരവും വ്യക്തിഗതമായ അനുഭവവുമാണ്. ആയുര്‍വേദത്തില്‍ നിന്നും ഓര്‍മകളിലേക്കുള്ള യാത്ര, നിങ്ങളോടൊപ്പം നടക്കുന്നു.',
    checklistTitle: '🌸 ദൈനംദിന ആരോഗ്യ ചെക്‌ലിസ്റ്റ്',
    checklistItems: [
      '3 ലിറ്റർ വെള്ളം കുടിക്കുക',
      'മാതൃത്വ യോഗ ചെയ്യുക',
      'ആരോഗ്യകരമായ ഭക്ഷണം കഴിക്കുക',
      'ഗർഭകാല വിറ്റാമിനുകൾ കഴിക്കുക',
      'ശ്വാസോപശ്വാസ അഭ്യാസങ്ങൾ ചെയ്യുക'
    ],
    reminderTitle: '🗓 ഡോക്ടർ വിസിറ്റ് ഓർമ്മിപ്പിക്കൽ',
    reminderLabel: 'വിഷിറ്റിന്റെ തീയതി',
    repeatLabel: 'പുനരാവൃത്തി',
    daysRemaining: 'ഡോക്ടറെ സന്ദർശിക്കാൻ ഇനി {days} ദിവസമാണ് ബാക്കി',
nextVisitOn: 'നിങ്ങളുടെ അടുത്ത പരിശോധ {date}നാണ്',
visitToday: 'ഇന്ന് നിങ്ങളുടെ ഡോക്ടർ സന്ദർശനമാണ്!',
visitPassed: 'നിങ്ങളുടെ ഡോക്ടർ സന്ദർശനം {days} ദിവസം മുമ്പ് ആയിരുന്നു',
noVisitScheduled: 'ഏത് ഡോക്ടർ സന്ദർശവും നിശ്ചയിച്ചിട്ടില്ല'
,
    frequencyOptions: [
      { value: 'once', label: 'ഒരിക്കല്‍' },
      { value: 'weekly', label: 'ആഴ്ചയില്‍ ഒന്ന്' },
      { value: 'monthly', label: 'മാസത്തിൽ ഒന്ന്' }
    ],
    saveReminder: 'ഓർമ്മിപ്പിക്കൽ സേവ് ചെയ്യുക',
    streakTitle: '🔥 നിങ്ങൾ ഒരു സ്ട്രീക്കിലാണ്!',
    streakText: '{streak} ദിവസത്തെ തുടർച്ച',
    streakSubtext: 'തുടരുക, നിങ്ങൾ അതിവിശേഷമാണ് 💪',
    features: [
      { key:'journal',
        title: 'ജേർണൽ', 
        desc: 'AI-നിർവാഹിതമായ ദൈനംദിന മാനസിക സംഗ്രഹം, മനോഭാവ വ്യത്യാസങ്ങൾ ട്രാക്ക് ചെയ്യാനും ചെറുജയങ്ങൾ ആഘോഷിക്കാനും സഹായിക്കുന്നു.',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'മെമ്മറി വാൾട്ട്', 
        desc: 'മൈൽസ്റ്റോണുകൾ, വികാരങ്ങൾ, ഫോട്ടോകൾ എല്ലാം ഒരേ ഇടത്ത് സൂക്ഷിക്കാം, നിങ്ങൾക്ക് പിന്നീട് എപ്പോഴും കാണാൻ കഴിയുന്നു.',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'ആയുര്‍വേദം', 
        desc: 'നിങ്ങളുടെ ത്രൈമാസിക അല്ലെങ്കിൽ പ്രസവാനന്തര ഘട്ടങ്ങൾക്കായി ഇന്ത്യൻ ജ്ഞാനം - ഭക്ഷണം, ഔഷധങ്ങൾ, രീതി എന്നിവ വ്യക്തിഗതമായി ഒരുക്കുന്നു.',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'മാതൃത്വ യോഗ', 
        desc: 'ശക്തിയും സമാധാനവും ബന്ധവും വളർത്തുന്ന ഘട്ടാനുസൃത യോഗാ റൂട്ടീൻ.',
        link: '/yoga'
      }
    ],
    exploreNow: 'ഇപ്പോൾ തന്നെ എക്സ്പ്ലോർ ചെയ്യുക',
    journal: 'ജേർണൽ',
    memoryVault: 'മെമ്മറി വാൾട്ട്',
    ayurveda: 'ആയുര്‍വേദം',
    yoga: 'യോഗ',
    dayStreak: 'ദിന സ്ട്രീക്ക്',
    jananiSays: 'ജനനി പറയുന്നു',
    reminderError: 'ദയവായി ഒരു തീയതി തിരഞ്ഞെടുക്കുക.',
    reminderSuccess: 'ഓർമ്മിപ്പിക്കൽ സേവ് ചെയ്തു!',
    description1: "ഇന്ത്യൻ അമ്മമാർക്ക് വേണ്ടി ഇന്ത്യയിലെ ആദ്യത്തെ ബഹുഭാഷാ, ശബ്ദാധാരിതമായ AI പങ്കാളി. ജനനി ആരോഗ്യ ഗർഭധാരണത്തിന് മുമ്പ്, ഗർഭകാലത്ത്, പ്രസവാനന്തര കാലയളവിൽ ആയുര്‍വേദവും സാംസ്കാരിക പരിചരണവുമെല്ലാം അടിസ്ഥാനമാക്കിയുള്ള പ്രാദേശിക ഭാഷയിൽ AI വഴികാട്ടൽ നൽകുന്നു.",

description2: "ഗ്രാമീണവും കുറച്ച് വായനാശക്തിയുള്ളവരുമായ ഉപയോക്താക്കളെ ലക്ഷ്യമാക്കി രൂപകൽപന ചെയ്തിരിക്കുന്നതാണിത്. ശബ്ദം അടിസ്ഥാനമാക്കിയുള്ള ആരോഗ്യസഹായം, ഓർമ്മപ്പെടുത്തലുകൾ, ജേർണൽ നടത്തൽ, മാനസിക അവസ്ഥയുടെ നിരീക്ഷണം എന്നിവയുള്ള സവിശേഷതകൾ ഇതിൽ ഉൾപ്പെടുത്തിയിട്ടുണ്ട് — ഇത് മാതൃത്വ പരിചരണത്തെ കൂടുതൽ എളുപ്പമാക്കിയും വ്യക്തിഗതവുമായും ശക്തിപ്പെടുത്തിയുമാണ് മാറ്റുന്നത്.",

jananiSays: "ജനനി പറയുന്നു",
askJanani: "ജനനിയോട് ചോദിക്കുക...",

aiPlaceholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്ക് അമർത്തുക...",
downhead: "🌸 നിങ്ങളുടെ യാത്ര, ഞങ്ങളുടെ പിന്തുണ",
downcontent: "നിങ്ങളുടെ മാതൃത്വ യാത്രയിലെ ഓരോ പടിയുമാണ് വിലപ്പെട്ടത്. നിങ്ങൾക്ക് ഞങ്ങൾ വഴികാട്ടാനും, പിന്തുണ നൽകാനും, ആഹ്ലാദിപ്പിക്കാനും ഇവിടെ ഉണ്ടാകുന്നു."

  },'pa-IN': {
    title: 'ਜਨਨੀ ਆਰੋਗਿਆ',
    subtitle: 'ਮਾਵਾਂ ਲਈ ਭਾਰਤ ਦਾ ਪਹਿਲਾ ਵਾਇਸ-ਅਧਾਰਤ ਏਆਈ ਸਾਥੀ।',
  
    checklistTitle: '🌸 ਰੋਜ਼ਾਨਾ ਸਿਹਤ ਚੈੱਕਲਿਸਟ',
    checklistItems: [
      '3 ਲੀਟਰ ਪਾਣੀ ਪੀਓ',
      'ਮਾਤਾ ਯੋਗ ਕਰੋ',
      'ਸਿਹਤਮੰਦ ਖਾਣਾ ਖਾਓ',
      'ਗਰਭਪੂਰਵ ਵਟਾਮਿਨ ਲਵੋ',
      'ਸਾਹ ਲੈਣ ਦੇ ਅਭਿਆਸ ਕਰੋ'
    ],
    reminderTitle: '🗓 ਡਾਕਟਰ ਦੌਰੇ ਦੀ ਯਾਦ ਦਿਵਾਈ',
    reminderLabel: 'ਮਿਲਣ ਦੀ ਤਾਰੀਖ',
    repeatLabel: 'ਦੁਹਰਾਉਣਾ',
    daysRemaining: 'ਡਾਕਟਰ ਦੀ ਮੁਲਾਕਾਤ ਲਈ ਹੋਰ {days} ਦਿਨ ਬਾਕੀ ਹਨ',
nextVisitOn: 'ਤੁਹਾਡੀ ਅਗਲੀ ਜਾਂਚ {date} ਨੂੰ ਹੈ',
visitToday: 'ਅੱਜ ਤੁਹਾਡੀ ਡਾਕਟਰ ਨਾਲ ਮੁਲਾਕਾਤ ਹੈ!',
visitPassed: 'ਤੁਹਾਡੀ ਡਾਕਟਰ ਦੀ ਮੁਲਾਕਾਤ {days} ਦਿਨ ਪਹਿਲਾਂ ਹੋਈ ਸੀ',
noVisitScheduled: 'ਕੋਈ ਵੀ ਡਾਕਟਰ ਦੀ ਮੁਲਾਕਾਤ ਨਿਯਤ ਨਹੀਂ ਕੀਤੀ ਗਈ'
,
    frequencyOptions: [
      { value: 'once', label: 'ਇੱਕ ਵਾਰੀ' },
      { value: 'weekly', label: 'ਹਫਤਾਵਾਰ' },
      { value: 'monthly', label: 'ਮਾਸਿਕ' }
    ],
    saveReminder: 'ਰੀਮਾਈਂਡਰ ਸੇਵ ਕਰੋ',
    streakTitle: '🔥 ਤੁਸੀਂ ਇੱਕ ਸਟ੍ਰੀਕ ’ਤੇ ਹੋ!',
    streakText: '{streak} ਦਿਨਾਂ ਦੀ ਲਗਾਤਾਰਤਾ',
    streakSubtext: 'ਜਾਰੀ ਰੱਖੋ, ਤੁਸੀਂ ਸ਼ਾਨਦਾਰ ਕਰ ਰਹੇ ਹੋ 💪',
    features: [
      { key:'journal',
        title: 'ਜਰਨਲ', 
        desc: 'ਏਆਈ-ਚਲਿਤ ਰੋਜ਼ਾਨਾ ਮਾਨਸਿਕ ਸੰਖੇਪ, ਮੂਡ ਬਦਲਾਅ ਨੂੰ ਟਰੈਕ ਕਰਨ ਅਤੇ ਛੋਟੀਆਂ ਖੁਸ਼ੀਆਂ ਮਨਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
        link: '/journal'
      },
      { key:'memoryvault',
        title: 'ਮੈਮੋਰੀ ਵਾਲਟ', 
        desc: 'ਮਨੋਰਥ, ਭਾਵਨਾ ਤੇ ਫੋਟੋਆਂ ਨੂੰ ਇੱਕ ਥਾਂ ਸੰਭਾਲੋ ਜੋ ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਵਾਪਸ ਦੇਖ ਸਕਦੇ ਹੋ।',
        link: '/memory-vault'
      },
      { key:'ayurveda',
        title: 'ਆਯੁਰਵੇਦ', 
        desc: 'ਤੁਹਾਡੇ ਤਿਮਾਹੀ ਜਾਂ ਜਣਮ ਤੋਂ ਬਾਅਦ ਦੇ ਪੜਾਅ ਲਈ ਭਾਰਤੀ ਗਿਆਨ - ਵਿਅਕਤੀਗਤ ਭੋਜਨ, ਜੜੀਆਂ ਅਤੇ ਰਿਵਾਜ।',
        link: '/ayurveda'
      },
      { key:'yoga',
        title: 'ਮਾਤਾ ਯੋਗ', 
        desc: 'ਤਾਕਤ, ਸ਼ਾਂਤੀ ਅਤੇ ਜੁੜਾਅ ਨੂੰ ਪਾਲਣ ਲਈ ਪੜਾਅ ਅਨੁਸਾਰ ਯੋਗ ਰੂਟੀਨ।',
        link: '/yoga'
      }
    ],
    exploreNow: 'ਹੁਣੇ ਐਕਸਪਲੋਰ ਕਰੋ',
    journal: 'ਜਰਨਲ',
    memoryVault: 'ਮੈਮੋਰੀ ਵਾਲਟ',
    ayurveda: 'ਆਯੁਰਵੇਦ',
    yoga: 'ਯੋਗ',
    dayStreak: 'ਦਿਨ ਸਟ੍ਰੀਕ',
    jananiSays: 'ਜਨਨੀ ਕਹਿੰਦੀ ਹੈ',
    reminderError: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਤਾਰੀਖ ਚੁਣੋ।',
    reminderSuccess: 'ਰੀਮਾਈਂਡਰ ਸੇਵ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ!',
    description1: "ਜਨਨੀ ਆਰੋਗਿਆ ਗਰਭ ਧਾਰਣ ਤੋਂ ਪਹਿਲਾਂ, ਗਰਭ ਅਵਸਥਾ ਦੌਰਾਨ ਅਤੇ ਡਿਲਿਵਰੀ ਤੋਂ ਬਾਅਦ ਮਹਿਲਾਵਾਂ ਨੂੰ ਦੇਸੀ ਭਾਸ਼ਾ ਵਿੱਚ ਆਯੁਰਵੇਦ ਅਤੇ ਸੱਭਿਆਚਾਰਕ ਦੇਖਭਾਲ ਅਧਾਰਿਤ ਏਆਈ ਰਾਹਨੁਮਾਈ ਦਿੰਦਾ ਹੈ।",

description2: "ਪੇਂਡੂ ਅਤੇ ਘੱਟ ਸਿੱਖਿਆ ਵਾਲੇ ਉਪਭੋਗਤਾਵਾਂ ਲਈ ਡਿਜ਼ਾਈਨ ਕੀਤਾ ਗਿਆ, ਇਹ ਆਵਾਜ਼-ਅਧਾਰਤ ਸਿਹਤ ਸਹਾਇਤਾ, ਯਾਦ ਦਿਲਾਉਣ ਵਾਲੀਆਂ ਸੇਵਾਵਾਂ, ਜਰਨਲਿੰਗ ਅਤੇ ਭਾਵਨਾਤਮਕ ਟਰੈਕਿੰਗ ਵਰਗੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ — ਜਿਸ ਨਾਲ ਮਾਤਾ-ਸੰਭਾਲ ਆਸਾਨ, ਨਿੱਜੀ ਅਤੇ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਦੀ ਹੈ।",

jananiSays: "ਜਨਨੀ ਕਹਿੰਦੀ ਹੈ",
askJanani: "ਜਨਨੀ ਨੂੰ ਪੁੱਛੋ...",

aiPlaceholder: "ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ ਜਾਂ ਮਾਈਕ ਦਬਾਓ...",
downhead: "🌸 ਤੁਹਾਡੀ ਯਾਤਰਾ, ਸਾਡਾ ਸਹਿਯੋਗ",
downcontent: "ਮਾਤਾ ਬਣਨ ਦੀ ਤੁਹਾਡੀ ਹਰ ਇਕ ਕਦਮ ਕੀਮਤੀ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੀ ਮਦਦ, ਸਹਿਯੋਗ ਅਤੇ ਖੁਸ਼ੀ ਮਨਾਉਣ ਲਈ ਇੱਥੇ ਹਾਂ।"

  }


    // Continue for other languages
  };
  // Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function Dashboard() {
  const [aiReply, setAiReply] = useState('');
  const [stage, setStage] = useState('');
  const [checks, setChecks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderFreq, setReminderFreq] = useState('once');
  const [msg, setMsg] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [translations, setTranslations] = useState(TRANSLATIONS['en-IN']);
  const [nextVisitDate, setNextVisitDate] = useState(null);
  const [isAiReplying, setIsAiReplying] = useState(false);
  
  const auth = getAuth();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  // Load saved reminder function
  const loadSavedReminder = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const reminderRef = collection(db, 'users', user.uid, 'reminders');
      const querySnapshot = await getDocs(reminderRef);
      
      if (!querySnapshot.empty) {
        let latestReminder = null;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!latestReminder || new Date(data.date) > new Date(latestReminder.date)) {
            latestReminder = data;
          }
        });
        
        if (latestReminder) {
          setReminderDate(latestReminder.date);
          setReminderFreq(latestReminder.frequency || 'once');
        }
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  // Calculate days remaining effect
  useEffect(() => {
    if (!reminderDate) return;
    
    const today = dayjs();
    const visitDate = dayjs(reminderDate);
    const daysDiff = visitDate.diff(today, 'day');
    
    setNextVisitDate({
      date: visitDate.format('DD MMMM YYYY'),
      daysRemaining: daysDiff
    });
  }, [reminderDate]);

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en-IN';
    setLanguage(savedLang);
    setTranslations(TRANSLATIONS[savedLang] || TRANSLATIONS['en-IN']);
  }, []);

  // Load checklist items
  const CHECK_ITEMS = translations.checklistItems;
  const todayKey = () => `checklist_${new Date().toISOString().split('T')[0]}`;

  useEffect(() => {
    const key = todayKey();
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved) && saved.length === CHECK_ITEMS.length) {
      setChecks(saved);
    } else {
      const fresh = Array(CHECK_ITEMS.length).fill(false);
      setChecks(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    }
  }, [CHECK_ITEMS.length]);

  // Auth state and initial data loading
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadSavedReminder();
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setStage(d.stage || 'prepregnancy');
          setStreak(d.streak || 0);
        }
      }
    });
    return () => unsub();
  }, [auth]);

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const updateStreakInFirestore = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const data = snap.data();

    if (data.lastCheckinDate === today) return;
    const newStreak = data.lastCheckinDate === yesterday ? (data.streak || 0) + 1 : 1;

    await updateDoc(ref, { streak: newStreak, lastCheckinDate: today });
    setStreak(newStreak);
  };

  const getVisitStatusText = () => {
    if (!nextVisitDate) return translations.noVisitScheduled;
    
    const { date, daysRemaining } = nextVisitDate;
    
    if (daysRemaining === 0) {
      return translations.visitToday;
    } else if (daysRemaining > 0) {
      return (
        <>
          <div className="text-xl font-semibold text-pink-600">
            {translations.daysRemaining.replace('{days}', daysRemaining)}
          </div>
          <div className="text-sm text-pink-400 mt-1">
            {translations.nextVisitOn.replace('{date}', date)}
          </div>
        </>
      );
    } else {
      return translations.visitPassed.replace('{days}', Math.abs(daysRemaining));
    }
  };

  const saveReminder = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!reminderDate) {
      setMsg({ type: 'error', text: translations.reminderError || 'Please pick a date.' });
      return;
    }
    try {
      const reminderRef = doc(collection(db, 'users', user.uid, 'reminders'));
      await setDoc(reminderRef, {
        id: reminderRef.id,
        email: user.email,
        date: reminderDate,
        frequency: reminderFreq,
        createdAt: new Date().toISOString()
      });
      
      setMsg({ type: 'success', text: translations.reminderSuccess || 'Reminder saved!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: translations.reminderError || 'Could not save reminder.' });
    }
  };

  const handleAiReply = (reply) => {
    setIsAiReplying(true);
    setTimeout(() => {
      setAiReply(reply);
      setIsAiReplying(false);
    }, 500);
  };

  const getAyurvedaPath = () =>
    stage === 'prepregnancy'
      ? '/preconception-ayurveda'
      : stage === 'pregnancy'
      ? '/pregnancy-ayurveda'
      : '/post-ayurveda';

  const getYogaPath = () =>
    stage === 'prepregnancy'
      ? '/preconception-yoga'
      : stage === 'pregnancy'
      ? '/pregnancy-yoga'
      : '/post-yoga';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-30"
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-rose-200 rounded-full opacity-40"
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-pink-300 rounded-full opacity-20"
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Enhanced Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-pink-200"
      >
        <motion.h1 
          className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-wide"
          whileHover={{ scale: 1.05 }}
        >
          {translations.title}
        </motion.h1>
        <div className="flex gap-4 items-center text-sm font-semibold text-gray-700">
          {streak > 0 && (
            <motion.span 
              className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs shadow-md"
              variants={pulseVariants}
              animate="pulse"
            >
                🔥 {streak}-{translations.dayStreak || 'day Streak'}
            </motion.span>
          )}
          <motion.button 
            onClick={() => navigate('/journal')} 
            className="hover:text-pink-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
             {translations.journal || 'Journal'}
          </motion.button>
          <motion.button 
            onClick={() => navigate('/memory-vault')} 
            className="hover:text-pink-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {translations.memoryVault || 'Memory Vault'}
          </motion.button>
          <motion.button 
            onClick={() => navigate(getAyurvedaPath())} 
            className="hover:text-pink-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
             {translations.ayurveda || 'Ayurveda'}
          </motion.button>
          <motion.button 
            onClick={() => navigate(getYogaPath())} 
            className="hover:text-pink-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {translations.yoga || 'Yoga'}
          </motion.button>
          <motion.button 
            onClick={() => navigate('/profile')} 
            className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            👤
          </motion.button>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto mt-8 bg-white/70 backdrop-blur-sm border border-pink-200 rounded-3xl shadow-2xl p-12 flex flex-col md:flex-row items-center gap-10 hover:shadow-pink-200 transition-all duration-500"
      >
        <motion.div 
          variants={itemVariants}
          className="flex-1"
        >
          <motion.h2 
            className="text-5xl font-bold bg-gradient-to-r from-pink-700 to-rose-700 bg-clip-text text-transparent mb-6 leading-tight"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {translations.subtitle}
          </motion.h2>
          <motion.p 
            className="text-gray-700 mb-4 leading-relaxed text-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {translations.description1}
          </motion.p>
          <motion.p 
            className="text-gray-700 text-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {translations.description2}
          </motion.p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-rose-200 rounded-xl blur-xl opacity-30"></div>
          <img 
            src={HeroImage} 
            alt="Hero" 
            className="relative w-full md:w-80 rounded-xl shadow-2xl object-cover" 
          />
        </motion.div>
      </motion.section>

   {/* Enhanced AI Input Section - No Continuous Movement */}
<motion.div 
  className="mt-12 px-4"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8, duration: 0.8 }}
>
  <div className="max-w-4xl mx-auto mb-8">
    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-2xl shadow-2xl">
      
      <motion.h2 
        className="text-3xl font-bold text-white text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        💬 {translations.askJanani}
      </motion.h2>

      <motion.div 
        className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <InputSection onReply={handleAiReply} />
      </motion.div>

    </div>
  </div>
</motion.div>

        {/* Enhanced AI Reply Section */}
        <div className="max-w-4xl mx-auto mb-8 min-h-[10px] transition-all duration-500">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: aiReply || isAiReplying ? 1 : 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-white/90 backdrop-blur-sm border-2 border-pink-200 rounded-2xl shadow-xl p-8 transition-all duration-300 ${
      aiReply || isAiReplying ? 'block' : 'hidden'
    }`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">J</span>
      </div>
      <h3 className="text-xl font-semibold text-pink-600">
        {translations.jananiSays}
      </h3>
    </div>

    {isAiReplying ? (
      <div className="flex items-center gap-2 text-gray-600">
        <div className="flex gap-1">
          <motion.div
            className="w-2 h-2 bg-pink-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-pink-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-pink-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
          />
        </div>
        <span className="text-sm">Janani is thinking...</span>
      </div>
    ) : (
      <div className="text-gray-800 text-lg leading-relaxed">
        {aiReply}
      </div>
    )}
  </motion.div>
</div>

        {/* Enhanced Doctor Visit Countdown */}
        <AnimatePresence>
          {reminderDate && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6 text-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  {translations.reminderTitle}
                </h3>
                <div className="flex flex-col items-center justify-center">
                  {getVisitStatusText()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Checklist + Reminder Grid */}
        <motion.div 
          className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Enhanced Checklist */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-pink-200"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              {translations.checklistTitle}
            </h2>
            <ul className="space-y-4">
              {CHECK_ITEMS.map((item, idx) => (
                <motion.li 
                  key={idx} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-pink-50 transition-colors duration-200"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.input
                    type="checkbox"
                    checked={checks[idx] || false}
                    onChange={async () => {
                      const updated = [...checks];
                      updated[idx] = !updated[idx];
                      setChecks(updated);
                      localStorage.setItem(todayKey(), JSON.stringify(updated));
                      if (updated.every(Boolean)) {
                        triggerCelebration();
                        await updateStreakInFirestore();
                      }
                    }}
                    className="w-6 h-6 text-pink-500 focus:ring-pink-400 rounded-md cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <motion.span 
                    className={`text-lg ${checks[idx] ? 'line-through text-gray-400' : 'text-gray-700'} transition-all duration-300`}
                    animate={{ opacity: checks[idx] ? 0.6 : 1 }}
                  >
                    {item}
                  </motion.span>
                  {checks[idx] && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500 text-xl"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Reminder */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-pink-200"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-pink-600 mb-6">{translations.reminderTitle}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">{translations.reminderLabel}</label>
                <motion.input 
                  type="date" 
                  value={reminderDate} 
                  onChange={(e) => setReminderDate(e.target.value)} 
                  className="w-full border-2 border-pink-200 rounded-lg p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">{translations.repeatLabel}</label>
                <motion.select 
                  value={reminderFreq} 
                  onChange={(e) => setReminderFreq(e.target.value)} 
                  className="w-full border-2 border-pink-200 rounded-lg p-3 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                >
                  {translations.frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </motion.select>
              </div>
              <motion.button 
                onClick={saveReminder} 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {translations.saveReminder}
              </motion.button>
              <AnimatePresence>
                {msg && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm text-center p-3 rounded-lg ${
                      msg.type === 'success' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}
                  >
                    {msg.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Streak Card */}
        <AnimatePresence>
          {streak > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <motion.div 
                className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl shadow-xl p-8 text-center"
                variants={pulseVariants}
                animate="pulse"
                whileHover={{ scale: 1.05 }}
              >
                <motion.h2 
                  className="text-3xl font-bold text-yellow-600 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {translations.streakTitle}
                </motion.h2>
                <motion.p 
                  className="text-2xl text-gray-700 font-semibold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {translations.streakText.replace('{streak}', streak)}
                </motion.p>
                <motion.p 
                  className="text-lg text-gray-600 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {translations.streakSubtext}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Features Grid */}
        <motion.div 
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {translations.features.map(({ key, title, desc, link }, index) => {
            let path = link;
            if (!path) {
              if (key === 'yoga') path = getYogaPath();
              if (key === 'ayurveda') path = getAyurvedaPath();
            }
            return (
              <motion.div 
                key={key || title} 
                variants={itemVariants}
                className="group cursor-pointer"
                whileHover="hover"
                initial="rest"
                animate="rest"
              >
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-pink-200 transition-all duration-300"
                  variants={cardHoverVariants}
                >
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={FEATURE_IMAGES[key?.toLowerCase()] || '/assets/placeholder.png'}
                      alt={title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <motion.h3 
                      className="text-xl font-bold mb-3 text-pink-600 group-hover:text-pink-700 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 mb-4 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                    >
                      {desc}
                    </motion.p>
                    {path && (
                      <motion.button 
                        onClick={() => navigate(path)} 
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 transform group-hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {translations.exploreNow}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Footer Section */}
        <motion.div 
          className="mt-20 mb-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-200">
            <motion.h3 
              className="text-2xl font-bold text-pink-600 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
            >
              {translations.downhead}
            </motion.h3>
            <motion.p 
              className="text-gray-700 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 }}
            >
             {translations.downcontent}
            </motion.p>
          </div>
        </motion.div>

      {/* Enhanced Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confetti 
              width={width} 
              height={height} 
              numberOfPieces={400} 
              recycle={false} 
              colors={['#ec4899', '#f43f5e', '#fbbf24', '#fb7185', '#f97316']}
            />
          </motion.div>
          
        )}
      </AnimatePresence>
    </div>
  );
  }


export default Dashboard;