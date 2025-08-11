"use client";

import { useEffect, useState } from 'react';
import { getPaymentByBookingId, makePayment } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  bookingId: string;
  onSuccess?: (response: any) => void;
}

// Payment DTO interface
interface PaymentDTO {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  createdAt: string;
  expiryTime: string;
  paymentMethod?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, onSuccess }) => {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [payment, setPayment] = useState<PaymentDTO | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Fetch payment data on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {

        const paymentData = await getPaymentByBookingId(bookingId);
        setPayment(paymentData);
      } catch (err: any) {
        setError('Failed to load payment details. Please refresh the page.');
      }
    };

    fetchPaymentData();
  }, [bookingId]);
  
  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.reload();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, router]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleWalletSelect = (wallet: string) => {
    setSelectedWallet(wallet);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
    setSelectedWallet(null); // Reset selected wallet
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
  
    try {
      // Validate card details if credit card is selected
      if (paymentMethod === 'CREDIT_CARD') {
        if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
          throw new Error('Please fill in all card details');
        }
      }

      if (paymentMethod === 'DIGITAL_WALLET') {
        if (!selectedWallet) {
          throw new Error('Please select an e-wallet provider');
        }
      }

      if (!payment) {
        throw new Error('Payment information not available');
      }


      // Call the updated processPayment function with all required parameters
      const response = await makePayment(
        payment.id,
        paymentMethod,
        payment.amount  // Pass the exact amount from props
      );
      
      // Handle successful payment
      if (onSuccess) {
        onSuccess(response);
      } else {
        // Default behavior - redirect to confirmation page
        router.push(`/booking/confirmation/${payment.bookingId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!payment) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-center py-10">
          <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg">Loading payment details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      {/* Countdown Timer */}
      <div className={`mb-6 p-4 rounded-lg text-center ${
        timeLeft <= 30 ? 'bg-red-900/30 border border-red-500/50' : 
        timeLeft <= 60 ? 'bg-yellow-900/30 border border-yellow-500/50' : 
        'bg-blue-900/30 border border-blue-500/50'
      }`}>
        <p className="text-sm text-gray-300 mb-1">Time Remaining to Complete Payment</p>
        <div className="text-3xl font-bold tracking-wider">
          <span className={`${
            timeLeft <= 30 ? 'text-red-400' : 
            timeLeft <= 60 ? 'text-yellow-400' : 
            'text-blue-400'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Your booking will be cancelled when the timer reaches zero
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
        Payment Details
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className="bg-gray-700 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-300">Booking ID</p>
          <p className="font-medium">#{bookingId}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-300">Payment ID</p>
          <p className="font-medium">#{payment.id}</p>
        </div>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/20 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount to Pay:</span>
          <span className="text-2xl font-bold text-green-400">RM {payment.amount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 rounded-lg cursor-pointer border ${paymentMethod === 'CREDIT_CARD' ? 'border-purple-500 bg-gray-700' : 'border-gray-700 bg-gray-800'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="CREDIT_CARD"
                checked={paymentMethod === 'CREDIT_CARD'}
                onChange={handlePaymentMethodChange}
                className="mr-3"
              />
              <div>
                <span className="block font-medium">Credit / Debit Card</span>
                <span className="text-xs text-gray-400">Visa, Mastercard, etc.</span>
              </div>
            </label>

            <label className={`flex items-center p-4 rounded-lg cursor-pointer border ${paymentMethod === 'DIGITAL_WALLET' ? 'border-purple-500 bg-gray-700' : 'border-gray-700 bg-gray-800'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="DIGITAL_WALLET"
                checked={paymentMethod === 'DIGITAL_WALLET'}
                onChange={handlePaymentMethodChange}
                className="mr-3"
              />
              <div>
                <span className="block font-medium">E-Wallet</span>
                <span className="text-xs text-gray-400">Touch 'n Go, GrabPay, etc.</span>
              </div>
            </label>
          </div>
        </div>

        {paymentMethod === 'CREDIT_CARD' && (
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>

            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-300 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={cardDetails.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'DIGITAL_WALLET' && (
          <div className="mb-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
            <p className="text-center mb-4">Select your E-Wallet provider:</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button 
                type="button" 
                onClick={() => handleWalletSelect('TNG')}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedWallet === 'TNG' 
                    ? 'bg-purple-900/30 border-purple-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                }`}
              >
                Touch 'n Go
              </button>
              <button 
                type="button"
                onClick={() => handleWalletSelect('GRAB')}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedWallet === 'GRAB' 
                    ? 'bg-purple-900/30 border-purple-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                }`}
              >
                GrabPay
              </button>
              <button 
                type="button"
                onClick={() => handleWalletSelect('BOOST')}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedWallet === 'BOOST' 
                    ? 'bg-purple-900/30 border-purple-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                }`}
              >
                Boost
              </button>
              <button 
                type="button"
                onClick={() => handleWalletSelect('SHOPEE')}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedWallet === 'SHOPEE' 
                    ? 'bg-purple-900/30 border-purple-500' 
                    : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                }`}
              >
                ShopeePay
              </button>
            </div>
            {selectedWallet ? (
              <p className="text-xs text-green-400 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                E-wallet selected
              </p>
            ) : (
              <p className="text-xs text-yellow-400 text-center">
                Please select an e-wallet provider
              </p>
            )}
          </div>
        )}

        <div className="mt-8">
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-white transition-colors ${
              isProcessing
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              `Pay RM ${payment.amount.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;