'use client'

import React, { useEffect, useState } from 'react'

type Config = {
  id?: string
  depositWallet: string
  depositCoin: string
  depositNetwork: string
}

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [config, setConfig] = useState<Config>({ depositWallet: '', depositCoin: 'USDT', depositNetwork: 'TRON (TRC20)' })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/config')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      if (data) setConfig(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setSuccess('Settings saved successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Configure deposit destination for user payments</p>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Wallet Address</label>
            <input
              type="text"
              value={config.depositWallet}
              onChange={(e) => setConfig({ ...config, depositWallet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="T... or 0x..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coin</label>
              <input
                type="text"
                value={config.depositCoin}
                onChange={(e) => setConfig({ ...config, depositCoin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="USDT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              <input
                type="text"
                value={config.depositNetwork}
                onChange={(e) => setConfig({ ...config, depositNetwork: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="TRON (TRC20)"
              />
            </div>
          </div>

          <div className="pt-2">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings