export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">NGO Management Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
          <p className="text-gray-600 mb-4">Manage your organization profile, contact information, and branding.</p>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-medium">Education for All Foundation</p>
            <p className="text-sm text-gray-500">contact@educationforall.org</p>
            <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-600 mb-4">Manage your personal account, security settings, and preferences.</p>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-gray-500">john.doe@educationforall.org</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <p className="text-gray-600 mb-4">Manage email notifications and alerts for your account.</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Email Notifications</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Donation Alerts</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Campaign Updates</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
        <p className="text-gray-600 mb-4">Manage your account security and privacy settings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Password Management</h3>
            <p className="text-sm text-gray-500 mb-4">Your password was last updated 30 days ago.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Change Password
            </button>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Connected Services</h2>
        <p className="text-gray-600 mb-4">Manage third-party services and integrations.</p>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="font-medium">MetaMask Wallet</p>
            <p className="text-xs text-gray-500">Connected on Apr 15, 2023</p>
          </div>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm">
            Disconnect
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Google Analytics</p>
            <p className="text-xs text-gray-500">Connected on Jan 10, 2023</p>
          </div>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm">
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}