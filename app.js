const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const copyButton = document.getElementById('copyButton');
const walletAddress = document.getElementById('walletAddress');
const txHash = document.getElementById('txHash');
const amountInput = document.getElementById('amount');
const walletInfo = document.getElementById('walletInfo');
const txInfo = document.getElementById('txInfo');

let web3;
let accounts;

// Alamat wallet penerima (alamat Anda)
const recipientAddress = '0x2D13D6F418696D89Cfa8E34dD13AfC8DAA5b0017';

// Konfigurasi jaringan Zenchain
const zenchainNetwork = {
  chainId: '0x20F8', // Chain ID 8408 dalam hex
  chainName: 'Zenchain Testnet',
  nativeCurrency: {
    name: 'ZTC',
    symbol: 'ZTC',
    decimals: 18,
  },
  rpcUrls: ['https://zenchain-testnet.api.onfinality.io/public'], // HTTPS RPC URL
  blockExplorerUrls: ['https://explorer.zenchain.network'], // Opsional, untuk explorer
};

// Hubungkan ke MetaMask
connectButton.addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      walletAddress.textContent = accounts[0];
      walletInfo.style.display = 'block';
      sendButton.disabled = false;

      // Tambahkan atau alihkan ke jaringan Zenchain
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x20F8' }],
        });
      } catch (switchError) {
        // Jika jaringan belum ada, tambahkan
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [zenchainNetwork],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Gagal menghubungkan MetaMask: ' + error.message);
    }
  } else {
    alert('Silakan instal MetaMask di browser Anda.');
  }
});

// Kirim ZTC
sendButton.addEventListener('click', async () => {
  const amount = amountInput.value;
  if (!amount || amount <= 0) {
    alert('Masukkan jumlah ZTC yang valid.');
    return;
  }

  try {
    const weiAmount = web3.utils.toWei(amount, 'ether');
    const tx = {
      from: accounts[0],
      to: recipientAddress,
      value: weiAmount,
      gas: 21000,
    };

    const txHashValue = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx],
    });

    txHash.textContent = txHashValue;
    txInfo.style.display = 'block';
  } catch (error) {
    console.error('Transaction error:', error);
    alert('Transaksi gagal: ' + error.message);
  }
});

// Copy Transaction Hash
copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(txHash.textContent).then(() => {
    alert('Transaction Hash disalin!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Gagal menyalin Transaction Hash.');
  });
});
