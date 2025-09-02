'use client'

import React from 'react'
import { motion } from 'framer-motion'

const ChessAdminSettings: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <motion.span
                className="mr-3 text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.span>
              Royal System Configuration
            </h1>
            <p className="text-gray-400 mt-2">Configure kingdom settings and system parameters</p>
          </motion.div>

          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-6xl mb-4">🏰</div>
            <h3 className="text-2xl font-bold text-white mb-4">System Settings</h3>
            <p className="text-gray-400">Royal configuration panel coming soon...</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChessAdminSettings