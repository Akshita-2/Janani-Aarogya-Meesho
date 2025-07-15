  // src/components/Dashboard.jsx
  import React, { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import InputSection from './InputSection';
  import { getAuth } from 'firebase/auth';
  import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
  import { db } from '../firebase';
  import dayjs from 'dayjs';
  import Confetti from 'react-confetti';
  import { useWindowSize } from 'react-use';
  import { motion } from 'framer-motion';
  import HeroImage from '../assets/logo.png';
  import vaultImg from '../assets/vault.png';
  import yogaImg from '../assets/yoga.webp';
  import jrnlImg from '../assets/jrnl.jpg';
  import ayurvedaImg from '../assets/ayurveda.png';

  // ✅ keep keys all‑lowercase and exactly the same string
  const FEATURE_IMAGES = {
    journal:jrnlImg,
    memoryvault:vaultImg,
    ayurveda: ayurvedaImg,
    yoga:yogaImg        // renamed from “maternalYoga”
  };


  const TRANSLATIONS = {
    'hi-IN': {
      title: 'जननी आरोग्य',
      subtitle: 'हर भारतीय माँ के लिए एक कोमल साथी',
      description1: 'जननी आरोग्य ग्रामीण माताओं का समर्थन करने के लिए AI को प्राचीन भारतीय देखभाल ज्ञान के साथ जोड़ती है - गर्भावस्था से पहले, गर्भावस्था और प्रसवोत्तर में।',
      description2: 'वॉयस-प्रथम, भाषा-जागरूक और गहराई से व्यक्तिगत। आयुर्वेद से लेकर यादों तक, यह आपके साथ चलता है।',
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
      exploreNow: 'अभी एक्सप्लोर करें'
    },
    'en-IN': {
      title: 'Janani Aarogya',
      subtitle: 'A gentle companion for every Indian mother',
      description1: 'Janani Aarogya blends AI with ancient Indian care wisdom to support rural mothers — across pre-pregnancy, pregnancy, and postpartum.',
      description2: 'Voice-first, language-aware and deeply personal. From Ayurveda to memories, it walks with you.',
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
      exploreNow: 'Explore Now'
    },
    // Add other languages following the same pattern
    'ta-IN': {
    title: 'ஜனனி ஆரோக்கியம்',
    subtitle: 'ஒவ்வொரு இந்திய தாய்க்கும் ஒரு மென்மையான தோழர்',
    description1: 'ஜனனி ஆரோக்கியம் AIயை பண்டைய இந்திய பராமரிப்பு ஞானத்துடன் இணைத்து கிராமப்புற தாய்மார்களுக்கு ஆதரவாக உள்ளது - கர்ப்பத்திற்கு முன், கர்ப்பம் மற்றும் பிரசவத்திற்குப் பிந்தைய காலங்களில்.',
    description2: 'குரல்-முதல், மொழி-விழிப்புடன் மற்றும் ஆழமாக தனிப்பட்டது. ஆயுர்வேதத்தில் இருந்து நினைவுகள் வரை, அது உங்களுடன் நடக்கிறது.',
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
    reminderSuccess: 'நினைவூட்டல் சேமிக்கப்பட்டது!'
  },
    'te-IN': {
    title: 'జనని ఆరోగ్యం',
    subtitle: 'ప్రతి భారతీయ తల్లికి ఒక సున్నితమైన తోడుగా',
    description1: 'జనని ఆరోగ్యం AIని ప్రాచీన భారతీయ సంరక్షణ జ్ఞానంతో కలిపి గ్రామీణ తల్లులకు మద్దతుగా ఉంటుంది - గర్భధారణకు ముందు, గర్భధారణ మరియు ప్రసవానంతర కాలంలో.',
    description2: 'వాయిస్-ఫస్ట్, భాష-అవగాహన మరియు లోతైన వ్యక్తిగతం. ఆయుర్వేదం నుండి జ్ఞాపకాల వరకు, ఇది మీతో నడుస్తుంది.',
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
    reminderSuccess: 'రిమైండర్ సేవ్ చేయబడింది!'
  },'kn-IN': {
    title: 'ಜನನಿ ಆರೋಗ್ಯ',
    subtitle: 'ಪ್ರತಿ ಭಾರತೀಯ ತಾಯಿಗೆ ಒಂದು ಸೌಮ್ಯವಾದ ಸಂಗಾತಿ',
    description1: 'ಜನನಿ ಆರೋಗ್ಯ AIಯನ್ನು ಪ್ರಾಚೀನ ಭಾರತೀಯ ಸಂರಕ್ಷಣ ಜ್ಞಾನದೊಂದಿಗೆ ಸಂಯೋಜಿಸಿ ಗ್ರಾಮೀಣ ತಾಯಂದಿರಿಗೆ ಬೆಂಬಲವಾಗಿದೆ - ಗರ್ಭಧಾರಣೆಗೆ ಮುಂಚೆ, ಗರ್ಭಧಾರಣೆ ಮತ್ತು ಪ್ರಸವೋತ್ತರ ಅವಧಿಯಲ್ಲಿ.',
    description2: 'ಧ್ವನಿ-ಮೊದಲ, ಭಾಷಾ-ಸಚೇತನ ಮತ್ತು ಆಳವಾಗಿ ವೈಯಕ್ತಿಕ. ಆಯುರ್ವೇದದಿಂದ ನೆನಪುಗಳವರೆಗೆ, ಅದು ನಿಮ್ಮೊಂದಿಗೆ ನಡೆಯುತ್ತದೆ.',
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
    reminderSuccess: 'ಜ್ಞಾಪನೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ!'
  },'mr-IN': {
    title: 'जननी आरोग्य',
    subtitle: 'प्रत्येक भारतीय आईसाठी एक कोमल साथीदार',
    description1: 'जननी आरोग्य AI ला प्राचीन भारतीय काळजी ज्ञानासोबत एकत्रित करून ग्रामीण आईंना पाठबळ देते - गर्भधारणेपूर्वी, गर्भधारणा आणि प्रसूतोत्तर काळात.',
    description2: 'आवाज-प्रथम, भाषा-जागृत आणि खोलवर वैयक्तिक. आयुर्वेदापासून आठवणींपर्यंत, ते तुमच्यासोबत चालते.',
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
    reminderSuccess: 'आठवण जतन केली!'
  },'gu-IN': {
    title: 'જનની આરોગ્ય',
    subtitle: 'દરેક ભારતીય માતા માટે એક નરમ સાથી',
    description1: 'જનની આરોગ્ય AIને પ્રાચીન ભારતીય સંભાળ જ્ઞાન સાથે જોડી ગ્રામીણ માતાઓને ટેકો આપે છે - ગર્ભાવસ્થા પહેલાં, ગર્ભાવસ્થા અને પ્રસૂતિ પછીના સમયમાં.',
    description2: 'વોઇસ-ફર્સ્ટ, ભાષા-જાગૃત અને ઊંડી વ્યક્તિગત. આયુર્વેદથી યાદો સુધી, તે તમારી સાથે ચાલે છે.',
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
    reminderSuccess: 'રિમાઇન્ડર સેવ થયું!'
  },'bn-IN': {
    title: 'জননী আরোগ্য',
    subtitle: 'প্রতিটি ভারতীয় মায়ের জন্য একটি কোমল সঙ্গী',
    description1: 'জননী আরোগ্য AI-কে প্রাচীন ভারতীয় পরিচর্যার জ্ঞানের সাথে মিলিয়ে গ্রামীণ মায়েদের সহায়তা করে - গর্ভধারণের আগে, গর্ভাবস্থা এবং প্রসবোত্তর সময়ে।',
    description2: 'ভয়েস-প্রথম, ভাষা-সচেতন এবং গভীরভাবে ব্যক্তিগত। আয়ুর্বেদ থেকে স্মৃতি পর্যন্ত, এটি আপনার সাথে হাঁটে।',
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
    reminderSuccess: 'রিমাইন্ডার সেভ করা হয়েছে!'
  },'ml-IN': {
    title: 'ജനനി ആരോഗ്യ',
    subtitle: 'ഓരോ ഭാരതീയ അമ്മയ്ക്കും ഒരു സ്നേഹപൂർണ്ണ അനുയായി',
    description1: 'ജനനി ആരോഗ്യ പുരാതന ഇന്ത്യൻ പരിചരണജ്ഞാനവുമായി AIയെ ചേർത്ത്, ഗർഭധാരണത്തിന് മുമ്പ് മുതൽ ഗർഭകാലത്തിലും പ്രസവാനന്തരകാലത്തും ഗ്രാമീണ അമ്മമാരെ സഹായിക്കുന്നു.',
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
    reminderSuccess: 'ഓർമ്മിപ്പിക്കൽ സേവ് ചെയ്തു!'
  },'pa-IN': {
    title: 'ਜਨਨੀ ਆਰੋਗਿਆ',
    subtitle: 'ਹਰ ਭਾਰਤੀ ਮਾਂ ਲਈ ਇੱਕ ਨਰਮ ਸਾਥੀ',
    description1: 'ਜਨਨੀ ਆਰੋਗਿਆ ਏਆਈ ਨੂੰ ਪ੍ਰਾਚੀਨ ਭਾਰਤੀ ਦੇਖਭਾਲ ਦੇ ਗਿਆਨ ਨਾਲ ਜੋੜਦੀ ਹੈ ਤਾਂ ਜੋ ਪੈਂਡੂ ਮਾਵਾਂ ਦੀ ਮਦਦ ਕੀਤੀ ਜਾ ਸਕੇ - ਗਰਭ ਧਾਰਣ ਤੋਂ ਪਹਿਲਾਂ, ਗਰਭਾਵਸਥਾ ਦੌਰਾਨ ਅਤੇ ਜਣਮ ਤੋਂ ਬਾਅਦ।',
    description2: 'ਆਵਾਜ਼-ਪਹਿਲਾਂ, ਭਾਸ਼ਾ-ਸਚੇਤ ਅਤੇ ਡੂੰਘੀ ਤਰ੍ਹਾਂ ਨਿੱਜੀ। ਆਯੁਰਵੇਦ ਤੋਂ ਲੈ ਕੇ ਯਾਦਾਂ ਤੱਕ, ਇਹ ਤੁਹਾਡੇ ਨਾਲ ਚੱਲਦੀ ਹੈ।',
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
    reminderSuccess: 'ਰੀਮਾਈਂਡਰ ਸੇਵ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ!'
  }


    // Continue for other languages
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

    const auth = getAuth();
    const navigate = useNavigate();
    const { width, height } = useWindowSize();

    useEffect(() => {
      const savedLang = localStorage.getItem('lang') || 'en-IN';
      setLanguage(savedLang);
      setTranslations(TRANSLATIONS[savedLang] || TRANSLATIONS['en-IN']);
    }, []);

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

    useEffect(() => {
      const unsub = auth.onAuthStateChanged(async (user) => {
        if (!user) return;
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setStage(d.stage || 'prepregnancy');
          setStreak(d.streak || 0);
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

    const saveReminder = async () => {
      const user = auth.currentUser;
      if (!user) return;
      if (!reminderDate) {
        setMsg({ type: 'error', text: translations.reminderError || 'Please pick a date.' });
        return;
      }
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'reminder', 'settings'),
          {
            email: user.email,
            date: reminderDate,
            frequency: reminderFreq,
          },
          { merge: true }
        );
        setMsg({ type: 'success', text: translations.reminderSuccess || 'Reminder saved!' });
      } catch (err) {
        console.error(err);
        setMsg({ type: 'error', text: translations.reminderError || 'Could not save reminder.' });
      }
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
      <div className="min-h-screen bg-rose-50 relative overflow-x-hidden">
        {/* Navbar */}
        <nav className="bg-white shadow-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-rose-200">
          <h1 className="text-2xl font-extrabold text-rose-600 tracking-wide">{translations.title}</h1>
          <div className="flex gap-4 items-center text-sm font-semibold text-gray-700">
            {streak > 0 && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">🔥 {streak}-{translations.dayStreak || 'day Streak'}</span>}
            <button onClick={() => navigate('/journal')} className="hover:text-rose-600">{translations.journal || 'Journal'}</button>
            <button onClick={() => navigate('/memory-vault')} className="hover:text-rose-600">{translations.memoryVault || 'Memory Vault'}</button>
            <button onClick={() => navigate(getAyurvedaPath())} className="hover:text-rose-600">{translations.ayurveda || 'Ayurveda'}</button>
            <button onClick={() => navigate(getYogaPath())} className="hover:text-rose-600">{translations.yoga || 'Yoga'}</button>
            <button onClick={() => navigate('/profile')} className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center hover:ring hover:ring-rose-300">👤</button>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto mt-6 bg-white border border-rose-100 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row items-center gap-8 hover:shadow-pink-200"
        >
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex-1">
            <h2 className="text-4xl font-bold text-rose-700 mb-4 leading-snug">{translations.subtitle}</h2>
            <p className="text-gray-700 mb-2 leading-relaxed">{translations.description1}</p>
            <p className="text-gray-700">{translations.description2}</p>
          </motion.div>
          <motion.img src={HeroImage} alt="Hero" className="w-full md:w-80 rounded-xl shadow-md object-cover" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} />
        </motion.section>

        {/* Input Section + AI Reply */}
        <div className="mt-8 px-4">
          <div className="flex justify-center">
            <InputSection onReply={setAiReply} />
          </div>
          {aiReply && (
            <div className="mt-4 mx-auto w-11/12 md:w-2/3 bg-white p-4 rounded-lg shadow text-gray-800">
              <strong>{translations.jananiSays || 'Janani Says'}:</strong>
              <div>{aiReply}</div>
            </div>
          )}

          {/* Checklist + Reminder */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Checklist */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-pink-600 mb-3">{translations.checklistTitle}</h2>
              <ul className="space-y-2">
                {CHECK_ITEMS.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <input
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
                      className="w-5 h-5 text-pink-500 focus:ring-pink-400"
                    />
                    <span className={checks[idx] ? 'line-through text-gray-400' : 'text-gray-700'}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reminder */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-pink-600 mb-3">{translations.reminderTitle}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{translations.reminderLabel}</label>
                  <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{translations.repeatLabel}</label>
                  <select value={reminderFreq} onChange={(e) => setReminderFreq(e.target.value)} className="w-full border rounded p-2">
                    {translations.frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <button onClick={saveReminder} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-medium">
                  {translations.saveReminder}
                </button>
                {msg && (
                  <p className={`text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Streak Card */}
          {streak > 0 && (
            <div className="mt-6 max-w-xl mx-auto bg-white border-2 border-yellow-300 rounded-lg shadow-md p-6 text-center animate-pulse">
              <h2 className="text-xl font-bold text-yellow-600 mb-1">{translations.streakTitle}</h2>
              <p className="text-lg text-gray-700">{translations.streakText.replace('{streak}', streak)}</p>
              <p className="text-sm text-gray-500 mt-1">{translations.streakSubtext}</p>
            </div>
          )}

          {/* Features Grid with local images */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
            {translations.features.map(({ key, title, desc, link }) => {
              let path = link;
              if (!path) {
                if (key === 'yoga') path = getYogaPath();
                if (key === 'ayurveda') path = getAyurvedaPath();
              }
              return (
                <div key={key || title} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                  <img
                    src={FEATURE_IMAGES[key?.toLowerCase()] || '/assets/placeholder.png'}
                    alt={title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-pink-600">{title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{desc}</p>
                    {path && (
                      <button onClick={() => navigate(path)} className="text-sm font-medium text-white bg-pink-500 px-4 py-1.5 rounded hover:bg-pink-600">
                        {translations.exploreNow}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <Confetti width={width} height={height} numberOfPieces={280} recycle={false} />
          </div>
        )}
      </div>
    );
  }

  export default Dashboard;