import React from "react";
import { Button } from "@/components/ui/button";

export default function InstallMetaMaskDemo() {
  const handleInstallClick = () => {
    window.open("https://metamask.io/download.html", "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-orange-50">
      <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask Logo" className="w-16 h-16 mb-2" />
      <h2 className="text-lg font-semibold mb-2">MetaMask Wallet Required</h2>
      <p className="text-sm text-muted-foreground mb-4 text-center">
        To use wallet features, you need to install the MetaMask browser extension.
      </p>
      <Button onClick={handleInstallClick} className="bg-orange-500 hover:bg-orange-600 text-white">
        Install MetaMask
      </Button>
    </div>
  );
}
