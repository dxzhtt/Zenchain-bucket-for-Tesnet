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
  chainId: '0x2108', // Chain ID 8440 dalam hex
  chainName: 'Zenchain Testnet',
  nativeCurrency: {
    name: 'ZTC',
    symbol: 'ZTC',
    decimals: 18,
  },
  rpcUrls: ['https://zenchain-testnet.api.onfinality.io/public'], // RPC utama
  blockExplorerUrls: ['https://explorer.zenchain.network'],
};

// Hubungkan ke MetaMask
connectButton.addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);

      // Periksa Chain ID saat ini
      const currentChainId = await web3.eth.getChainId();
      console.log('Current Chain ID:', currentChainId.toString(16));

      // Jika sudah di Zenchain Testnet (8440), lanjutkan
      if (currentChainId === parseInt('0x2108', 16)) {
        console.log('Sudah di jaringan Zenchain Testnet');
      } else {
        // Coba beralih ke Zenchain Testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2108' }],
          });
          console.log('Berhasil beralih ke Zenchain Testnet');
        } catch (switchError) {
          // Jika jaringan belum ada atau error lainnya
          if (switchError.code === 4902 || switchError.code === -32603) {
            console.log('Jaringan belum ada, menambahkan Zenchain Testnet');
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [zenchainNetwork],
              });
            } catch (addError) {
              console.error('Gagal menambahkan jaringan:', addError);
              alert('Gagal menambahkan jaringan: ' + addError.message);
              return;
            }
          } else {
            console.error('Gagal beralih jaringan:', switchError);
            alert('Gagal beralih jaringan: ' + switchError.message);
            return;
          }
        }
      }

      // Minta akun MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      walletAddress.textContent = accounts[0];
      walletInfo.style.display = 'block';
      sendButton.disabled = false;
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
