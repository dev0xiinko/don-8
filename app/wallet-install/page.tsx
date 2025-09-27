import InstallMetaMaskDemo from "@/components/features/wallet/InstallMetaMaskDemo";

export default function WalletInstallTutorialPage() {
  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">How to Install MetaMask Wallet</h1>
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-base">
        <li>
          Visit the official MetaMask website: <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">metamask.io/download.html</a>
        </li>
        <li>
          Choose your browser and click the install button to add the MetaMask extension.
        </li>
        <li>
          After installation, click the MetaMask icon in your browser toolbar.
        </li>
        <li>
          Follow the on-screen instructions to create a new wallet or import an existing one.
        </li>
        <li>
          Securely back up your secret recovery phrase. Never share it with anyone.
        </li>
        <li>
          Once set up, refresh this page and connect your wallet to start using DON-8.
        </li>
      </ol>
      <InstallMetaMaskDemo />
    </main>
  );
}
