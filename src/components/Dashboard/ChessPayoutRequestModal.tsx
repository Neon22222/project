'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, DollarSign, Shield, Clock } from 'lucide-react'

interface ChessPayoutRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestPayout: (amount: number) => void
  availableBalance: number
}

const ChessPayoutRequestModal: React.FC<ChessPayoutRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestPayout,
  availableBalance
}) => {
  const [amount, setAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const requestAmount = parseFloat(amount)
    
    if (requestAmount <= 0 || requestAmount > availableBalance) {
      return
    }

    setIsSubmitting(true)
    try {
      await onRequestPayout(requestAmount)
      setAmount('')
      onClose()
    } catch (error) {
      console.error('Payout request failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString())
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-yellow-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-800">Request Royal Payout</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance
                </label>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-700">${availableBalance.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0.00"
                    min="0"
                    max={availableBalance}
                    step="0.01"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium hover:bg-yellow-200 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Security Notice</span>
                </div>
                <p className="text-xs text-blue-700">
                  Payout requests are processed securely and may take 24-48 hours to complete.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Processing Time</span>
                </div>
                <p className="text-xs text-amber-700">
                  All payout requests require admin approval for security purposes.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Request Payout'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChessPayoutRequestModal