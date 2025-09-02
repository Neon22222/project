'use client'

import React, { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import ChessHeader from '@/components/Layout/ChessHeader'
import ChessLoginForm from '@/components/Auth/ChessLoginForm'
import ChessRegisterForm from '@/components/Auth/ChessRegisterForm'
import ChessForgotPassword from '@/components/Auth/ChessForgotPassword'
import ChessDepositInstructions from '@/components/Deposit/ChessDepositInstructions'
import ChessDashboard from '@/components/Dashboard/ChessDashboard'
import ChessTriangleView from '@/components/Triangle/ChessTriangleView'
import ChessTriangleDetail from '@/components/Triangle/ChessTriangleDetail'
import ChessWallet from '@/components/Wallet/ChessWallet'
import ChessReferrals from '@/components/Referrals/ChessReferrals'
import ChessAdminDashboard from '@/components/Admin/ChessAdminDashboard'
import ChessAdminUsers from '@/components/Admin/ChessAdminUsers'
import ChessAdminTransactions from '@/components/Admin/ChessAdminTransactions'
import ChessAdminPlans from '@/components/Admin/ChessAdminPlans'
import ChessAdminSettings from '@/components/Admin/ChessAdminSettings'
import ChessNotificationContainer from '@/components/Notifications/ChessNotificationContainer'

const AppContent: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const [currentPage, setCurrentPage] = useState('login')
  const [pendingDeposit, setPendingDeposit] = useState<any>(null)

  const handleNavigate = (page: string) => {
    console.log('Navigating to:', page)
    setCurrentPage(page)
  }

  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      console.log('Refreshed user session:', session)
    } catch (error) {
      console.error('Failed to refresh user session:', error)
    }
  }

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === 'string') setCurrentPage(detail)
    }
    window.addEventListener('navigate', handler as EventListener)
    return () => window.removeEventListener('navigate', handler as EventListener)
  }, [])

  React.useEffect(() => {
    const pending = localStorage.getItem('pending_deposit')
    if (pending) {
      try {
        const deposit = JSON.parse(pending)
        setPendingDeposit(deposit)
        setCurrentPage('deposit-instructions')
      } catch (e) {
        localStorage.removeItem('pending_deposit')
      }
    }
  }, [])

  const renderPage = () => {
    console.log('App renderPage - State:', {
      pendingDeposit: !!pendingDeposit,
      currentPage,
      user: !!user,
      isAdmin
    })

    if (pendingDeposit && currentPage === 'deposit-instructions') {
      return (
        <ChessDepositInstructions
          depositInfo={pendingDeposit}
          onModalClose={() => {
            console.log('Modal closing - navigating to dashboard')
            localStorage.removeItem('pending_deposit')
            setPendingDeposit(null)
            refreshUserData().then(() => {
              setTimeout(() => {
                setCurrentPage('dashboard')
                console.log('Navigation to dashboard complete')
              }, 100)
            })
          }}
          onAccountDelete={() => {
            localStorage.removeItem('pending_deposit')
            setPendingDeposit(null)
            setCurrentPage('login')
          }}
        />
      )
    }

    if (!user && !isAdmin) {
      switch (currentPage) {
        case 'register':
          return <ChessRegisterForm onNavigate={handleNavigate} />
        case 'forgot-password':
          return <ChessForgotPassword onNavigate={handleNavigate} />
        default:
          return <ChessLoginForm onNavigate={handleNavigate} />
      }
    }

    if (isAdmin) {
      return (
        <div className="min-h-screen">
          <ChessHeader onNavigate={handleNavigate} currentPage={currentPage} />
          <main>
            {(() => {
              switch (currentPage) {
                case 'admin-users':
                  return <ChessAdminUsers />
                case 'admin-transactions':
                  return <ChessAdminTransactions />
                case 'admin-plans':
                  return <ChessAdminPlans />
                case 'admin-settings':
                  return <ChessAdminSettings />
                default:
                  return <ChessAdminDashboard />
              }
            })()}
          </main>
        </div>
      )
    }

    if (user) {
      return (
        <div className="min-h-screen">
          <ChessHeader onNavigate={handleNavigate} currentPage={currentPage} />
          <main>
            {(() => {
              switch (currentPage) {
                case 'triangle':
                  return <ChessTriangleView />
                case 'triangle-detail':
                  return <ChessTriangleDetail />
                case 'wallet':
                  return <ChessWallet />
                case 'referrals':
                  return <ChessReferrals />
                default:
                  return <ChessDashboard onNavigate={handleNavigate} />
              }
            })()}
          </main>
        </div>
      )
    }

    return <ChessLoginForm onNavigate={handleNavigate} />
  }

  return (
    <div className="App">
      {renderPage()}
      <ChessNotificationContainer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}