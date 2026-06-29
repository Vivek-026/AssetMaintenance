import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../axiosConfig'
import toast from 'react-hot-toast'
import AssetForm from '../forms/AssetForm'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PageHeader from '../components/common/PageHeader'
import { PageLoading } from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import SearchBar from '../components/common/SearchBar'

const ManageAssets = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Please login to access this page')
      navigate('/login')
      return
    }
    fetchAssets()
  }, [token, navigate])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(BASE_URL + 'asset', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssets(response.data)
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please login again.')
        navigate('/login')
      } else {
        toast.error('Failed to fetch assets')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAsset = async (formData) => {
    if (!formData.assetName || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await axios.post(BASE_URL + 'asset', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      toast.success('Asset created successfully')
      setShowCreateForm(false)
      fetchAssets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create asset')
    }
  }

  const handleUpdateAsset = async (formData) => {
    if (!formData.assetName || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      await axios.put(BASE_URL + `asset/${editingAsset.assetId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      toast.success('Asset updated successfully')
      setEditingAsset(null)
      fetchAssets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update asset')
    }
  }

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return
    try {
      await axios.delete(BASE_URL + `asset/${assetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Asset deleted successfully')
      fetchAssets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete asset')
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      toast.error('Please enter a search keyword')
      return
    }

    try {
      setIsSearching(true)
      const response = await axios.get(BASE_URL + `asset/search?keyword=${encodeURIComponent(searchKeyword)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssets(response.data)
      if (response.data.length === 0) {
        toast.info('No assets found matching your search')
      }
    } catch (error) {
      toast.error('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    fetchAssets()
  }

  if (loading) return <PageLoading message="Loading assets..." />

  return (
    <div>
      <PageHeader
        title="Manage Assets"
        subtitle={`${assets.length} assets in the system`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => { setShowCreateForm(true); setEditingAsset(null) }}>
              + Create New Asset
            </Button>
          </>
        }
      />

      {/* Create Form */}
      {showCreateForm && (
        <AssetForm
          onSubmit={handleCreateAsset}
          onCancel={() => setShowCreateForm(false)}
          isEditing={false}
        />
      )}

      {/* Edit Form */}
      {editingAsset && (
        <AssetForm
          initialData={editingAsset}
          onSubmit={handleUpdateAsset}
          onCancel={() => setEditingAsset(null)}
          isEditing={true}
        />
      )}

      <SearchBar
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        placeholder="Search assets by code, name, location, or manufacturer..."
      />

      {isSearching && (
        <div className="text-center py-4">
          <p className="text-gray-600">Searching...</p>
        </div>
      )}

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <Card>
          <EmptyState
            title="No assets found"
            description="Create your first asset to get started."
            action={
              <Button onClick={() => setShowCreateForm(true)}>
                + Create Asset
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manufacturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map(asset => (
                  <tr key={asset.assetId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.assetCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{asset.assetName}</div>
                      {asset.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs line-clamp-2">
                          {asset.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.assetType?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{asset.manufacturer || 'N/A'}</div>
                      {asset.model && (
                        <div className="text-xs text-gray-400">{asset.model}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => { setEditingAsset(asset); setShowCreateForm(false) }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteAsset(asset.assetId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default ManageAssets
