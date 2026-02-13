import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, Heart, Users, BookOpen, Church, Building, X, Copy, CheckCircle, Download, QrCode } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Donation = () => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donationPurpose, setDonationPurpose] = useState('general');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    anonymous: false
  });
  const [showForm, setShowForm] = useState(false);
  const { language } = useLanguage(); // Use the global language context
  
  // Language translations
  const translations = {
    english: {
      // Header
      supportMinistry: "Support Our Ministry",
      donationDesc: "Make a donation to support our church ministry. All transactions are secure and verified.",
      
      // Success Modal
      thankYou: "Thank You!",
      donationSuccess: "Your donation of ₹{amount} has been submitted successfully.",
      close: "Close",
      
      // Payment Details
      paymentDetails: "Payment Details",
      amountToTransfer: "Amount to Transfer",
      upiPaymentOptions: "UPI Payment Options",
      scanQrCode: "Scan QR Code to Pay",
      autoConfigured: "Automatically configured for ₹{amount}",
      purpose: "Purpose: {purpose}",
      downloadQr: "Download QR",
      orUseDetails: "Or use these details:",
      upiId: "UPI ID",
      amount: "Amount",
      accountName: "Account Name",
      copyUpiLink: "Copy UPI Payment Link",
      reference: "Reference: {reference}",
      paymentDone: "Payment Done",
      
      // Donation Selection
      chooseDonation: "Choose Your Donation",
      selectPurposeAmount: "Select the purpose and amount for your donation",
      donationPurpose: "Donation Purpose",
      selectAmount: "Select Amount",
      enterCustomAmount: "Enter custom amount",
      qrCodePreview: "QR Code Preview",
      readyForPayment: "Ready for payment",
      proceedToDonation: "Proceed to Donation ₹{amount}",
      
      // Donation Form
      completeDonation: "Complete Your Donation",
      donorInformation: "Donor Information",
      fullName: "Full Name *",
      enterFullName: "Enter your full name",
      emailAddress: "Email Address *",
      enterEmail: "Enter your email",
      phoneNumber: "Phone Number",
      enterPhone: "Enter your phone number",
      makeAnonymous: "Make this donation anonymous",
      proceedToPayment: "Proceed to Payment ₹{amount}",
      
      // Validation
      fillRequiredFields: "Please fill all required fields",
      selectEnterAmount: "Please select or enter an amount",
      
      // Donation Purposes
      generalFund: "General Fund",
      generalDesc: "Support church operations",
      buildingFund: "Building Fund",
      buildingDesc: "Construction & maintenance",
      missionWork: "Mission Work",
      missionDesc: "Evangelism & outreach",
      charityWork: "Charity Work",
      charityDesc: "Help those in need",
      education: "Education",
      educationDesc: "Educational programs",
      youthMinistry: "Youth Ministry",
      youthDesc: "Youth programs & activities"
    },
    tamil: {
      // Header
      supportMinistry: "எங்கள் ஊழியத்தை ஆதரியுங்கள்",
      donationDesc: "எங்கள் திருச்சபை ஊழியத்தை ஆதரிக்க நன்கொடை அளியுங்கள். அனைத்து பரிவர்த்தனைகளும் பாதுகாப்பானவை மற்றும் சரிபார்க்கப்பட்டவை.",
      
      // Success Modal
      thankYou: "நன்றி!",
      donationSuccess: "உங்கள் ₹{amount} நன்கொடை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",
      close: "மூடு",
      
      // Payment Details
      paymentDetails: "கட்டண விவரங்கள்",
      amountToTransfer: "பரிமாற்ற வேண்டிய தொகை",
      upiPaymentOptions: "UPI கட்டண விருப்பங்கள்",
      scanQrCode: "செலுத்த QR குறியீட்டை ஸ்கேன் செய்யவும்",
      autoConfigured: "₹{amount}க்கு தானாகவே உள்ளமைக்கப்பட்டது",
      purpose: "நோக்கம்: {purpose}",
      downloadQr: "QR-ஐ பதிவிறக்கு",
      orUseDetails: "அல்லது இந்த விவரங்களைப் பயன்படுத்தவும்:",
      upiId: "UPI ஐடி",
      amount: "தொகை",
      accountName: "கணக்கு பெயர்",
      copyUpiLink: "UPI கட்டண இணைப்பை நகலெடுக்கவும்",
      reference: "குறிப்பு: {reference}",
      paymentDone: "கட்டணம் செலுத்தப்பட்டது",
      
      // Donation Selection
      chooseDonation: "உங்கள் நன்கொடையைத் தேர்ந்தெடுங்கள்",
      selectPurposeAmount: "உங்கள் நன்கொடைக்கான நோக்கம் மற்றும் தொகையைத் தேர்ந்தெடுங்கள்",
      donationPurpose: "நன்கொடை நோக்கம்",
      selectAmount: "தொகையைத் தேர்ந்தெடுக்கவும்",
      enterCustomAmount: "விருப்ப தொகையை உள்ளிடவும்",
      qrCodePreview: "QR குறியீடு முன்னோட்டம்",
      readyForPayment: "கட்டணத்திற்கு தயாராக உள்ளது",
      proceedToDonation: "நன்கொடைக்கு தொடரவும் ₹{amount}",
      
      // Donation Form
      completeDonation: "உங்கள் நன்கொடையை முடிக்கவும்",
      donorInformation: "நன்கொடையாளர் தகவல்",
      fullName: "முழு பெயர் *",
      enterFullName: "உங்கள் முழு பெயரை உள்ளிடவும்",
      emailAddress: "மின்னஞ்சல் முகவரி *",
      enterEmail: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
      phoneNumber: "தொலைபேசி எண்",
      enterPhone: "உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்",
      makeAnonymous: "இந்த நன்கொடையை அநாமதேயமாக்கவும்",
      proceedToPayment: "கட்டணத்திற்கு தொடரவும் ₹{amount}",
      
      // Validation
      fillRequiredFields: "அனைத்து தேவையான புலங்களையும் நிரப்பவும்",
      selectEnterAmount: "தயவுசெய்து ஒரு தொகையைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்",
      
      // Donation Purposes
      generalFund: "பொது நிதி",
      generalDesc: "திருச்சபை செயல்பாடுகளை ஆதரிக்கவும்",
      buildingFund: "கட்டிட நிதி",
      buildingDesc: "கட்டுமானம் & பராமரிப்பு",
      missionWork: "மிஷன் பணி",
      missionDesc: "நற்செய்தி பரப்புதல் & அவுட்ரீச்",
      charityWork: "தொண்டு பணி",
      charityDesc: "தேவைப்படுவோருக்கு உதவுங்கள்",
      education: "கல்வி",
      educationDesc: "கல்வி திட்டங்கள்",
      youthMinistry: "இளைஞர் ஊழியம்",
      youthDesc: "இளைஞர் திட்டங்கள் & செயல்பாடுகள்"
    }
  };
  
  // Get current language translations
  const t = translations[language] || translations['english'];

  // Bank account details
  const bankDetails = {
    accountName: "Church Ministry Fund",
    accountNumber: "1760194000009670",
    ifscCode: "KVBL0001760",
    bankName: "State Bank Of India",
    branch: "CHENNAI - KUNDRATHUR",
    upiId: "ajcsiluvairaja@oksbi"
  };

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const donationPurposes = useMemo(() => [
    { id: 'general', name: 'General Fund', description: 'Support church operations', icon: Church },
    { id: 'building', name: 'Building Fund', description: 'Construction & maintenance', icon: Building },
    { id: 'mission', name: 'Mission Work', description: 'Evangelism & outreach', icon: Users },
    { id: 'charity', name: 'Charity Work', description: 'Help those in need', icon: Heart },
    { id: 'education', name: 'Education', description: 'Educational programs', icon: BookOpen },
    { id: 'youth', name: 'Youth Ministry', description: 'Youth programs & activities', icon: Users }
  ], []);

  const getAmount = useCallback(() => customAmount || selectedAmount, [customAmount, selectedAmount]);

  // Generate QR Code URL using QR Server API
  const generateQRCode = useCallback((amount) => {
    if (!amount) return '';
    
    // Create UPI payment URL
    const purpose = donationPurposes.find(p => p.id === donationPurpose)?.name || 'General Fund';
    const reference = donorInfo.name ? `${donorInfo.name} - ${purpose}` : purpose;
    
    const upiUrl = `upi://pay?pa=${bankDetails.upiId}&pn=${encodeURIComponent(bankDetails.accountName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(reference)}`;
    
    // Use QR Server API to generate QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    
    return qrUrl;
  }, [donationPurpose, donorInfo.name, bankDetails.upiId, bankDetails.accountName, donationPurposes]);

  // Update QR code when amount or purpose changes
  useEffect(() => {
    const amount = getAmount();
    if (amount && showPaymentDetails) {
      setQrCodeUrl(generateQRCode(amount));
    }
  }, [getAmount, generateQRCode, showPaymentDetails]);

  const handleDonationSubmit = () => {
    if (!donorInfo.name || !donorInfo.email || !getAmount()) {
      alert(t.fillRequiredFields);
      return;
    }
    
    setShowPaymentDetails(true);
  };

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    setShowPaymentDetails(false);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `donation-qr-${getAmount()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setSelectedAmount('');
    setCustomAmount('');
    setDonationPurpose('general');
    setQrCodeUrl('');
    setDonorInfo({
      name: '',
      email: '',
      phone: '',
      anonymous: false
    });
    setShowForm(false);
    setShowPaymentDetails(false);
  };

  const handleProceedToDonate = () => {
    if (!getAmount()) {
      alert(t.selectEnterAmount);
      return;
    }
    setShowForm(true);
  };

  const getPurposeIcon = (purposeId) => {
    const purpose = donationPurposes.find(p => p.id === purposeId);
    const IconComponent = purpose?.icon || Church;
    return <IconComponent className="w-5 h-5" />;
  };

  const copyUPIString = () => {
    const purpose = donationPurposes.find(p => p.id === donationPurpose)?.name || 'General Fund';
    const reference = donorInfo.name ? `${donorInfo.name} - ${purpose}` : purpose;
    const upiString = `upi://pay?pa=${bankDetails.upiId}&pn=${encodeURIComponent(bankDetails.accountName)}&am=${getAmount()}&cu=INR&tn=${encodeURIComponent(reference)}`;
    
    copyToClipboard(upiString, 'upiString');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">{t.supportMinistry}</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t.donationDesc}
          </p>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.thankYou}</h3>
              <p className="text-gray-600 mb-4">
                {t.donationSuccess.replace('{amount}', getAmount())}
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  resetForm();
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:scale-105 transition-transform"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}

        {/* Payment Details Modal */}
        {showPaymentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{t.paymentDetails}</h3>
                <button
                  onClick={() => setShowPaymentDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-semibold mb-1 text-sm">{t.amountToTransfer}</p>
                  <p className="text-xl font-bold text-amber-600">₹{getAmount()}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 text-sm">{t.upiPaymentOptions}</h4>
                  
                  {/* Dynamic QR Code Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium text-gray-800 text-sm">{t.scanQrCode}</h5>
                      </div>
                      <div className="flex justify-center mb-3">
                        <div className="bg-white p-3 rounded-lg shadow-md">
                          {qrCodeUrl ? (
                            <img 
                              src={qrCodeUrl}
                              alt="Dynamic UPI QR Code for Payment" 
                              className="w-32 h-32 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded">
                              <QrCode className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="w-32 h-32 hidden items-center justify-center bg-gray-100 rounded">
                            <QrCode className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {t.autoConfigured.replace('{amount}', getAmount())}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {t.purpose.replace('{purpose}', donationPurposes.find(p => p.id === donationPurpose)?.name)}
                      </p>
                      <button
                        onClick={downloadQRCode}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Download className="w-3 h-3" />
                        {t.downloadQr}
                      </button>
                    </div>
                  </div>
                  
                  {/* Manual UPI Details */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 font-medium">{t.orUseDetails}</p>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">{t.upiId}</p>
                        <p className="font-mono text-xs">{bankDetails.upiId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails.upiId, 'upi')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {copiedField === 'upi' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">{t.amount}</p>
                        <p className="font-semibold text-xs">₹{getAmount()}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getAmount().toString(), 'amount')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {copiedField === 'amount' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-600">{t.accountName}</p>
                      <p className="font-medium text-xs">{bankDetails.accountName}</p>
                    </div>

                    <button
                      onClick={copyUPIString}
                      className="w-full bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      {copiedField === 'upiString' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {t.copyUpiLink}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-xs">
                    {t.reference.replace('{reference}', `${donorInfo.name} - ${donationPurposes.find(p => p.id === donationPurpose)?.name}`)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPaymentDetails(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                  >
                    {t.close}
                  </button>
                  <button
                    onClick={handlePaymentSuccess}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-medium hover:scale-105 transition-transform text-sm"
                  >
                    {t.paymentDone}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showForm ? (
          // Amount Selection Screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{t.chooseDonation}</h2>
                <p>{t.selectPurposeAmount}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Purpose Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.donationPurpose}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donationPurposes.map((purpose) => {
                      const IconComponent = purpose.icon;
                      return (
                        <button
                          key={purpose.id}
                          type="button"
                          onClick={() => setDonationPurpose(purpose.id)}
                          className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                            donationPurpose === purpose.id
                              ? 'border-amber-500 bg-amber-50 shadow-lg'
                              : 'border-gray-200 hover:border-amber-300 hover:shadow-md'
                          }`}
                        >
                          <IconComponent className={`w-8 h-8 mb-2 ${
                            donationPurpose === purpose.id ? 'text-amber-600' : 'text-gray-600'
                          }`} />
                          <div className="font-semibold text-gray-800">
                            {t[purpose.id + 'Fund'] || purpose.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {t[purpose.id + 'Desc'] || purpose.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.selectAmount}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {predefinedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all hover:scale-105 ${
                          selectedAmount === amt
                            ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg'
                            : 'border-gray-200 hover:border-amber-300 hover:shadow-md'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t.enterCustomAmount}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                      min="1"
                      className="w-full p-4 pl-8 border-2 border-gray-200 rounded-xl text-lg focus:border-amber-500 focus:outline-none"
                    />
                    <span className="absolute left-4 top-4 text-gray-500">₹</span>
                  </div>

                  {/* Live QR Code Preview */}
                  {getAmount() && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <img 
                            src={generateQRCode(getAmount())}
                            alt="Preview QR Code" 
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{t.qrCodePreview}</p>
                          <p className="text-xs text-gray-600">₹{getAmount().toLocaleString()} for {t[donationPurpose + 'Fund'] || donationPurposes.find(p => p.id === donationPurpose)?.name}</p>
                          <p className="text-xs text-blue-600">{t.readyForPayment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToDonate}
                  disabled={!getAmount()}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                    !getAmount()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-lg'
                  }`}
                >
                  {t.proceedToDonation.replace('{amount}', getAmount() ? getAmount().toLocaleString() : '0')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Donation Form Screen
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t.completeDonation}</h2>
                <div className="flex items-center gap-2">
                  {getPurposeIcon(donationPurpose)}
                  <span>₹{getAmount().toLocaleString()} for {t[donationPurpose + 'Fund'] || donationPurposes.find(p => p.id === donationPurpose)?.name}</span>
                </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Donor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                      required
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder={t.enterFullName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.emailAddress}
                    </label>
                    <input
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                      required
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder={t.enterEmail}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phoneNumber}
                    </label>
                    <input
                      type="tel"
                      value={donorInfo.phone}
                      onChange={(e) => setDonorInfo({...donorInfo, phone: e.target.value})}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder={t.enterPhone}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={donorInfo.anonymous}
                      onChange={(e) => setDonorInfo({...donorInfo, anonymous: e.target.checked})}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                      {t.makeAnonymous}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleDonationSubmit}
                  disabled={!donorInfo.name || !donorInfo.email}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                    !donorInfo.name || !donorInfo.email
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-lg'
                  }`}
                >
                  {t.proceedToPayment.replace('{amount}', getAmount().toLocaleString())}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donation;